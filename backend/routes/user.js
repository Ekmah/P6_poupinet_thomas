const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const verifyPassword = require('../middleware/verifyPassword');
const rateLimit = require("express-rate-limit");
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

router.post('/signup', authLimiter, verifyPassword, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;