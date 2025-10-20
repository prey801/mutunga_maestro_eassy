import React from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalBasicTutorial from './PayPalBasicTutorial';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

// Initial options following the tutorial structure
const initialOptions = {
  "client-id": PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "capture",
  debug: true // Enable debug mode for testing
};

console.log('=== PayPal Tutorial Wrapper ===');
console.log('Initial Options:', initialOptions);

function PayPalTutorialWrapper() {
  if (!PAYPAL_CLIENT_ID) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ 
          maxWidth: '500px', 
          padding: '40px', 
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px solid #dc2626'
        }}>
          <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>PayPal Not Configured</h1>
          <p style={{ marginBottom: '16px' }}>
            VITE_PAYPAL_CLIENT_ID is missing from environment variables.
          </p>
          <div style={{ 
            textAlign: 'left', 
            backgroundColor: '#f3f4f6', 
            padding: '16px', 
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            <p>Add to your .env.local file:</p>
            <code>VITE_PAYPAL_CLIENT_ID=your_actual_client_id</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalBasicTutorial />
    </PayPalScriptProvider>
  );
}

export default PayPalTutorialWrapper;