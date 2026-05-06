const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');

// Order matters: specific routes before parameterized ones
router.get('/unread/count', ctrl.getUnreadCount);
router.patch('/read/all', ctrl.markAllAsRead);

router.get('/', ctrl.listNotifications);
router.post('/', ctrl.createNotification);
router.get('/:id', ctrl.getNotification);
router.patch('/:id/read', ctrl.markAsRead);
router.delete('/:id', ctrl.deleteNotification);

module.exports = router;
