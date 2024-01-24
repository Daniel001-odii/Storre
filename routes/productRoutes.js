const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const productsController = require("../controllers/productController.js")

// your routes goes below here.........

// creating a new product...
router.post('/products/:storeId', authMiddleware, productsController.createProduct);

// listing out product for a particular store........
router.get('/products/:storeId', authMiddleware, productsController.listProducts);

// listing out product for a particular store........
router.get('/products/:productId', authMiddleware, productsController.getProductById);

// listing out product for a particular store........
router.put('/products/:productId', authMiddleware, productsController.updateProduct);

// listing out product for a particular store........
router.delete('/products/:productId', authMiddleware, productsController.deleteProduct);




module.exports = router;