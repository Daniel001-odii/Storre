require('dotenv').config();

// import all necessary modules here......
const express = require('express');
const app = express();
const cors = require('cors');
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoutes");
const storeRoutes = require("./routes/storeRoutes");
const productRoutes = require("./routes/productRoutes");

const mongoose = require('mongoose');

// const http = require('http');
// const server = http.createServer(app);

// Use the cors middleware with options to specify the allowed origin [----DO NOT REMOVE FRPM HERE----]
app.use(cors());
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({
  extended: true
}));


// using users routes...
app.use('/api/v1', userRoutes);
app.use('/api/v1', authRoutes);
app.use('/api/v1', activityRoutes);
app.use('/api/v1', storeRoutes);
app.use('/api/v1', productRoutes);


// Connect to the db
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Storre Database connected successfully...');
    // You can perform additional operations here after successful connection
  })
  .catch((err) => {
    console.error('Error connecting to database:', err);
    // Handle connection errors here
  });




// Start the server
app.listen(process.env.PORT || port, () => {
  console.log(`Storre Server is running on port ${process.env.PORT}`);
});
