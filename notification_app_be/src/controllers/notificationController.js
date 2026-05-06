const Notification = require('../models/Notification');
const { Log } = require('../middleware/logging');

// GET /api/v1/notifications
exports.listNotifications = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      page = 1,
      limit = 20,
      read,
      type,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const filter = { userId };
    if (read !== undefined) filter.read = read === 'true';
    if (type) filter.type = type;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const [notifications, totalItems] = await Promise.all([
      Notification.find(filter)
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Notification.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (err) {
    Log('backend', 'error', 'handler', `listNotifications failed: ${err.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message, status: 500 },
    });
  }
};

// GET /api/v1/notifications/unread/count
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      userId: req.user.userId,
      read: false,
    });
    res.json({ success: true, data: { unreadCount } });
  } catch (err) {
    Log('backend', 'error', 'handler', `getUnreadCount failed: ${err.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message, status: 500 },
    });
  }
};

// GET /api/v1/notifications/:id
exports.getNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Notification with id '${req.params.id}' not found`,
          status: 404,
        },
      });
    }

    res.json({ success: true, data: notification });
  } catch (err) {
    Log('backend', 'error', 'handler', `getNotification failed: ${err.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message, status: 500 },
    });
  }
};

// PATCH /api/v1/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Notification with id '${req.params.id}' not found`,
          status: 404,
        },
      });
    }

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.userId}`).emit('notification:read', {
        id: notification.id,
      });
    }

    res.json({
      success: true,
      data: { id: notification.id, read: true, updatedAt: notification.updatedAt },
    });
  } catch (err) {
    Log('backend', 'error', 'handler', `markAsRead failed: ${err.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message, status: 500 },
    });
  }
};

// PATCH /api/v1/notifications/read/all
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.userId, read: false },
      { $set: { read: true } }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.userId}`).emit('notification:readAll', {
        modifiedCount: result.modifiedCount,
      });
    }

    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        message: 'All notifications marked as read',
      },
    });
  } catch (err) {
    Log('backend', 'error', 'handler', `markAllAsRead failed: ${err.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message, status: 500 },
    });
  }
};

// DELETE /api/v1/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Notification with id '${req.params.id}' not found`,
          status: 404,
        },
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.userId}`).emit('notification:deleted', {
        id: req.params.id,
      });
    }

    res.json({
      success: true,
      data: { message: 'Notification deleted successfully' },
    });
  } catch (err) {
    Log('backend', 'error', 'handler', `deleteNotification failed: ${err.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message, status: 500 },
    });
  }
};

// POST /api/v1/notifications
exports.createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, priority, metadata, actionUrl } = req.body;

    if (!userId || !type || !title || !message) {
      Log('backend', 'warn', 'handler', 'createNotification: missing required fields');
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'userId, type, title, and message are required',
          status: 400,
        },
      });
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      priority: priority || 'medium',
      metadata: metadata || {},
      actionUrl: actionUrl || null,
    });

    // Push real-time notification via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', notification);
    }

    Log('backend', 'info', 'handler', `Notification created for user: ${userId}, type: ${type}`);
    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    if (err.name === 'ValidationError') {
      Log('backend', 'warn', 'handler', `createNotification validation error: ${err.message}`);
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: err.message, status: 400 },
      });
    }
    Log('backend', 'error', 'handler', `createNotification failed: ${err.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message, status: 500 },
    });
  }
};
