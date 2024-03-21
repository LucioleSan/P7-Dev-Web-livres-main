const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.post('/signup', passwordValidator, limiter, userController.signup);
router.post('/login', limiter, userController.login);

module.exports = router;