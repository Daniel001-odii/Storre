const bcrypt = require('bcrypt');

const User = require('../models/userModel'); // Import the User model
const Store = require('../models/storeModel');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Handle user signup
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the username or email already exists in the database
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Create a new user based on the User model
    const newUser = new User({
      username,
      email,
      password: bcrypt.hashSync(password, 8),
      // ...other user fields
    });

    // Save the new user to the database
    await newUser.save();

    // Create a new store and assign it to the user
    const newStore = new Store({
      owner: newUser._id, // Assign the user as the owner of the store
    });

    // Save the new store to the database
    await newStore.save();

    // Update the user with the new store
    newUser.stores.push(newStore._id);

    // Save the user with the updated store information
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error(error); // Log the error to the console for debugging
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Handle user sign-in
exports.signin = async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    // Check if the username or email exists in the database
    const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    // Generate JWT token for authentication
    const token = jwt.sign({ userId: user._id }, process.env.API_SECRET, { expiresIn: 86400 });

    // Respond with the token and user information
    res.status(200).json({
      message: 'Sign-in successful',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        // ...other user fields you may want to include
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// handle sending password reset links to users
exports.sendPasswordResetEmail = async (req, res) => {
    const { email } = req.body;

    try {
      // Find the user by their email address
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate a unique reset token
      const resetToken = crypto.randomBytes(20).toString('hex');

      // Set an expiration time for the reset token (e.g., 1 hour)
      const resetTokenExpiration = Date.now() + 3600000; // 1 hour

      // Update the user's document with the reset token and expiration time
      user.resetToken = resetToken;
      user.resetTokenExpiration = resetTokenExpiration;

      await user.save();

      // Send an email to the user with a link containing the reset token
      const transporter = nodemailer.createTransport({
        service: 'gmail', // e.g., Gmail
        auth: {
          user: 'danielsinterest@gmail.com',
          pass: 'qksdojcrljuxzaso',
        },
      });

      const mailOptions = {
        from: 'danielsinterest@gmail.com',
        to: email,
        subject: 'Password Reset Request',
        html: `<p>You are receiving this email because you (or someone else) have requested the reset of your account password.</p>
              <p>Please use the following token to reset your password: <strong>${resetToken}</strong></p>
              <p>This token will expire after 1 hour.</p>`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ message: 'Failed to send reset email' });
        }

        console.log('Reset email sent:', info.response);
        res.status(200).json({ message: 'Password reset email sent' });
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
};

// handle reset password request by users...
exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
      // Find the user by the reset token and ensure the token is not expired
      const user = await User.findOne({
        resetToken,
        resetTokenExpiration: { $gt: Date.now() }, // Check if the token is not expired
      });

      if (!user) {
        return res.status(404).json({ message: 'Invalid or expired reset token' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password and clear the reset token fields
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;

      await user.save();

      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
};