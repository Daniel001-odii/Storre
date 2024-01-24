
const User = require("../models/userModel");
const Activity = require("../models/activityModel");
const UserSettings = require("../models/settingsModel");
const Product = require("../models/productModel");
const jwt = require('jsonwebtoken');
const moment = require('moment');

// Controller to create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, image, description, quantity, category } = req.body;
    
    const newProduct = new Product({
      name,
      store: req.params.storeId,
      price,
      image,
      description,
      quantity,
      category,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to create product' });
  }
};

// Controller to list all products
exports.listProducts = async (req, res) => {
  try {
    // const {store} = req.prams.storeId;
    const products = await Product.find({ store:req.params.storeId, isDeleted: false });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
};

// Controller to get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
};

// Controller to update a product
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to update product' });
  }
};

// Controller to delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const deletedProduct = await Product.findByIdAndUpdate(productId, { isDeleted: true }, { new: true });

    if (!deletedProduct) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.status(200).json({ success: true, data: deletedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
};
