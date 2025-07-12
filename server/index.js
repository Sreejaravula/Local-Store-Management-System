import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import itemRoutes from './routes/items.js';
import billRoutes from './routes/bills.js';
import tagRoutes from './routes/tags.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});