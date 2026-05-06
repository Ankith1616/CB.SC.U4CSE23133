const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/preferenceController');

router.get('/', ctrl.getPreferences);
router.put('/', ctrl.updatePreferences);

module.exports = router;
