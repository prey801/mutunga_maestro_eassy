import React, { useState } from 'react';
import { Eye, EyeOff, Copy, CheckCircle } from 'lucide-react';

const SandboxCredentials = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const credentials = {
    url: 'https://sandbox.paypal.com',
    email: 'sb-twhj4746404728@business.example.com',
    password: 'Vh-^X8(2'
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div style={{
      backgroundColor: '#fef3c7',
      border: '2px solid #f59e0b',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '24px'
    }}>
      <h3 style={{ 
        color: '#d97706', 
        margin: '0 0 16px', 
        fontSize: '18px', 
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🧪 PayPal Sandbox Test Credentials
      </h3>
      
      <div style={{ marginBottom: '16px' }}>
        <p style={{ color: '#92400e', fontSize: '14px', margin: '0 0 16px' }}>
          Use these credentials to test PayPal payments in sandbox mode:
        </p>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          {/* Sandbox URL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ minWidth: '80px', fontWeight: 'bold', color: '#92400e', fontSize: '14px' }}>
              Sandbox URL:
            </label>
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 12px'
            }}>
              <code style={{ flex: 1, fontSize: '13px', fontFamily: 'monospace' }}>
                {credentials.url}
              </code>
              <button
                onClick={() => copyToClipboard(credentials.url, 'url')}
                style={{
                  marginLeft: '8px',
                  padding: '4px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                title="Copy URL"
              >
                {copiedField === 'url' ? 
                  <CheckCircle size={16} color="#16a34a" /> : 
                  <Copy size={16} />
                }
              </button>
            </div>
          </div>

          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ minWidth: '80px', fontWeight: 'bold', color: '#92400e', fontSize: '14px' }}>
              Email:
            </label>
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 12px'
            }}>
              <code style={{ flex: 1, fontSize: '13px', fontFamily: 'monospace' }}>
                {credentials.email}
              </code>
              <button
                onClick={() => copyToClipboard(credentials.email, 'email')}
                style={{
                  marginLeft: '8px',
                  padding: '4px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                title="Copy Email"
              >
                {copiedField === 'email' ? 
                  <CheckCircle size={16} color="#16a34a" /> : 
                  <Copy size={16} />
                }
              </button>
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ minWidth: '80px', fontWeight: 'bold', color: '#92400e', fontSize: '14px' }}>
              Password:
            </label>
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 12px'
            }}>
              <code style={{ flex: 1, fontSize: '13px', fontFamily: 'monospace' }}>
                {showPassword ? credentials.password : '••••••••'}
              </code>
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  marginLeft: '8px',
                  padding: '4px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={() => copyToClipboard(credentials.password, 'password')}
                style={{
                  marginLeft: '4px',
                  padding: '4px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                title="Copy Password"
              >
                {copiedField === 'password' ? 
                  <CheckCircle size={16} color="#16a34a" /> : 
                  <Copy size={16} />
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '16px'
      }}>
        <h4 style={{ margin: '0 0 8px', color: '#d97706', fontSize: '14px', fontWeight: 'bold' }}>
          🔄 Testing Steps:
        </h4>
        <ol style={{ margin: '0', paddingLeft: '20px', color: '#92400e', fontSize: '13px' }}>
          <li>Click the PayPal button above</li>
          <li>PayPal login page will open in popup/new tab</li>
          <li>Use the email and password above to login</li>
          <li>Complete the test payment</li>
          <li>You'll see a success message with transaction details</li>
        </ol>
        <p style={{ margin: '8px 0 0', color: '#92400e', fontSize: '12px', fontStyle: 'italic' }}>
          💡 These are test credentials - no real money will be charged!
        </p>
      </div>
    </div>
  );
};

export default SandboxCredentials;