const axios = require('axios');
const dotenv = require('dotenv');
const crypto = require('crypto');
dotenv.config();

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

exports.createOrder = async (req, res) => {
    const orderData = {
        order_id: "adlfjsldkfjlkdsdjfls",
        order_amount: "1000", // amount in paise (1000 paise = 10 INR)
        order_currency: "INR",
        customer_details: {
            "customer_id": "test_id",
            "customer_name": "test",
            "customer_email": "example@gmail.com",
            "customer_phone": "9999999999"
        },
        order_meta: {
            notify_url: "https://ed92-88-216-235-64.ngrok-free.app/api/payment/webhook",
            return_url: "http://localhost:3000/payment/response"
        }
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
    const { order_id } = "dfjlds";

    const url = `https://sandbox.cashfree.com/pg/orders/adlfjsldkfjlkdsdjfls`;

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

exports.webhook = async (req, res) => {
    const signature = req.headers['x-webhook-signature']; // Signature sent by Cashfree
    const timestamp = req.headers['x-webhook-timestamp']; // Timestamp sent by Cashfree
    const rawBody = req.rawBody.toString();  // Ensure raw body is captured as string

    console.log('Received Signature:', signature);
    console.log('Received Timestamp:', timestamp);
    console.log('Raw Payload:', rawBody);

    // Step 1: Verify the signature to ensure the webhook is legitimate
    const isVerified = verifySignature(timestamp, rawBody, signature);
    
    if (!isVerified) {
        console.error('Invalid Webhook Signature');
        return res.status(400).send('Invalid Webhook Signature');
    }

    // Step 2: Process the webhook data based on event type
    const webhookData = JSON.parse(rawBody);  // Parse raw body to get webhook data
    const eventType = webhookData.type;

    try {
        switch (eventType) {
            case 'PAYMENT_SUCCESS_WEBHOOK':
                handlePaymentSuccess(webhookData);
                break;
            case 'PAYMENT_FAILED_WEBHOOK':
                handlePaymentFailure(webhookData);
                break;
            case 'PAYMENT_USER_DROPPED_WEBHOOK':
                handleUserDropped(webhookData);
                break;
            default:
                console.log('Unknown event type');
                break;
        }
        res.status(200).send('Webhook received and processed');
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Error processing webhook');
    }
};

// Function to verify the webhook signature
function verifySignature(timestamp, rawBody, receivedSignature) {
    const signedPayload = timestamp + '.' + rawBody;  // Concatenate timestamp and raw body
    const expectedSignature = crypto
        .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)  // Use your Cashfree secret key
        .update(signedPayload)  // Hash the signed payload
        .digest('base64');  // Output as base64

    console.log('Calculated Signature:', expectedSignature);  // Log the calculated signature
    console.log('Received Signature:', receivedSignature);    // Log the received signature

    return expectedSignature === receivedSignature;  // Compare with the received signature
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