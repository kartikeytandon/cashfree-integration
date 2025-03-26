const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();
const app = express();

// CORS middleware (allow frontend origin)
app.use(cors({
    origin: 'http://localhost:5173', // Allow frontend origin (Vite's default port)
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type,Authorization',
}));

// Middleware
app.use(express.raw({ type: 'application/json', limit: '1mb', verify: (req, res, buf) => { req.rawBody = buf } }));

// Routes
app.use('/api/payment', paymentRoutes);

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});