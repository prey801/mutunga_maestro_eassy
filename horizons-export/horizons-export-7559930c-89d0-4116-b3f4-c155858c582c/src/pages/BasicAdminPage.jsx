import React, { useState, useEffect } from 'react';

const BasicAdminPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple check without complex auth context
    const checkUser = async () => {
      try {
        // Just set a test user for now
        setUser({ email: 'musyokibrian@gmail.com' });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: '#f9fafb',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            🛡️ Admin Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Welcome back, {user?.email || 'Admin'}!
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Total Revenue</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#059669' }}>
              $1,250.00
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Total Orders</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#2563eb' }}>
              15
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Pending Orders</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#d97706' }}>
              5
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Completed Orders</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#059669' }}>
              8
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          {/* Tabs */}
          <div style={{
            borderBottom: '1px solid #e5e7eb',
            padding: '0'
          }}>
            <div style={{
              display: 'flex',
              gap: '2rem',
              padding: '1rem 1.5rem 0 1.5rem'
            }}>
              <button style={{
                padding: '0.75rem 0',
                border: 'none',
                background: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#2563eb',
                borderBottom: '2px solid #2563eb',
                cursor: 'pointer'
              }}>
                Orders
              </button>
              <button style={{
                padding: '0.75rem 0',
                border: 'none',
                background: 'none',
                fontSize: '1rem',
                color: '#6b7280',
                cursor: 'pointer'
              }}>
                Clients
              </button>
              <button style={{
                padding: '0.75rem 0',
                border: 'none',
                background: 'none',
                fontSize: '1rem',
                color: '#6b7280',
                cursor: 'pointer'
              }}>
                Writers
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '1.5rem' }}>
            <h2 style={{ marginTop: '0', marginBottom: '1rem', color: '#1f2937' }}>
              Recent Orders
            </h2>
            
            {/* Sample Orders */}
            {[
              {
                id: '1',
                title: 'The Impact of Social Media on Communication',
                subject: 'Communication Studies',
                price: '$45.00',
                status: 'Pending',
                client: 'John Doe'
              },
              {
                id: '2',
                title: 'Climate Change and Economic Policy',
                subject: 'Environmental Economics', 
                price: '$75.00',
                status: 'In Progress',
                client: 'Jane Smith'
              },
              {
                id: '3',
                title: 'AI in Healthcare Systems',
                subject: 'Computer Science',
                price: '$60.00',
                status: 'Completed',
                client: 'Mike Johnson'
              }
            ].map(order => (
              <div key={order.id} style={{
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                marginBottom: '1rem',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 100px 120px',
                gap: '1rem',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ margin: '0', fontWeight: '600', color: '#1f2937' }}>
                    {order.title}
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                    Subject: {order.subject}
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                    Client: {order.client}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0', fontWeight: '600', color: '#1f2937' }}>
                    {order.price}
                  </p>
                </div>
                <div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: order.status === 'Completed' ? '#d1fae5' : 
                                   order.status === 'In Progress' ? '#dbeafe' : '#fef3c7',
                    color: order.status === 'Completed' ? '#065f46' : 
                           order.status === 'In Progress' ? '#1e40af' : '#92400e'
                  }}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <button style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Info */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#ecfdf5',
          border: '1px solid #10b981',
          borderRadius: '8px'
        }}>
          <p style={{ margin: '0', color: '#047857' }}>
            ✅ <strong>Admin panel is working!</strong> This is a basic version with sample data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasicAdminPage;