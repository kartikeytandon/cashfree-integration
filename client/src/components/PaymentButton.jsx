import React, { useEffect } from 'react';
import { load } from '@cashfreepayments/cashfree-js';

const PaymentButton = () => {
    let cashfree;

    // Initialize Cashfree SDK when the component mounts
    const initializeSDK = async () => {
        cashfree = await load({
            mode: 'sandbox', // Use 'sandbox' or 'production' for live transactions
        });
    };

    // Handle the payment process
    const handlePayment = async () => {
        try {
            // Fetch the payment session details from the backend
            const response = await fetch(`${import.meta.env.VITE_API_URL}/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log(data.payment_session_id)
            if (data && data.payment_session_id) {
                // Once the session ID is retrieved, initiate the payment
                let checkoutOptions = {
                    paymentSessionId: data.payment_session_id, // The session ID returned by the backend
                    redirectTarget: '_modal', // '_modal' to open in a popup, '_self' for the same page
                };

                // Trigger the Cashfree checkout
                cashfree.checkout(checkoutOptions).then((result) => {
                    if (result.error) {
                        // This will be true if the user closes the modal or there is a payment error
                        console.log("User has closed the popup or there is an error during payment:");
                        console.log(result.error);
                    }
                    if (result.redirect) {
                        // This occurs if the payment redirect couldn't be opened in the same window
                        console.log("Payment will be redirected");
                    }
                    if (result.paymentDetails) {
                        // Called when the payment is completed
                        console.log("paymentDetails: ", result.paymentDetails)
                        console.log("Payment completed. Check payment status:");
                        console.log(result.paymentDetails.paymentMessage);

                        // Call backend to verify the payment
                        verifyPayment(result.paymentDetails);
                    }
                });
            } else {
                console.error('Failed to initiate payment: Missing payment session ID');
            }
        } catch (error) {
            console.error('Payment initiation failed:', error);
        }
    };

    // Function to verify payment
    const verifyPayment = async (paymentDetails) => {
        try {
            // Send payment details (order_id, reference_id, signature) to backend for verification
            const verificationResponse = await fetch(`${import.meta.env.VITE_API_URL}/verify-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_id: paymentDetails.order_id,
                }),
            });

            const verificationData = await verificationResponse.json();
            console.log('Payment Verification Response:', verificationData);

            // Handle verification response
            if (verificationData.success) {
                console.log('Payment verified successfully');
            } else {
                console.log('Payment verification failed');
            }
        } catch (error) {
            console.error('Error during payment verification:', error);
        }
    };

    useEffect(() => {
        // Initialize the Cashfree SDK when the component mounts
        initializeSDK();
    }, []);

    return (
        <div className="row">
            <p>Click below to open the checkout page in a popup</p>
            <button type="submit" className="btn btn-primary" onClick={handlePayment}>
                Pay Now
            </button>
        </div>
    );
};

export default PaymentButton;
