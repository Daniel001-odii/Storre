const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }, //unique identifier
    name: String,
    price: Number,
    image: String,
    description: String,
    quantity: { type: Number, required: true, default: 1 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
