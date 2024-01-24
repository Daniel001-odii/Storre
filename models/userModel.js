const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    newsletterSubscription: { type: Boolean, default: false }
  },
  subscriptionSettings: {
    type: String,
    enum: ['basic', 'premium'],
    default: 'basic'
  },
  privacySettings: {
    profileVisibility: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
    activityLogVisibility: { type: String, enum: ['visible', 'hidden'], default: 'visible' }
  },
  themeSettings: {
    preferredTheme: { type: String, default: 'light' },
    customColors: {
      primaryColor: String,
      secondaryColor: String
    }
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'NGN'],
    default: 'USD'
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    maxlength: [50, 'Username cannot exceed 50 characters'],
    // Set the field to lowercase using the set function
    set: (value) => value.toLowerCase()
  },
  firstname: String,
  lastname: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'standard'], // Example roles; adjust as needed
    default: 'admin'
  },
  business_name: {
    default: "My Company",
    type: String,
    maxlength: [50, 'Business name cannot exceed 50 characters'],
  },
  business_address: String,
  business_type: String,
  business_description: String,
  contact: String,
  subscription: {
    type: String,
    enum: ["basic", "business", "enterprise"],
    default: "basic"
  },
  date_joined: { type: Date, default: Date.now },
  last_login: Date,
  avatar_url: {type: String, default: 'https://icon-library.com/images/no-profile-pic-icon/no-profile-pic-icon-11.jpg'},
  bio: String,
  customers:[{
    name: {type: String, default: 'new customer'},
    email: String,
    contact: String,
    handle: String,
    profileThumbBgColor: String,
  }],
  is_verified: {
    type: Boolean,
    default: false
  },
  total_income: Number,
  total_expenses: Number,
  verificationDate: {
    type: Date,
    default: null  // The date of verification, null if not verified yet
  },
  // stores... making it possible for a user to have serveral storess.
  stores: [{type: mongoose.Schema.Types.ObjectId, ref: 'Store'}],
  settings: {
    type: userSettingsSchema,
    default: {} // Default settings if not specified
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;

