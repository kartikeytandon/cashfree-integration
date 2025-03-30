const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const crypto = require('crypto');

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

exports.createOrder = async (req, res) => {
    const orderData = {
        order_id: "ddddddddddddd",
        order_amount: "1000", // amount in paise (1000 paise = 10 INR)
        order_currency: "INR",
        customer_details: {
            "customer_id": "test_id",
            "customer_name": "test",
            "customer_email": "example@gmail.com",
            "customer_phone": "9999999999"
        },
        order_meta: {
            notify_url: "https://ea03-88-216-235-64.ngrok-free.app/api/payment/webhook",
            return_url: "https://ea03-88-216-235-64.ngrok-free.app/payment/response"
        }
    };

    const options = {
        method: 'POST',
        url: 'https://sandbox.cashfree.com/pg/orders',
        headers: {
            'x-api-version': '2023-08-01', // You should replace this with the actual API version
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
    // console.log("paymentResponse:", paymentResponse)
    const { order_id } = "dfjlds";

    const url = `https://sandbox.cashfree.com/pg/orders/ddddddddddddd`;

    const options = {
        method: 'GET', // Use GET method for payment verification
        headers: {
            'x-api-version': '2023-08-01', // Replace with the actual API version if needed
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

exports.webhook = async (req, res) => {
    try {
        const signature = req.headers['x-webhook-signature']; // Signature sent by Cashfree
        const timestamp = req.headers['x-webhook-timestamp']; // Timestamp sent by Cashfree
        const rawBody = req.rawBody; // The raw request body

        // Verify the signature
        if (!verifySignature(timestamp, rawBody, signature)) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        // Extract the payment data from the webhook payload
        const paymentData = req.body;
        // console.log(paymentData.type)

        // Process payment data (update order status, notify the user, etc.)
        if (paymentData.type === 'PAYMENT_SUCCESS_WEBHOOK') {
            // Example: Handle successful payment
            console.log('Payment Success:', paymentData);
        } else if (paymentData.payment_status === 'PAYMENT_FAILED_WEBHOOK') {
            // Example: Handle failed payment
            console.log('Payment Failed:', paymentData);
        } else {
            // Handle other statuses if needed
            console.log('Payment Status:', paymentData.orderStatus);
        }

        // Respond with a success status to Cashfree
        res.status(200).send('Webhook received and processed');
    } catch (err) {
        console.error("Error processing webhook:", err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Function to verify the webhook signature
function verifySignature(timestamp, rawBody, signature) {
    const body = timestamp + rawBody; // Concatenate timestamp and raw body
    const generatedSignature = crypto
        .createHmac('sha256', CASHFREE_SECRET_KEY)
        .update(body)
        .digest('base64'); // Generate signature in Base64 format

    console.log("Generated Signature:", generatedSignature);
    console.log("Received Signature:", signature);

    return generatedSignature === signature; // Compare the generated and received signatures
}

// Handle Payment Success event
function handlePaymentSuccess(data) {
    const orderId = data.data.order.order_id;
    const paymentAmount = data.data.payment.payment_amount;
    console.log(`Payment successful for Order ID: ${orderId}, Amount: ${paymentAmount}`);
}

// Handle Payment Failure event
function handlePaymentFailure(data) {
    const orderId = data.data.order.order_id;
    const paymentMessage = data.data.payment.payment_message;
    console.log(`Payment failed for Order ID: ${orderId}, Message: ${paymentMessage}`);
}

// Handle User Dropped Payment event
function handleUserDropped(data) {
    const orderId = data.data.order.order_id;
    console.log(`User dropped payment for Order ID: ${orderId}`);
}