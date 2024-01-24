// write the controllers for all possible actions in storre...

const User = require("../models/userModel");
const Activity = require("../models/activityModel");
const UserSettings = require("../models/settingsModel");
const jwt = require('jsonwebtoken');
const moment = require('moment');


  // Controller function to get user by ID
exports.getUserById = async (req, res) => {
    try {
      const { userId } = req.params; // Assuming the user ID is passed as a route parameter

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'user not found' });
      }

      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to get user by ID' });
    }
  };

exports.findUserByUsername = async (req, res) => {
    const { username } = req.params; // Assuming the username is available in the request parameters

    try {
      // Find the user by username
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

  // controller function to update user data...
exports.getUserDetailsFromToken = async (req, res) => {
    try {
      const user = await User.findById(req.userId).populate('stores');;

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return the user details
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

exports.updateUserSettings = async (req, res) => {
    try {
       // Get the JWT token from the request headers
       const token = req.headers.authorization.split(' ')[1];

       if (!token) {
         return res.status(401).json({ message: 'Token not provided' });
       }

       // Verify and decode the token
       const decoded = jwt.verify(token, process.env.API_SECRET);

       // Extract user ID from the decoded token payload
       const userId = decoded.userId;

        // Fetch user details from the database using the extracted userId
       const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Update user settings based on the request body
      if (req.body.notificationSettings) {
        user.notificationSettings = req.body.notificationSettings;
      }

      if (req.body.subscriptionSettings) {
        user.subscriptionSettings = req.body.subscriptionSettings;
      }

      if (req.body.privacySettings) {
        user.privacySettings = req.body.privacySettings;
      }

      if (req.body.themeSettings) {
        user.themeSettings = req.body.themeSettings;
      }

      // Save the updated user details to the database
      await user.save();

      return res.status(200).json({ success: true, message: 'User settings updated successfully', user });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to update user settings' });
    }
  };

exports.adjustUserData = async (req, res) => {
    const userId = req.params.userId; // Assuming userId is available in the request params
    const updatedUserData = req.body; // Assuming updated user data is sent in the request body

    try {
      // Find the user by ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user data with the new information
      Object.assign(user, updatedUserData);

      // Save the updated user data to the database
      const updatedUser = await user.save();

      return res.status(200).json({ message: 'User data updated', user: updatedUser });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

 // controller  to create a new customer for a user
exports.createNewCustomer = async (req, res) => {
  try {
    const userId = req.userId;
    const {name, email, contact, handle} = req.body;
    // find the user using the ID from the request...
    const user = await User.findById(userId);

    if(!user){
      return res.status(404).json({error: 'User not found'});
    }
    const newCustomer = {name, email, contact, handle};

    // generate a random user thumb backgrund color for a new customer
    function generateRandomHexColor() {
      // Generate a random hexadecimal color code
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      // Add leading zeros if needed to ensure the color has six digits
      const hexColor = '#' + '0'.repeat(6 - randomColor.length) + randomColor;
      return hexColor;
    }
    newCustomer.profileThumbBgColor = generateRandomHexColor();

    // add the new customer to the users database
    user.customers.push(newCustomer);

    await user.save();

    return res.status(201).json({ data: newCustomer , message: "customer saved successfully"})


  } catch(error){
    return res.status(500).json({error, message: "error adding customer"});
  }
};