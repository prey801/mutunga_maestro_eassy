import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const isSandbox = PAYPAL_CLIENT_ID && (PAYPAL_CLIENT_ID.startsWith('Af') || PAYPAL_CLIENT_ID.startsWith('AS') || PAYPAL_CLIENT_ID.startsWith('AX'));

console.log('=== PayPal Improved Integration Test ===');
console.log('Client ID:', PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.substring(0, 10)}...` : 'MISSING');
console.log('Environment:', isSandbox ? 'SANDBOX' : 'PRODUCTION');

const ImprovedPayPalButtons = ({ amount = "25.00", orderDetails, onSuccess, onError }) => {
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    console.log(`PayPal Status: ${elapsed.toFixed(1)}s`, { isPending, isResolved, isRejected });
  }, [isPending, isResolved, isRejected, startTime]);

  if (isPending) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Loader2 style={{ width: '48px', height: '48px', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <h3>Loading PayPal...</h3>
        <p>Time: {elapsed}s</p>
        {elapsed > 10 && <p style={{ color: '#f59e0b' }}>⚠️ Taking longer than expected...</p>}
      </div>
    );
  }

  if (isRejected) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
        <AlertCircle style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#dc2626' }} />
        <h3 style={{ color: '#dc2626' }}>PayPal Failed to Load</h3>
        <p>This could be due to:</p>
        <ul style={{ textAlign: 'left', display: 'inline-block', margin: '16px 0' }}>
          <li>Network connectivity issues</li>
          <li>Invalid PayPal Client ID</li>
          <li>PayPal service downtime</li>
          <li>Browser blocking PayPal scripts</li>
        </ul>
        <button onClick={() => window.location.reload()} style={{
          padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
        }}>
          Retry
        </button>
      </div>
    );
  }

  if (isResolved) {
    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: '20px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <CheckCircle style={{ width: '24px', height: '24px', margin: '0 auto 8px', color: '#16a34a' }} />
          <p style={{ color: '#16a34a', fontWeight: 'bold' }}>✅ PayPal SDK Loaded Successfully!</p>
        </div>

        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 55,
            tagline: false
          }}
          createOrder={(data, actions) => {
            console.log('🔨 Creating PayPal order...');
            console.log('Order details:', orderDetails);

            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [{
                reference_id: orderDetails?.id || 'test-order-' + Date.now(),
                description: orderDetails?.description || 'Maestro Essays - Academic Writing Service',
                amount: {
                  currency_code: 'USD',
                  value: amount,
                  breakdown: {
                    item_total: {
                      currency_code: 'USD',
                      value: amount
                    }
                  }
                },
                items: [{
                  name: orderDetails?.paperType || 'Academic Paper',
                  description: orderDetails?.details || 'Professional academic writing service',
                  quantity: '1',
                  unit_amount: {
                    currency_code: 'USD',
                    value: amount
                  },
                  category: 'DIGITAL_GOODS'
                }]
              }],
              application_context: {
                brand_name: 'Maestro Essays',
                landing_page: 'LOGIN', // Forces login page for better sandbox testing
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                return_url: window.location.origin + '/payment-success',
                cancel_url: window.location.origin + '/payment-cancelled'
              }
            }).then(orderID => {
              console.log('✅ PayPal Order Created:', orderID);
              return orderID;
            }).catch(error => {
              console.error('❌ PayPal Order Creation Failed:', error);
              throw error;
            });
          }}
          
          onApprove={async (data, actions) => {
            console.log('🎉 PayPal payment approved:', data);
            
            try {
              // Capture the payment
              const details = await actions.order.capture();
              console.log('💰 Payment captured:', details);
              
              // Verify payment details
              if (details.status === 'COMPLETED') {
                console.log('✅ Payment completed successfully');
                onSuccess && onSuccess(details);
              } else {
                console.warn('⚠️ Payment status:', details.status);
                onError && onError(new Error(`Payment status: ${details.status}`));
              }
            } catch (error) {
              console.error('❌ Payment capture failed:', error);
              onError && onError(error);
            }
          }}

          onCancel={(data) => {
            console.log('❌ PayPal payment cancelled:', data);
            alert('Payment was cancelled. You can try again or contact support if you need help.');
          }}

          onError={(err) => {
            console.error('❌ PayPal error:', err);
            
            let errorMessage = 'PayPal payment failed.';
            
            if (typeof err === 'string') {
              errorMessage = err;
            } else if (err.message) {
              errorMessage = err.message;
            }
            
            // Common PayPal errors and solutions
            if (errorMessage.includes('popup')) {
              errorMessage += '\n\nTip: Make sure popup blockers are disabled for this site.';
            } else if (errorMessage.includes('network')) {
              errorMessage += '\n\nTip: Check your internet connection and try again.';
            } else if (isSandbox && errorMessage.includes('login')) {
              errorMessage += '\n\nSandbox Tip: Use PayPal sandbox test account credentials, not your regular PayPal account.';
            }
            
            alert('PayPal Error: ' + errorMessage);
            onError && onError(err);
          }}
        />
      </div>
    );
  }

  return null;
};

const PayPalImprovedTest = () => {
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, success, error
  const [lastPaymentDetails, setLastPaymentDetails] = useState(null);

  // Sample order details (would come from your order system)
  const orderDetails = {
    id: 'test-order-' + Date.now(),
    paperType: 'Research Paper',
    academicLevel: 'University',
    pages: 5,
    deadline: '7 days',
    description: 'Academic research paper on environmental science',
    details: 'Custom research paper with citations and bibliography'
  };

  const handlePaymentSuccess = (details) => {
    console.log('🎉 Payment successful!', details);
    setLastPaymentDetails(details);
    setPaymentStatus('success');
    
    // Here you would typically:
    // 1. Save payment details to your database
    // 2. Update order status
    // 3. Send confirmation email
    // 4. Redirect to success page
  };

  const handlePaymentError = (error) => {
    console.error('❌ Payment failed:', error);
    setPaymentStatus('error');
  };

  if (!PAYPAL_CLIENT_ID) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '500px', padding: '40px', textAlign: 'center' }}>
          <AlertCircle style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: '#dc2626' }} />
          <h1>PayPal Not Configured</h1>
          <p>VITE_PAYPAL_CLIENT_ID is missing from environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <button
            onClick={() => navigate('/')}
            style={{ marginBottom: '16px', padding: '8px 16px', background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
          >
            ← Back to Home
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            PayPal Integration Test (Improved)
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Following PayPal REST API best practices and improved error handling.
          </p>
        </div>

        {/* Environment Info */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '32px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Configuration</h2>
          <div style={{ display: 'grid', gap: '8px' }}>
            <p><strong>Client ID:</strong> {PAYPAL_CLIENT_ID.substring(0, 20)}...</p>
            <p><strong>Environment:</strong> 
              <span style={{ 
                marginLeft: '8px', 
                padding: '2px 8px', 
                backgroundColor: isSandbox ? '#fef3c7' : '#fef2f2', 
                color: isSandbox ? '#d97706' : '#dc2626',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {isSandbox ? '🧪 SANDBOX' : '🔴 PRODUCTION'}
              </span>
            </p>
            <p><strong>Test Amount:</strong> $25.00</p>
          </div>
        </div>

        {/* Order Details */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '32px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Sample Order</h2>
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
            <p><strong>Paper Type:</strong> {orderDetails.paperType}</p>
            <p><strong>Academic Level:</strong> {orderDetails.academicLevel}</p>
            <p><strong>Pages:</strong> {orderDetails.pages}</p>
            <p><strong>Deadline:</strong> {orderDetails.deadline}</p>
            <p><strong>Description:</strong> {orderDetails.description}</p>
          </div>
        </div>

        {/* Payment Section */}
        {paymentStatus === 'success' ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
            <CheckCircle style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: '#16a34a' }} />
            <h2 style={{ color: '#16a34a', marginBottom: '16px' }}>Payment Successful! 🎉</h2>
            <p style={{ marginBottom: '16px' }}>Transaction ID: {lastPaymentDetails?.id}</p>
            <p style={{ marginBottom: '24px', color: '#6b7280' }}>
              Amount: ${lastPaymentDetails?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value}
            </p>
            <button
              onClick={() => { setPaymentStatus('pending'); setLastPaymentDetails(null); }}
              style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Test Another Payment
            </button>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
              Complete Your Payment
            </h2>
            
            <PayPalScriptProvider
              options={{
                'client-id': PAYPAL_CLIENT_ID,
                currency: 'USD',
                intent: 'capture',
                debug: true,
                components: 'buttons',
                ...(isSandbox && {
                  'data-sdk-integration-source': 'developer-studio'
                })
              }}
            >
              <ImprovedPayPalButtons
                amount="25.00"
                orderDetails={orderDetails}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </PayPalScriptProvider>
          </div>
        )}

        {/* Sandbox Instructions */}
        {isSandbox && (
          <div style={{ marginTop: '32px', backgroundColor: '#fef3c7', padding: '24px', borderRadius: '12px', border: '1px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Info style={{ width: '20px', height: '20px', color: '#d97706', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h3 style={{ color: '#d97706', margin: '0 0 8px', fontSize: '16px', fontWeight: 'bold' }}>Sandbox Testing Guide</h3>
                <p style={{ color: '#92400e', margin: '0 0 12px', fontSize: '14px' }}>
                  This is a sandbox environment. To test payments:
                </p>
                <ol style={{ color: '#92400e', paddingLeft: '20px', margin: '0', fontSize: '14px' }}>
                  <li>Click the PayPal button above</li>
                  <li>Use sandbox test account credentials (not your real PayPal account)</li>
                  <li>Create sandbox accounts at <a href="https://developer.paypal.com/developer/accounts/" target="_blank" style={{ color: '#d97706' }}>PayPal Developer Dashboard</a></li>
                </ol>
                <p style={{ color: '#92400e', margin: '12px 0 0', fontSize: '12px', fontStyle: 'italic' }}>
                  Note: Regular PayPal accounts will not work with sandbox Client IDs
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayPalImprovedTest;