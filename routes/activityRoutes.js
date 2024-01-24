const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');

// Route: POST /activities
router.post('/activities/:storeId', authMiddleware, activityController.createActivity);

// Route: GET /activities
router.get('/activities/:storeId', authMiddleware, activityController.listAllActivities);

// Route: DELETE /activities/:storeId/:activityId
router.delete('/activities/:storeId/:activityId', authMiddleware, activityController.deleteActivity);

// Route: PUT /activities/:storeId/:activityId
router.put('/activities/:storeId/:activityId', authMiddleware, activityController.updateActivity);

// get a specific activity by its ID
router.get('/activities/:activityId', authMiddleware, activityController.getActivityById);

// get only income based activities...
router.get('/activities/:storeId/:activityId/incomes', authMiddleware, activityController.onlyIncomeActivities);

// get only expense based activities...
router.get('/activities/:storeId/:activityId/expenses', authMiddleware, activityController.onlyExpenseActivities);

// ..........
router.get('/activities/:storeId/totals', authMiddleware, activityController.getAdvancedAllTotal);

// testing this route to see ...
router.get('/activities/income/total/:storeId', authMiddleware, activityController.calculateIncomeTotal);

module.exports = router;
