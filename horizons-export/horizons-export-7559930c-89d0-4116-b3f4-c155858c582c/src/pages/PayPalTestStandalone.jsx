import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

// Detect if this is a sandbox client ID
// Sandbox client IDs typically start with 'Af', 'AS', or 'AX'
// Production client IDs typically start with 'AW', 'AY', or 'AZ'
const isSandbox = PAYPAL_CLIENT_ID && (PAYPAL_CLIENT_ID.startsWith('Af') || PAYPAL_CLIENT_ID.startsWith('AS') || PAYPAL_CLIENT_ID.startsWith('AX'));

console.log('=== Standalone PayPal Test ===');
console.log('PayPal Client ID:', PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.substring(0, 10)}...` : 'MISSING');
console.log('Environment Mode:', import.meta.env.MODE);
console.log('PayPal Environment:', isSandbox ? 'SANDBOX' : 'PRODUCTION');
console.log('All Vite env vars:', import.meta.env);

const PayPalButtonsComponent = () => {
  const [{ isPending, isResolved, isRejected, options }] = usePayPalScriptReducer();
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    console.log(`PayPal Status Update: ${elapsed.toFixed(1)}s`, {
      isPending,
      isResolved,
      isRejected,
      clientId: options?.['client-id']?.substring(0, 10) + '...'
    });
    
    if (isPending && elapsed > 15) {
      console.error('PayPal has been loading for over 15 seconds');
    }
  }, [isPending, isResolved, isRejected, options, startTime]);

  if (isPending) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        border: '2px dashed orange',
        borderRadius: '10px',
        margin: '20px 0',
        backgroundColor: '#fff7ed'
      }}>
        <Loader2 style={{ 
          width: '48px', 
          height: '48px', 
          margin: '0 auto 16px',
          animation: 'spin 1s linear infinite'
        }} />
        <h3 style={{ margin: '0 0 8px', color: '#ea580c' }}>PayPal Loading...</h3>
        <p style={{ margin: '4px 0', fontSize: '14px' }}>Time: {elapsed}s</p>
        <p style={{ margin: '4px 0', fontSize: '12px', color: '#6b7280' }}>
          Client ID: {options?.['client-id']?.substring(0, 15) + '...'}
        </p>
        {elapsed > 10 && (
          <p style={{ margin: '8px 0', color: '#f59e0b', fontSize: '14px' }}>
            ⚠️ Taking longer than usual...
          </p>
        )}
        {elapsed > 20 && (
          <p style={{ margin: '8px 0', color: '#dc2626', fontSize: '14px' }}>
            ❌ This is abnormally slow
          </p>
        )}
      </div>
    );
  }

  if (isRejected) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        border: '2px solid red',
        borderRadius: '10px',
        margin: '20px 0',
        backgroundColor: '#fef2f2'
      }}>
        <AlertCircle style={{ 
          width: '48px', 
          height: '48px', 
          margin: '0 auto 16px',
          color: '#dc2626'
        }} />
        <h3 style={{ margin: '0 0 8px', color: '#dc2626' }}>PayPal Failed to Load</h3>
        <p style={{ margin: '8px 0', fontSize: '14px' }}>
          The PayPal SDK was rejected. This could be due to:
        </p>
        <ul style={{ textAlign: 'left', display: 'inline-block', fontSize: '14px', color: '#6b7280' }}>
          <li>Invalid client ID</li>
          <li>Network connectivity issues</li>
          <li>PayPal service downtime</li>
          <li>Browser blocking scripts</li>
        </ul>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isResolved) {
    return (
      <div style={{ margin: '20px 0' }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#f0fdf4',
          border: '2px solid #16a34a',
          borderRadius: '10px'
        }}>
          <CheckCircle style={{ 
            width: '32px', 
            height: '32px', 
            margin: '0 auto 8px',
            color: '#16a34a'
          }} />
          <h3 style={{ margin: '0 0 8px', color: '#16a34a' }}>✅ PayPal Loaded Successfully!</h3>
          <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
            Client ID: {options?.['client-id']?.substring(0, 15)}...
          </p>
        </div>
        
        <div style={{
          padding: '20px',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          backgroundColor: 'white'
        }}>
          <PayPalButtons
            style={{
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'pay',
              height: 48,
            }}
            createOrder={(data, actions) => {
              console.log('Creating PayPal test order...');
              return actions.order.create({
                intent: 'CAPTURE',
                purchase_units: [{
                  description: 'Test Payment - Maestro Essays',
                  amount: {
                    currency_code: 'USD',
                    value: '10.00',
                  }
                }],
              });
            }}
            onApprove={async (data, actions) => {
              console.log('PayPal payment approved:', data);
              try {
                const details = await actions.order.capture();
                console.log('PayPal payment captured:', details);
                alert('✅ Test Payment Successful!\nTransaction ID: ' + details.id);
              } catch (error) {
                console.error('PayPal capture error:', error);
                alert('❌ Payment capture failed: ' + error.message);
              }
            }}
            onError={(error) => {
              console.error('PayPal error:', error);
              alert('❌ PayPal error: ' + (error.message || 'Unknown error'));
            }}
            onCancel={() => {
              console.log('PayPal payment cancelled by user');
              alert('ℹ️ Payment was cancelled');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      border: '2px solid gray',
      borderRadius: '10px',
      margin: '20px 0'
    }}>
      <p>⚠️ Unknown PayPal state</p>
      <pre style={{ fontSize: '12px', textAlign: 'left' }}>
        {JSON.stringify({ isPending, isResolved, isRejected }, null, 2)}
      </pre>
    </div>
  );
};

const PayPalTestStandalone = () => {
  if (!PAYPAL_CLIENT_ID) {
    return (
      <div style={{ minHeight: '100vh', padding: '40px' }}>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          padding: '40px', 
          border: '2px solid red',
          borderRadius: '10px',
          backgroundColor: '#fef2f2',
          textAlign: 'center'
        }}>
          <AlertCircle style={{ 
            width: '48px', 
            height: '48px', 
            margin: '0 auto 16px',
            color: '#dc2626'
          }} />
          <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>PayPal Not Configured</h1>
          <p style={{ marginBottom: '16px' }}>
            <code>VITE_PAYPAL_CLIENT_ID</code> is missing from environment variables.
          </p>
          <div style={{ 
            textAlign: 'left', 
            backgroundColor: '#f3f4f6', 
            padding: '16px', 
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}>
            <p style={{ margin: '0 0 8px' }}>Check your .env.local file:</p>
            <code>VITE_PAYPAL_CLIENT_ID=your_actual_paypal_client_id</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            PayPal Integration Test (Standalone)
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            This page tests PayPal without any other components that might interfere.
          </p>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>Client ID:</strong> {PAYPAL_CLIENT_ID.substring(0, 20)}...
            </p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>App Environment:</strong> {import.meta.env.MODE}
            </p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>PayPal Environment:</strong> <span style={{ 
                color: isSandbox ? '#f59e0b' : '#16a34a', 
                fontWeight: 'bold'
              }}>{isSandbox ? '🧪 SANDBOX' : '🔴 PRODUCTION'}</span>
            </p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>Test Amount:</strong> $10.00
            </p>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
            PayPal Test Payment
          </h2>
          
          <PayPalScriptProvider
            options={{
              'client-id': PAYPAL_CLIENT_ID,
              currency: 'USD',
              intent: 'capture',
              debug: true,
              // Add sandbox URL if this is a sandbox client ID
              ...(isSandbox ? { 
                'data-sdk-integration-source': 'developer-studio',
                'disable-funding': 'credit,card' // Disable credit cards in sandbox for testing
              } : {})
            }}
          >
            <PayPalButtonsComponent />
          </PayPalScriptProvider>
        </div>

        <div style={{ 
          marginTop: '40px', 
          textAlign: 'center', 
          fontSize: '14px', 
          color: '#6b7280' 
        }}>
          <p>🔍 Check the browser console for detailed debug logs</p>
          {isSandbox ? (
            <div style={{ 
              backgroundColor: '#fef3c7', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              textAlign: 'left'
            }}>
              <p style={{ margin: '0 0 8px', fontWeight: 'bold', color: '#d97706' }}>🧪 SANDBOX MODE</p>
              <p style={{ margin: '4px 0', color: '#92400e' }}>To test payments, you need a PayPal sandbox account:</p>
              <ol style={{ margin: '8px 0', paddingLeft: '20px', color: '#92400e' }}>
                <li>Go to <a href="https://developer.paypal.com/developer/accounts/" target="_blank" style={{ color: '#d97706' }}>PayPal Developer Dashboard</a></li>
                <li>Create or use an existing sandbox account</li>
                <li>Use sandbox test credentials to log in during checkout</li>
              </ol>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#92400e' }}>Note: Regular PayPal accounts won't work with sandbox client IDs</p>
            </div>
          ) : (
            <p style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ PRODUCTION MODE - Real charges may be made!</p>
          )}
          <p>⚠️ This is a test environment</p>
        </div>
      </div>
    </div>
  );
};

export default PayPalTestStandalone;