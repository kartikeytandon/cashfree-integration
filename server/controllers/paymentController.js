const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

exports.createOrder = async (req, res) => {
    const orderData = {
        order_id: "jskdldfjddddsdsf",
        order_amount: "1000", // amount in paise (1000 paise = 10 INR)
        order_currency: "INR",
        "customer_details": {
            "customer_id": "test_id",
            "customer_name": "test",
            "customer_email": "example@gmail.com",
            "customer_phone": "9999999999"
        },
        return_url: "http://localhost:3000/payment/response"
    };

    const options = {
        method: 'POST',
        url: 'https://sandbox.cashfree.com/pg/orders',
        headers: {
            'x-api-version': '2025-01-01', // You should replace this with the actual API version
            'x-client-id': CASHFREE_APP_ID,  // Your app ID
            'x-client-secret': CASHFREE_SECRET_KEY, // Your secret key
            'Content-Type': 'application/json',
        },
        data: orderData // Send the data directly in the `data` field of Axios request
    };

    try {
        const response = await axios(options);
        // Handle the response data, e.g., return it to the frontend
        res.json(response.data);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send('Error creating order');
    }
};

exports.verifyPayment = async (req, res) => {
    const paymentResponse = req.body;
    console.log("paymentResponse:", paymentResponse)
    const { order_id } = "jskdldfjdddsdsf";

    const url = `https://sandbox.cashfree.com/pg/orders/jskdldfjddddsdsf`;

    const options = {
        method: 'GET', // Use GET method for payment verification
        headers: {
            'x-api-version': '2025-01-01', // Replace with the actual API version if needed
            'x-client-id': CASHFREE_APP_ID, // Your Cashfree app ID
            'x-client-secret': CASHFREE_SECRET_KEY, // Your Cashfree secret key
        }
    };

    try {
        const response = await axios(url, options); // Use axios to make the GET request
        res.json(response.data); // Return the response data from Cashfree

    } catch (error) {
        console.error('Error during payment verification:', error);
        res.status(500).send('Error during payment verification');
    }
};