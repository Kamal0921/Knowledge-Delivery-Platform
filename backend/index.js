// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Make sure path is required
require('dotenv').config();

const courseRoutes = require('./routes/courseRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// CORS Configuration (Adjust origin as needed for production)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*' // Or specify your frontend URL e.g., 'http://localhost:3000'
}));

// Body Parsers
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded (might be needed by forms)


// --- Serve uploaded files statically ---
// This makes files in the 'uploads' directory accessible via URLs like /uploads/imagename.png
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// --- End Static Serving ---


// MongoDB connection (ensure your connection string is secure)
const DB_NAME = process.env.DB_NAME || 'knowledge_db';
const DB_URL = process.env.MONGODB_URI || "mongodb+srv://Kamal:Kamal2006@cluster0.aoshqsw.mongodb.net/?retryWrites=true&w=majority"; // Use env variable or default

mongoose.connect(DB_URL, {
  dbName: DB_NAME,
  appName: 'Cluster0' // Optional App Name
})
  .then(() => console.log(`MongoDB connected to database: ${DB_NAME}`))
  .catch(err => console.error('MongoDB connection error:', err.message));


// API Routes
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);


// Simple root route
app.get('/', (req, res) => res.send('Knowledge Delivery Platform API running'));

// Error Handling Middleware (Optional but Recommended)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).send('Something broke!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));