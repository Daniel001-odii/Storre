const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const activitiesController = require("../controllers/userController")
// const userController = require("../controllers/userController");

// Route for creating an activity, using authMiddleware before invoking the controller function
router.get('/get-user', authMiddleware, activitiesController.getUserDetailsFromToken);

// get a specific user by their username/....
router.get('/get-username/:username', activitiesController.findUserByUsername);

// Route for updating user data....
router.put('/set-user/:userId', authMiddleware, activitiesController.adjustUserData);

// ROute for updating user settings ....
router.put('/user-settings', authMiddleware, activitiesController.updateUserSettings);

// route to add a new customer to the users recoerd
router.post('/customer/add', authMiddleware, activitiesController.createNewCustomer);


module.exports = router;