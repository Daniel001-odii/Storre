const Activity = require('../models/activityModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Store = require('../models/storeModel');
const moment = require('moment');
const mongoose = require('mongoose');
// Controller to create a new activity for a specific store
exports.createActivity = async (req, res) => {
  try {
    const userId = req.userId; // Assuming you have a middleware that extracts the userId from the token
    const { amount, type, customer, productName, paymentStatus, date } = req.body;
    const storeId = req.params.storeId; // Assuming you have a middleware that extracts the storeId from the token

    const user = await User.findById(userId);
    const store = await Store.findById(storeId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Access user's settings
    const userSettings = user.settings;

    // Check if the product with the given name already exists in the store?
    let product = await Product.findOne({ store:store, name: productName });

    // If the product doesn't exist, create a new product
    if (!product) {
      // Explicitly set the name field before saving the new product
      const newProduct = new Product({ 
        name: productName, 
        store: storeId 
      });

      await newProduct.save();

      // add the new product to the respective store
      store.products.push(newProduct._id);
      await store.save();

      product = newProduct;
      console.log("Created a new product: ", newProduct);
    }

    const productToaAdd = {}
    productToaAdd.id = product._id;
    productToaAdd.name = productName;

    // Create a new activity and assign the user's preferred currency
    const newActivity = new Activity({
      store: storeId,
      amount,
      type,
      customer,
      product: productToaAdd, // Assigning the product ID to the activity
      paymentStatus,
      date,
      currency: userSettings.currency // Assigning the user's preferred currency to the activity
    });

    // Save the new activity to the database
    await newActivity.save();

    // Add the new activity to the respective store
    store.activities.push(newActivity);
    
    // check if the customer is already existing........
    const existingCustomer = user.customers.find(cust => cust.email === customer.email);
    if (existingCustomer) {
      // Update existing customer details
      existingCustomer.name = customer.name || existingCustomer.name;
      existingCustomer.contact = customer.contact || existingCustomer.contact;
      existingCustomer.handle = customer.handle || existingCustomer.handle;
    } else {
      // Add new customer to the user's record
      user.customers.push(customer);
      await user.save();
    }


    // Update user's total income or total expenses
    if (type === 'income') {
      store.total_income = (store.total_income || 0) + amount;
    } else if (type === 'expense') {
      store.total_expenses = (store.total_expenses || 0) + amount;
    }

    await store.save();

    return res.status(201).json({ success: true, data: newActivity });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Failed to create activity' });
  }
};



// Controller to list all activities for a specific store
exports.listAllActivities = async (req, res) => {
    try {
      const storeId = req.params.storeId; 
  
      // Find all activities for the specific store
      const allActivities = await Activity.find({ store: storeId, isDeleted: false  });
  
      return res.status(200).json({ allActivities });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to fetch activities for the store' });
    }
};

// Controller to "soft delete" an activity for a specific store
exports.deleteActivity = async (req, res) => {
  try {
    const { activityId, storeId } = req.params; // Assuming both activity ID and store ID are passed as route parameters

    // Check if the provided storeId matches the storeId associated with the activity
    const activity = await Activity.findById(activityId);

    if (!activity || String(activity.store) !== storeId) {
      return res.status(404).json({ success: false, error: 'Activity not found for the given store' });
    }

    // "Soft delete" the activity by updating the isDeleted field
    const deletedActivity = await Activity.findByIdAndUpdate(activityId, { isDeleted: true }, { new: true });

    if (!deletedActivity) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }

    return res.status(200).json({ success: true, data: deletedActivity });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Failed to delete activity' });
  }
};

// Controller to update the details of a specific activity for a specific store
exports.updateActivity = async (req, res) => {
  try {
    const { activityId, storeId } = req.params; // Assuming both activity ID and store ID are passed as route parameters

    // Check if the provided storeId matches the storeId associated with the activity
    const activity = await Activity.findById(activityId);

    if (!activity || String(activity.store) !== storeId) {
      return res.status(404).json({ success: false, error: 'Activity not found for the given store' });
    }

    // Update the activity details based on the request body
    const updatedActivity = await Activity.findByIdAndUpdate(activityId, req.body, { new: true });

    return res.status(200).json({ success: true, data: updatedActivity });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Failed to update activity details' });
  }
};

// Controller function to get an activity by ID
exports.getActivityById = async (req, res) => {
    try {
      const { activityId } = req.params; // Assuming the activity ID is passed as a route parameter

      const activity = await Activity.findById(activityId);

      if (!activity) {
        return res.status(404).json({ success: false, message: 'Activity not found' });
      }

      return res.status(200).json({ activity });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to get activity by ID' });
    }
};

// controller to get all incomes based activities
exports.onlyIncomeActivities = async (req, res) => {
      const storeId = req.params.storeId;
      try {
        const activities = await Activity.find({ store: storeId, type: "income" });
        return res.status(200).json({ success: true, data: activities });
      } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to fetch income activities' });
      }
};

// controller to get all expense based activities
exports.onlyExpenseActivities = async (req, res) => {
  const storeId = req.params.storeId;
  try {
    const activities = await Activity.find({ store: storeId, type: "expense" });
    return res.status(200).json({ success: true, data: activities });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch expense activities' });
  }
};

exports.getAdvancedAllTotal = async (req, res) => {
  const storeId = req.params.storeId;

  try {
    const productsSold = await Activity.countDocuments({ type: "income", store: storeId, isDeleted: false });

    const todaySales = await Activity.find({
      store: storeId,
      type: 'income',
      createdAt: {
        $gte: moment().startOf('day').toDate(),
        $lte: moment().endOf('day').toDate(),
      },
    }).select('amount');

    const todayExpenses = await Activity.find({
      store: storeId,
      type: 'expense',
      createdAt: {
        $gte: moment().startOf('day').toDate(),
        $lte: moment().endOf('day').toDate(),
      },
    }).select('amount');

    const thisWeekSales = await Activity.find({
      store: storeId,
      type: 'income',
      createdAt: {
        $gte: moment().startOf('week').toDate(),
        $lte: moment().endOf('week').toDate(),
      },
    }).select('amount');

    const thisWeekExpenses = await Activity.find({
      store: storeId,
      type: 'expense',
      createdAt: {
        $gte: moment().startOf('week').toDate(),
        $lte: moment().endOf('week').toDate(),
      },
    }).select('amount');

    const thisMonthSales = await Activity.find({
      store: storeId,
      type: 'income',
      createdAt: {
        $gte: moment().startOf('month').toDate(),
        $lte: moment().endOf('month').toDate(),
      },
    }).select('amount');

    const thisMonthExpenses = await Activity.find({
      store: storeId,
      type: 'expense',
      createdAt: {
        $gte: moment().startOf('month').toDate(),
        $lte: moment().endOf('month').toDate(),
      },
    }).select('amount');

    const thisYearSales = await Activity.find({
      store: storeId,
      type: 'income',
      createdAt: {
        $gte: moment().startOf('year').toDate(),
        $lte: moment().endOf('year').toDate(),
      },
    }).select('amount');

    const thisYearExpenses = await Activity.find({
      store: storeId,
      type: 'expense',
      createdAt: {
        $gte: moment().startOf('year').toDate(),
        $lte: moment().endOf('year').toDate(),
      },
    }).select('amount');

    const calculateTotal = (items) => items.reduce((total, item) => total + (item.amount || 0), 0);

    res.status(200).json({
      products: productsSold,
      todaySales: calculateTotal(todaySales),
      todayExpenses: calculateTotal(todayExpenses),
      thisWeekSales: calculateTotal(thisWeekSales),
      thisWeekExpenses: calculateTotal(thisWeekExpenses),
      thisMonthSales: calculateTotal(thisMonthSales),
      thisMonthExpenses: calculateTotal(thisMonthExpenses),
      thisYearSales: calculateTotal(thisYearSales),
      thisYearExpenses: calculateTotal(thisYearExpenses),
    });
  } catch (error) {
    console.error('Error fetching total sales:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};




exports.activitySearch = async (req, res) => {
  try {
    let query = {};
    const {
      type,
      customerName,
      product,
      startDate,
      endDate,
      isDeleted
      // Add more search parameters here as needed
    } = req.query;

    // Construct the query based on the provided search
    if (isDeleted) {
      query.isDeleted = isDeleted;
    }
    if (type) {
      query.type = type;
    }
    if (customerName) {
      query.customerName = { $regex: new RegExp(customerName, 'i') };
    }
    if (product) {
      query.product = { $regex: new RegExp(product, 'i') };
    }
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    // Add more conditions for additional search parameters

    const searchResults = await Activity.find(query);

    return res.status(200).json({ success: true, data: searchResults });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to perform extensive search' });
  }
};

   // Controller function to calculate the sum total of activities with type "income"
exports.calculateIncomeTotal = async (req, res) => {
    const storeId = req.params.storeId;
  
    try {
      console.log('Before find');
      const totalIncome = await Activity.find({
        store: storeId,
        type: 'income',
        isDeleted: false
      }).select('amount');
      console.log('After find');
  
      if (totalIncome.length === 0) {
        console.log('No income activities found');
        return res.status(404).json({ success: false, message: 'No income activities found' });
      }
  
      const total = totalIncome.reduce((acc, activity) => acc + activity.amount, 0);
  
      return res.status(200).json({ total });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, error: 'Failed to calculate total income' });
    }
  };
  
  
  