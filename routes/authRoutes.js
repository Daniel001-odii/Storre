const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");

// authentication routes....

// login user
router.post('/login', authController.signin);

// regsiter user
router.post('/register', authController.signup);

// sendPassResetLink
router.post('/passreset', authController.sendPasswordResetEmail);

// passReset initialize
router.post('/pass/reset', authController.resetPassword);


module.exports = router;