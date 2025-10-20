import React, { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import SandboxCredentials from '../components/SandboxCredentials';

const PayPalBasicTutorial = () => {
    const [{ options, isPending }, dispatch] = usePayPalScriptReducer();
    const [currency, setCurrency] = useState(options.currency);

    console.log('=== PayPal Basic Tutorial Test ===');
    console.log('Options:', options);
    console.log('isPending:', isPending);
    console.log('Currency:', currency);

    const onCurrencyChange = ({ target: { value } }) => {
        console.log('Currency changed to:', value);
        setCurrency(value);
        dispatch({
            type: "resetOptions",
            value: {
                ...options,
                currency: value,
            },
        });
    }

    const onCreateOrder = (data, actions) => {
        console.log('🔨 Creating PayPal order...');
        console.log('Data:', data);
        
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: "25.99", // Your essay service price
                    },
                },
            ],
        }).then(orderID => {
            console.log('✅ Order created with ID:', orderID);
            return orderID;
        }).catch(error => {
            console.error('❌ Order creation failed:', error);
            throw error;
        });
    }

    const onApproveOrder = (data, actions) => {
        console.log('🎉 PayPal payment approved:', data);
        
        return actions.order.capture().then((details) => {
            console.log('💰 Payment captured:', details);
            const name = details.payer.name.given_name;
            alert(`Transaction completed by ${name}!\nTransaction ID: ${details.id}\nAmount: $${details.purchase_units[0].payments.captures[0].amount.value}`);
        }).catch(error => {
            console.error('❌ Payment capture failed:', error);
            alert('Payment capture failed: ' + error.message);
        });
    }

    const onError = (error) => {
        console.error('❌ PayPal error:', error);
        alert('PayPal Error: ' + (error.message || error));
    }

    const onCancel = (data) => {
        console.log('❌ PayPal payment cancelled:', data);
        alert('Payment was cancelled. You can try again if needed.');
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            padding: '40px', 
            backgroundColor: '#f9fafb',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                        PayPal Basic Tutorial Test
                    </h1>
                    <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                        Following the exact structure from PayPal's official React tutorial
                    </p>
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '16px', 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        marginBottom: '24px'
                    }}>
                        <p style={{ margin: '4px 0', fontSize: '14px' }}>
                            <strong>Client ID:</strong> {options['client-id']?.substring(0, 20)}...
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '14px' }}>
                            <strong>Environment:</strong> {options['client-id']?.startsWith('Af') ? '🧪 SANDBOX' : '🔴 PRODUCTION'}
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '14px' }}>
                            <strong>Current Currency:</strong> {currency}
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '14px' }}>
                            <strong>Loading State:</strong> {isPending ? '⏳ Loading...' : '✅ Ready'}
                        </p>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <h2 style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        marginBottom: '24px', 
                        textAlign: 'center' 
                    }}>
                        Maestro Essays Checkout
                    </h2>
                    
                    {isPending ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                border: '4px solid #f3f4f6',
                                borderTop: '4px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 16px'
                            }}></div>
                            <p style={{ fontSize: '18px', color: '#6b7280' }}>LOADING PAYPAL...</p>
                            <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
                                This may take a few seconds
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    fontSize: '14px', 
                                    fontWeight: 'bold', 
                                    marginBottom: '8px',
                                    color: '#374151'
                                }}>
                                    Select Currency:
                                </label>
                                <select 
                                    value={currency} 
                                    onChange={onCurrencyChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '16px',
                                        border: '2px solid #d1d5db',
                                        borderRadius: '8px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="USD">💵 USD - US Dollar</option>
                                    <option value="EUR">💶 EUR - Euro</option>
                                    <option value="GBP">💷 GBP - British Pound</option>
                                </select>
                            </div>
                            
                            <div style={{
                                backgroundColor: '#f8fafc',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 'bold' }}>Order Summary</h3>
                                <p style={{ margin: '4px 0', fontSize: '14px' }}>Academic Essay Writing Service</p>
                                <p style={{ margin: '4px 0', fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
                                    Total: {currency === 'EUR' ? '€23.99' : currency === 'GBP' ? '£21.99' : '$25.99'}
                                </p>
                            </div>

                            <PayPalButtons 
                                style={{ 
                                    layout: "vertical",
                                    color: "gold",
                                    shape: "rect",
                                    label: "pay",
                                    height: 50
                                }}
                                createOrder={(data, actions) => onCreateOrder(data, actions)}
                                onApprove={(data, actions) => onApproveOrder(data, actions)}
                                onError={onError}
                                onCancel={onCancel}
                            />
                        </>
                    )}
                </div>

                {/* Sandbox Credentials Helper */}
                {options['client-id']?.startsWith('Af') && <SandboxCredentials />}

                <div style={{ 
                    marginTop: '32px', 
                    textAlign: 'center', 
                    fontSize: '14px', 
                    color: '#6b7280' 
                }}>
                    <p>🔍 Check the browser console for detailed logs</p>
                    <p>🧪 This follows PayPal's official React tutorial structure</p>
                </div>
            </div>

            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
}

export default PayPalBasicTutorial;