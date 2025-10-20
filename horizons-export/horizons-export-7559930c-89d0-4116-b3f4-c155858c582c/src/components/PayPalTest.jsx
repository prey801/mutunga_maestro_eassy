import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

console.log('Environment Variables Check:');
console.log('VITE_PAYPAL_CLIENT_ID exists:', !!PAYPAL_CLIENT_ID);
console.log('VITE_PAYPAL_CLIENT_ID value:', PAYPAL_CLIENT_ID);
console.log('All Vite env vars:', import.meta.env);

const PayPalButtonsTest = () => {
  const [{ isPending, isResolved, isRejected, options }, dispatch] = usePayPalScriptReducer();
  const [loadStart, setLoadStart] = useState(Date.now());

  useEffect(() => {
    const elapsed = Date.now() - loadStart;
    console.log(`PayPal state update - Elapsed: ${elapsed}ms`, {
      isPending,
      isResolved,
      isRejected,
      options,
      clientId: options?.['client-id']?.substring(0, 20) + '...'
    });

    if (isPending && elapsed > 15000) {
      console.warn('PayPal has been loading for over 15 seconds');
    }
  }, [isPending, isResolved, isRejected, options, loadStart]);

  if (isPending) {
    return (
      <div style={{ padding: '20px', border: '2px solid orange', margin: '10px' }}>
        <h3>🔄 PayPal Loading...</h3>
        <p>Time elapsed: {Math.round((Date.now() - loadStart) / 1000)}s</p>
        <p>Client ID: {options?.['client-id']?.substring(0, 20) + '...'}</p>
        <p>Status: isPending={isPending.toString()}</p>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div style={{ padding: '20px', border: '2px solid red', margin: '10px' }}>
        <h3>❌ PayPal Failed to Load</h3>
        <p>The PayPal SDK was rejected</p>
        <pre>{JSON.stringify(options, null, 2)}</pre>
      </div>
    );
  }

  if (isResolved) {
    return (
      <div style={{ padding: '20px', border: '2px solid green', margin: '10px' }}>
        <h3>✅ PayPal Loaded Successfully!</h3>
        <p>Client ID: {options?.['client-id']?.substring(0, 20) + '...'}</p>
        <PayPalButtons
          style={{ layout: 'vertical', height: 48 }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: { currency_code: 'USD', value: '10.00' }
              }]
            });
          }}
          onApprove={(data, actions) => {
            console.log('Test payment approved:', data);
            alert('Test payment successful!');
          }}
          onError={(error) => {
            console.error('Test payment error:', error);
            alert('Test payment failed: ' + error.message);
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '2px solid gray', margin: '10px' }}>
      <h3>❓ PayPal Unknown State</h3>
      <p>isPending: {isPending.toString()}</p>
      <p>isResolved: {isResolved.toString()}</p>
      <p>isRejected: {isRejected.toString()}</p>
    </div>
  );
};

const PayPalTest = () => {
  if (!PAYPAL_CLIENT_ID) {
    return (
      <div style={{ padding: '20px', border: '2px solid red', margin: '10px' }}>
        <h3>❌ Missing PayPal Client ID</h3>
        <p>VITE_PAYPAL_CLIENT_ID is not defined in environment variables</p>
        <p>Check your .env.local file</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '2px solid blue', margin: '10px' }}>
      <h2>PayPal Integration Test</h2>
      <p><strong>Client ID:</strong> {PAYPAL_CLIENT_ID.substring(0, 20)}...</p>
      
      <PayPalScriptProvider
        options={{
          'client-id': PAYPAL_CLIENT_ID,
          currency: 'USD',
          intent: 'capture',
          debug: true // Enable PayPal debug mode
        }}
      >
        <PayPalButtonsTest />
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalTest;