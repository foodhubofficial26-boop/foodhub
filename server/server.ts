import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import authRoutes from './routes/auth';
import restaurantRoutes from './routes/restaurants';
import categoryRoutes from './routes/categories';
import foodRoutes from './routes/food';
import orderRoutes from './routes/orders';
import addressRoutes from './routes/addresses';
import userRoutes from './routes/users';
import uploadRoutes from './routes/upload';

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
