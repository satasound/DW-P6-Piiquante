const express = require('express');
const router = express.Router();
const password = require('../middleware/password');
const validateEmail = require('../middleware/validateEmail');
const userCtrl = require('../controllers/user');

router.post('/signup', password, validateEmail, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;
