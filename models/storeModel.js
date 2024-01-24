const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: {type: String, default: "Free Leave Store", maxlength: [50, "Storename canot exceed 50 characters"]},
    category: String,
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    products: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
    activities: [{type: mongoose.Schema.Types.ObjectId, ref: 'Activity'}],
    total_income: Number,
    total_expenses: Number,
    views: {type: Number, default: 0},
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;