import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

const SimplePayPalButtons = ({ amount = "25.00", onSuccess, onError }) => {
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();
  const [startTime] = useState(Date.now());

  // Monitor loading time
  useEffect(() => {
    if (isPending && (Date.now() - startTime) > 20000) {
      console.warn('PayPal taking longer than expected to load');
    }
  }, [isPending, startTime]);

  if (isPending) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-lg font-medium">Loading PayPal...</p>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <p className="text-lg font-medium text-red-700">PayPal failed to load</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isResolved) {
    return (
      <div>
        <div className="text-center mb-4">
          <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
          <p className="text-green-700">✅ PayPal loaded successfully!</p>
        </div>
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'pay',
            height: 48,
          }}
          onClick={(data, actions) => {
            // Check for popup blockers
            const testPopup = window.open('', '_blank', 'width=1,height=1');
            if (!testPopup || testPopup.closed || typeof testPopup.closed === 'undefined') {
              alert('Please disable popup blockers and try again.');
              return actions.reject();
            }
            testPopup.close();
            return actions.resolve();
          }}
          createOrder={(data, actions) => {
            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [{
                description: 'Test Payment',
                amount: {
                  currency_code: 'USD',
                  value: amount,
                }
              }],
              application_context: {
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW'
              }
            });
          }}
          onApprove={async (data, actions) => {
            try {
              const details = await actions.order.capture();
              onSuccess && onSuccess(details);
            } catch (error) {
              onError && onError(error);
            }
          }}
          onError={(error) => {
            onError && onError(error);
          }}
          onCancel={() => {
            // Payment was cancelled
          }}
        />
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <p>⚠️ Unknown PayPal state</p>
    </div>
  );
};

const PaymentPageSimple = () => {
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('pending');

  const handlePaymentSuccess = (details) => {
    setPaymentStatus('success');
    // Handle successful payment here - e.g., redirect, update database, etc.
  };

  const handlePaymentError = (error) => {
    setPaymentStatus('error');
    // Handle payment error here
  };

  if (!PAYPAL_CLIENT_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 border border-red-300 rounded-lg bg-red-50">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-center mb-2">PayPal Not Configured</h2>
          <p className="text-gray-700 text-center">
            VITE_PAYPAL_CLIENT_ID is missing from environment variables.
          </p>
          <div className="mt-4 text-xs text-gray-600">
            <p>Check your .env.local file and make sure it contains:</p>
            <code className="block mt-2 p-2 bg-gray-100 rounded">
              VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="mb-4 px-4 py-2 text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold">Simple PayPal Test</h1>
          <p className="text-gray-600 mt-2">Testing PayPal integration</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Test Payment</h2>
            <p className="text-gray-600">Amount: <span className="font-semibold">$25.00</span></p>
            <p className="text-sm text-gray-500 mt-1">
              Client ID: {PAYPAL_CLIENT_ID.substring(0, 20)}...
            </p>
          </div>

          {paymentStatus === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-green-700 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your test payment was processed successfully.</p>
            </div>
          ) : (
            <PayPalScriptProvider
              options={{
                'client-id': PAYPAL_CLIENT_ID,
                currency: 'USD',
                intent: 'capture',
                debug: false, // Disable debug to prevent loading delays
                'disable-funding': 'credit,card', // Reduce complexity
                'enable-funding': 'paypal'
              }}
            >
              <SimplePayPalButtons
                amount="25.00"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </PayPalScriptProvider>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This is a simplified version for debugging PayPal integration issues.</p>
          <p>Check the browser console for detailed logs.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPageSimple;