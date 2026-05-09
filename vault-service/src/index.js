require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for Vault Service'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/credentials', require('./routes/credentials'));

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Vault Service is up and running' });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Vault Service running on port ${PORT}`);
});
