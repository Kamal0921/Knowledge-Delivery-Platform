const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const courseRoutes = require('./routes/courseRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

// MongoDB connection
const DB_NAME = 'knowledge_db';

const YOUR_HARDCODED_URL = "mongodb+srv://Kamal:Kamal2006@cluster0.aoshqsw.mongodb.net/?appName=Cluster0";

mongoose.connect(YOUR_HARDCODED_URL, {
  dbName: DB_NAME, 
  appName: 'Cluster0'
})
  .then(() => console.log(`MongoDB connected to database: ${DB_NAME}`)) // This should now appear
  .catch(err => console.log('MongoDB connection error:', err.message));

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.send('Knowledge Delivery Platform API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));