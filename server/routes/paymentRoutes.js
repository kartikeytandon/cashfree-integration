const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create Order
router.post('/create-order', paymentController.createOrder);

// Verify Payment
router.post('/verify-payment', paymentController.verifyPayment);

// webhook
router.post('/webhook', paymentController.webhook);

module.exports = router;
