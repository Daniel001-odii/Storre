const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  type: {
    type: String,
    enum: ["income", "expense"],
    default: "income",
    required: true,
  },
  amount: {
    type: Number,
    required: true
  },
  customer: {
    name: {type: String, default: 'new customer'},
    email: String,
    contact: String,
    handle: String,
  },
  // product field is for income only activities
  product: {
    id: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
    name: String,
  },
  // service field is for expense only activities...
  service: String,
  isDeleted: {
    type: Boolean,
    default: false,
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "unpaid"],
    required: true,
  },
  date: {type: Date},
}, {timestamps: true});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
