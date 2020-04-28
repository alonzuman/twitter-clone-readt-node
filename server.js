const Joi = require('joi');
const express = require('express');
const app = express();
const connectDB = require('./config/db');

// Adding parsing middleware
app.use(express.json({ extended: false }));

// Connect to DB
connectDB();

// Define routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profiles', require('./routes/api/profiles'));
app.use('/api/posts', require('./routes/api/posts'));

// PORT
const port = process.env.PORT || 5000;
app.listen(port, console.log(`Listening on port ${port}`));