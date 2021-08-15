const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-configs');

const sauceCtrl = require('../controllers/sauces');
const rateLimit = require("express-rate-limit");

const reqLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

router.get('/', auth, sauceCtrl.getAllSauces);
router.post('/', auth, reqLimiter, multer, sauceCtrl.createSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.put('/:id', auth, reqLimiter, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, reqLimiter, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.likeSauce)

module.exports = router;