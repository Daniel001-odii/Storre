const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const storeController = require("../controllers/storeController")


router.post('/stores/create', authMiddleware, storeController.createStore);

router.get('/stores/:storeId', storeController.getStoreDetails);

// router.get('/stores/all', authMiddleware, storeController.getUserStores);

router.put('/stores/:storeId', authMiddleware, storeController.updateStore);

router.delete('/stores/:storeId', authMiddleware, storeController.deleteStore);

module.exports = router;