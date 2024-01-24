const Store = require('../models/storeModel');
const User = require('../models/userModel');

exports.createStore = async (req, res) => {
    try {
        const { name, category } = req.body;
        const owner = req.userId; // Assuming you have a middleware to extract the user ID from the request
        const user = await User.findById(owner);

        // Check if a store with the same name already exists for the user
        const existingStore = await Store.findOne({ name, owner });
        if (existingStore) {
            return res.status(400).json({ message: "A store with the same name already exists for this user" });
        }

        // stores creation limit assignment...
        // basic plan = 1 store per user [default store only]
        // business plan - 3 stores per user [plus default store]
        // enterprise plan - 5 stores per user [plus default store]
        if (user.subscription === "basic") {
            return res.status(500).json({ message: "Upgrade your subscription plan to create more stores" });
        } else if (user.subscription === "business" && user.stores.length >= 3) {
            return res.status(500).json({ message: "Please upgrade your subscription to create more stores" });
        } else if (user.subscription === "enterprise" && user.stores.length >= 5) {
            return res.status(500).json({ message: "Sorry, you've reached the maximum stores limit." });
        }

        const newStore = await Store.create({ name, category, owner  });
        user.stores.push(newStore);
        await user.save(); // Save the user after pushing the new store

        res.status(201).json({ success: true, data: newStore });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to create store' });
    }
};

// get all stores owned by a user... [NOT ACTIVE]
exports.getUserStores = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).populate('stores');

        console.log("user details: ", user)

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }


        const stores = user.stores;
        console.log("stores: ", stores)
        res.status(200).json({ stores });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user stores' });
    }
};


exports.getStoreDetails = async (req, res) => {
  try {
      const storeId = req.params.storeId;
      const storeDetails = await Store.findById(storeId).populate('owner products activities');

      if (!storeDetails) {
          return res.status(404).json({ success: false, error: 'Store not found' });
      }

      res.status(200).json({ success: true, data: storeDetails });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to fetch store details' });
  }
};

exports.updateStore = async (req, res) => {
  try {
      const storeId = req.params.storeId;

      // add all details that can be updated by user/store owner
      const { name } = req.body;

      const updatedStore = await Store.findByIdAndUpdate(storeId, { name }, { new: true });

      if (!updatedStore) {
          return res.status(404).json({ success: false, error: 'Store not found' });
      }

      res.status(200).json({ success: true, data: updatedStore });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to update store' });
  }
};

exports.deleteStore = async (req, res) => {
  try {
      const storeId = req.params.storeId;

      const deletedStore = await Store.findByIdAndUpdate(storeId, { isDeleted: true }, { new: true });

      if (!deletedStore) {
          return res.status(404).json({ success: false, error: 'Store not found' });
      }

      res.status(200).json({ success: true, data: deletedStore });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to delete store' });
  }
};

exports.addProduct = async (req, res) => {

};