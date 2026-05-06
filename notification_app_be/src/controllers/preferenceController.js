const UserPreference = require('../models/UserPreference');

// GET /api/v1/preferences
exports.getPreferences = async (req, res) => {
  try {
    let prefs = await UserPreference.findOne({ userId: req.user.userId });

    if (!prefs) {
      // Create default preferences if none exist
      prefs = await UserPreference.create({ userId: req.user.userId });
    }

    res.json({ success: true, data: prefs });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message, status: 500 },
    });
  }
};

// PUT /api/v1/preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { emailNotifications, pushNotifications, mutedTypes, quietHours } = req.body;

    const updateData = {};
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications;
    if (mutedTypes !== undefined) updateData.mutedTypes = mutedTypes;
    if (quietHours !== undefined) updateData.quietHours = quietHours;

    const prefs = await UserPreference.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: prefs });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message, status: 500 },
    });
  }
};
