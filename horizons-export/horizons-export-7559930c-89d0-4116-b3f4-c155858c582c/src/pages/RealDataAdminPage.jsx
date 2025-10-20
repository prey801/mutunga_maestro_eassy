import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const RealDataAdminPage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState('checking');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Initialize with current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch real data from database
  useEffect(() => {
    const fetchRealData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check authentication first
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔑 Session check:', {
          hasSession: !!session,
          userEmail: session?.user?.email || 'not logged in'
        });
        
        if (!session) {
          console.warn('⚠️ No active session - using sample data');
          setDbStatus('disconnected');
          loadSampleData();
          setLoading(false);
          return;
        }
        
        console.log('🔄 Fetching real data from Supabase...');

        // Fetch orders with detailed debugging
        console.log('📝 Attempting to fetch orders...');
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        console.log('Orders query result:', { 
          hasData: !!ordersData,
          dataLength: ordersData?.length || 0,
          error: ordersError?.message || null,
          errorCode: ordersError?.code || null,
          errorDetails: ordersError?.details || null
        });

        if (ordersError) {
          console.warn('Orders fetch failed:', ordersError);
          // Don't fail entirely if orders can't be fetched
          setOrders([]);
        } else {
          console.log(`📊 Loaded ${ordersData?.length || 0} orders`);
          setOrders(ordersData || []);
          // Mark as connected if we successfully read orders
          setDbStatus('connected');
        }

        // Fetch profiles with detailed debugging
        console.log('👥 Attempting to fetch profiles...');
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        console.log('Profiles query result:', { 
          hasData: !!profilesData,
          dataLength: profilesData?.length || 0,
          error: profilesError?.message || null,
          errorCode: profilesError?.code || null
        });

        if (profilesError) {
          console.warn('Profiles fetch failed:', profilesError);
          setClients([]);
          setWriters([]);
        } else {
          const profiles = profilesData || [];
          const clientProfiles = profiles.filter(p => !p.is_writer && !p.is_admin);
          const writerProfiles = profiles.filter(p => p.is_writer);
          
          console.log(`👥 Loaded ${clientProfiles.length} clients and ${writerProfiles.length} writers`);
          setClients(clientProfiles);
          setWriters(writerProfiles);
          // Mark as connected if we got profiles
          if (!ordersError || !profilesError) {
            setDbStatus('connected');
          }
        }

      } catch (error) {
        console.error('❌ Error fetching real data:', error);
        setError(error.message || 'Failed to load data');
        setDbStatus('disconnected');
        // Use fallback sample data only if everything failed
        loadSampleData();
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  // Fallback sample data - only use if absolutely nothing works
  const loadSampleData = () => {
    console.log('📊 Loading sample data as fallback');
    if (orders.length === 0) {
      setOrders([
        {
          id: 'sample-1',
          topic: 'Sample Essay: Business Analysis',
          subject: 'Business',
          pages: 5,
          price: 75.00,
          status: 'pending',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 'sample-2',
          topic: 'Climate Change Research Paper',
          subject: 'Environmental Science',
          pages: 8,
          price: 120.00,
          status: 'in-progress',
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    }
    
    if (clients.length === 0) {
      setClients([
        { id: 'sample-client-1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
        { id: 'sample-client-2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' }
      ]);
    }
    
    if (writers.length === 0) {
      setWriters([
        { id: 'sample-writer-1', first_name: 'Alice', last_name: 'Writer', email: 'alice@writers.com', rating: 4.8, total_orders_completed: 25 }
      ]);
    }
  };

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.price || 0), 0),
    pendingOrders: orders.filter(order => order.status === 'pending').length,
    completedOrders: orders.filter(order => order.status === 'completed').length
  };

  // Filter orders by search term
  const filteredOrders = orders.filter(order =>
    !searchTerm || 
    (order.topic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // View Details handler
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  // Get status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' };
      case 'assigned': return { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' };
      case 'in-progress': return { bg: '#bfdbfe', text: '#1d4ed8', border: '#2563eb' };
      case 'completed': return { bg: '#d1fae5', text: '#065f46', border: '#10b981' };
      case 'cancelled': return { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' };
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          <h2 style={{ color: '#374151', margin: 0 }}>Loading Admin Dashboard...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !orders.length && !clients.length) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        padding: '2rem',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #fbbf24'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#f59e0b',
            marginBottom: '1rem'
          }}>
            ⚠️ Database Connection Issue
          </h1>
          <p style={{ color: '#374151', marginBottom: '1rem' }}>
            Unable to connect to the database. Using sample data instead.
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Error: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
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
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            🛡️ Admin Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '1rem' }}>
            Welcome back, {user?.email || 'Admin'}!
          </p>
          
          {/* Database Status */}
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: `1px solid ${dbStatus === 'connected' ? '#10b981' : '#f59e0b'}`,
            backgroundColor: dbStatus === 'connected' ? '#ecfdf5' : '#fffbeb',
            marginBottom: '1rem'
          }}>
            <span style={{ 
              color: dbStatus === 'connected' ? '#047857' : '#92400e',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              {dbStatus === 'connected' ? '✅ Database Connected' : '⚠️ Using Sample Data'} 
              {dbStatus === 'connected' && ` - ${orders.length} orders, ${clients.length} clients, ${writers.length} writers`}
            </span>
          </div>
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
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '0.875rem', fontWeight: '600' }}>Total Revenue</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#059669' }}>
              ${stats.totalRevenue.toFixed(2)}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
              {dbStatus === 'connected' ? 'Real data' : 'Sample data'}
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '0.875rem', fontWeight: '600' }}>Total Orders</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#2563eb' }}>
              {stats.totalOrders}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
              {filteredOrders.length} showing
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '0.875rem', fontWeight: '600' }}>Pending Orders</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#d97706' }}>
              {stats.pendingOrders}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
              Need attention
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '0.875rem', fontWeight: '600' }}>Completed Orders</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#059669' }}>
              {stats.completedOrders}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
              Successfully delivered
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search orders by topic, subject, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.75rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem',
              backgroundColor: 'white'
            }}
          />
        </div>

        {/* Orders List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <h2 style={{ margin: '0', color: '#1f2937', fontSize: '1.25rem', fontWeight: '700' }}>
              Orders Management ({filteredOrders.length})
            </h2>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No orders found</h3>
                <p style={{ margin: '0', fontSize: '0.875rem' }}>
                  {dbStatus === 'connected' 
                    ? 'Orders will appear here when customers place them.'
                    : 'Connect your database to see real orders.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredOrders.map(order => {
                  const statusStyle = getStatusColor(order.status || 'pending');
                  return (
                    <div key={order.id} style={{
                      padding: '1.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: '#fafafa',
                      transition: 'box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
                    onMouseLeave={(e) => e.target.style.boxShadow = 'none'}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'minmax(300px, 2fr) 1fr 120px 100px', 
                        gap: '1rem', 
                        alignItems: 'start',
                        '@media (max-width: 768px)': {
                          gridTemplateColumns: '1fr',
                          gap: '0.75rem'
                        }
                      }}>
                        <div>
                          <h3 style={{ 
                            margin: '0 0 0.5rem 0', 
                            color: '#1f2937', 
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            lineHeight: '1.4'
                          }}>
                            {order.topic}
                          </h3>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
                            <p style={{ margin: '0' }}>ID: <strong>{order.id}</strong></p>
                            <p style={{ margin: '0.25rem 0' }}>Subject: {order.subject || 'Not specified'}</p>
                            <p style={{ margin: '0.25rem 0' }}>
                              Created: {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p style={{ 
                            margin: '0', 
                            fontSize: '1.25rem', 
                            fontWeight: 'bold', 
                            color: '#1f2937' 
                          }}>
                            ${order.price}
                          </p>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                            {order.pages ? `${order.pages} pages` : 'Pages not set'}
                          </p>
                          {order.deadline && (
                            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                              Due: {new Date(order.deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                            border: `1px solid ${statusStyle.border}`,
                            textTransform: 'capitalize'
                          }}>
                            {order.status || 'pending'}
                          </span>
                        </div>
                        
                        <div>
                          <button 
                            onClick={() => handleViewDetails(order)}
                            style={{
                            width: '100%',
                            padding: '0.5rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f3f4f6';
                            e.target.style.borderColor = '#9ca3af';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.borderColor = '#d1d5db';
                          }}>
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Clients & Writers Summary */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <h3 style={{ margin: '0', color: '#1f2937', fontSize: '1.125rem', fontWeight: '600' }}>
                Clients ({clients.length})
              </h3>
            </div>
            <div style={{ padding: '1rem' }}>
              {clients.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', margin: '2rem 0', fontSize: '0.875rem' }}>
                  No clients found
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {clients.slice(0, 5).map(client => (
                    <div key={client.id} style={{
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <p style={{ margin: '0', fontWeight: '600', color: '#1f2937', fontSize: '0.875rem' }}>
                        {client.first_name && client.last_name 
                          ? `${client.first_name} ${client.last_name}` 
                          : client.email || 'Unknown'}
                      </p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                        {client.email}
                      </p>
                    </div>
                  ))}
                  {clients.length > 5 && (
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
                      And {clients.length - 5} more...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <h3 style={{ margin: '0', color: '#1f2937', fontSize: '1.125rem', fontWeight: '600' }}>
                Writers ({writers.length})
              </h3>
            </div>
            <div style={{ padding: '1rem' }}>
              {writers.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', margin: '2rem 0', fontSize: '0.875rem' }}>
                  No writers found
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {writers.slice(0, 5).map(writer => (
                    <div key={writer.id} style={{
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <p style={{ margin: '0', fontWeight: '600', color: '#1f2937', fontSize: '0.875rem' }}>
                        {writer.first_name && writer.last_name 
                          ? `${writer.first_name} ${writer.last_name}` 
                          : writer.email || 'Unknown'}
                      </p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                        ⭐ {writer.rating || '0.0'} • {writer.total_orders_completed || 0} orders completed
                      </p>
                    </div>
                  ))}
                  {writers.length > 5 && (
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
                      And {writers.length - 5} more...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={closeModal}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h2 style={{
                  margin: '0',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>
                  Order Details
                </h2>
                <button
                  onClick={closeModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    color: '#6b7280',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  ×
                </button>
              </div>

              {/* Order Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: '#1f2937', 
                    fontSize: '1.25rem',
                    fontWeight: '600'
                  }}>
                    {selectedOrder.topic}
                  </h3>
                  <div style={{
                    display: 'inline-block',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: getStatusColor(selectedOrder.status || 'pending').bg,
                    color: getStatusColor(selectedOrder.status || 'pending').text,
                    border: `1px solid ${getStatusColor(selectedOrder.status || 'pending').border}`,
                    textTransform: 'capitalize',
                    marginTop: '0.5rem'
                  }}>
                    {selectedOrder.status || 'pending'}
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  padding: '1.5rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>Order ID</p>
                    <p style={{ margin: '0', fontSize: '1rem', color: '#1f2937', fontWeight: '500' }}>{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>Subject</p>
                    <p style={{ margin: '0', fontSize: '1rem', color: '#1f2937' }}>{selectedOrder.subject || 'Not specified'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>Price</p>
                    <p style={{ margin: '0', fontSize: '1.25rem', color: '#059669', fontWeight: 'bold' }}>${selectedOrder.price}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>Pages</p>
                    <p style={{ margin: '0', fontSize: '1rem', color: '#1f2937' }}>{selectedOrder.pages || 'Not set'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>Created</p>
                    <p style={{ margin: '0', fontSize: '1rem', color: '#1f2937' }}>
                      {new Date(selectedOrder.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>Deadline</p>
                    <p style={{ margin: '0', fontSize: '1rem', color: '#1f2937' }}>
                      {selectedOrder.deadline 
                        ? new Date(selectedOrder.deadline).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Not set'}
                    </p>
                  </div>
                </div>

                {/* Order Details Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* Academic Details */}
                  {(selectedOrder.academic_level || selectedOrder.citation_style || selectedOrder.paper_type || selectedOrder.urgency) && (
                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.125rem', fontWeight: '600', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                        📚 Academic Details
                      </h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                      }}>
                        {selectedOrder.paper_type && (
                          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#64748b', fontWeight: '600' }}>Paper Type</p>
                            <p style={{ margin: '0', fontSize: '1rem', color: '#1e293b', fontWeight: '500' }}>{selectedOrder.paper_type}</p>
                          </div>
                        )}
                        {selectedOrder.academic_level && (
                          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#64748b', fontWeight: '600' }}>Academic Level</p>
                            <p style={{ margin: '0', fontSize: '1rem', color: '#1e293b', fontWeight: '500' }}>{selectedOrder.academic_level}</p>
                          </div>
                        )}
                        {selectedOrder.citation_style && (
                          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#64748b', fontWeight: '600' }}>Citation Style</p>
                            <p style={{ margin: '0', fontSize: '1rem', color: '#1e293b', fontWeight: '500' }}>{selectedOrder.citation_style}</p>
                          </div>
                        )}
                        {selectedOrder.urgency && (
                          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#64748b', fontWeight: '600' }}>Urgency</p>
                            <p style={{ margin: '0', fontSize: '1rem', color: '#1e293b', fontWeight: '500' }}>{selectedOrder.urgency}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Description */}
                  {selectedOrder.description && (
                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.125rem', fontWeight: '600', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                        📝 Order Description
                      </h4>
                      <div style={{
                        padding: '1.5rem',
                        backgroundColor: '#fefefe',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        color: '#374151',
                        lineHeight: '1.6',
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}>
                        {selectedOrder.description}
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  {selectedOrder.instructions && (
                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.125rem', fontWeight: '600', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                        📋 Special Instructions
                      </h4>
                      <div style={{
                        padding: '1.5rem',
                        backgroundColor: '#fff7ed',
                        border: '1px solid #fed7aa',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        color: '#9a3412',
                        lineHeight: '1.6',
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}>
                        {selectedOrder.instructions}
                      </div>
                    </div>
                  )}

                  {/* Uploaded Documents */}
                  <div>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.125rem', fontWeight: '600', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                      📎 Uploaded Documents
                    </h4>
                    {selectedOrder.uploaded_files && selectedOrder.uploaded_files.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {selectedOrder.uploaded_files.map((file, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            backgroundColor: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '8px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#0ea5e9',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 'bold'
                              }}>
                                📄
                              </div>
                              <div>
                                <p style={{ margin: '0', fontSize: '0.875rem', fontWeight: '600', color: '#0c4a6e' }}>
                                  {file.name || file.filename || `Document ${index + 1}`}
                                </p>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                                  {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                                  {file.type && ` • ${file.type}`}
                                  {file.uploaded_at && ` • Uploaded ${new Date(file.uploaded_at).toLocaleDateString()}`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (file.url || file.path) {
                                  window.open(file.url || file.path, '_blank');
                                } else {
                                  alert('File URL not available');
                                }
                              }}
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#0ea5e9',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#0284c7'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#0ea5e9'}
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        backgroundColor: '#f8fafc',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        color: '#64748b'
                      }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📎</div>
                        <p style={{ margin: '0', fontSize: '0.875rem', fontWeight: '500' }}>No documents uploaded</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>Customer didn't upload any files with this order</p>
                      </div>
                    )}
                  </div>

                  {/* Additional Information */}
                  {(selectedOrder.sources || selectedOrder.word_count || selectedOrder.spacing || selectedOrder.language) && (
                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.125rem', fontWeight: '600', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                        ℹ️ Additional Information
                      </h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                      }}>
                        {selectedOrder.word_count && (
                          <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#475569', fontWeight: '600' }}>Word Count</p>
                            <p style={{ margin: '0', fontSize: '1rem', color: '#1e293b', fontWeight: '500' }}>{selectedOrder.word_count}</p>
                          </div>
                        )}
                        {selectedOrder.sources && (
                          <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#475569', fontWeight: '600' }}>Sources Required</p>
                            <p style={{ margin: '0', fontSize: '1rem', color: '#1e293b', fontWeight: '500' }}>{selectedOrder.sources}</p>
                          </div>
                        )}
                        {selectedOrder.spacing && (
                          <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#475569', fontWeight: '600' }}>Spacing</p>
                            <p style={{ margin: '0', fontSize: '1rem', color: '#1e293b', fontWeight: '500' }}>{selectedOrder.spacing}</p>
                          </div>
                        )}
                        {selectedOrder.language && (
                          <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#475569', fontWeight: '600' }}>Language</p>
                            <p style={{ margin: '0', fontSize: '1rem', color: '#1e293b', fontWeight: '500' }}>{selectedOrder.language}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment & Contact Information */}
                  <div>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.125rem', fontWeight: '600', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                      💰 Payment & Contact Details
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem'
                    }}>
                      {selectedOrder.payment_status && (
                        <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#15803d', fontWeight: '600' }}>Payment Status</p>
                          <p style={{ 
                            margin: '0', 
                            fontSize: '1rem', 
                            color: selectedOrder.payment_status === 'paid' ? '#15803d' : '#dc2626', 
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {selectedOrder.payment_status}
                          </p>
                        </div>
                      )}
                      {selectedOrder.customer_email && (
                        <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#92400e', fontWeight: '600' }}>Customer Email</p>
                          <p style={{ margin: '0', fontSize: '1rem', color: '#92400e', fontWeight: '500' }}>{selectedOrder.customer_email}</p>
                        </div>
                      )}
                      {selectedOrder.payment_id && (
                        <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#15803d', fontWeight: '600' }}>Payment ID</p>
                          <p style={{ margin: '0', fontSize: '0.875rem', color: '#15803d', fontWeight: '400', fontFamily: 'monospace' }}>{selectedOrder.payment_id}</p>
                        </div>
                      )}
                      {selectedOrder.assigned_writer_id && (
                        <div style={{ padding: '1rem', backgroundColor: '#e0e7ff', borderRadius: '8px', border: '1px solid #a5b4fc' }}>
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#3730a3', fontWeight: '600' }}>Assigned Writer</p>
                          <p style={{ margin: '0', fontSize: '1rem', color: '#3730a3', fontWeight: '500' }}>Writer ID: {selectedOrder.assigned_writer_id}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.125rem', fontWeight: '600', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                      ⚡ Quick Actions
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '0.75rem'
                    }}>
                      {/* Mark as Paid */}
                      <button
                        onClick={() => {
                          if (confirm(`Mark order ${selectedOrder.id} as PAID?\n\nThis will update the payment status in the database.`)) {
                            // TODO: Update payment status in database
                            alert('Payment status updated to PAID\n\nNote: Database update functionality needs to be implemented.');
                          }
                        }}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: selectedOrder.payment_status === 'paid' ? '#dcfce7' : '#f0fdf4',
                          color: selectedOrder.payment_status === 'paid' ? '#15803d' : '#166534',
                          border: `1px solid ${selectedOrder.payment_status === 'paid' ? '#bbf7d0' : '#16a34a'}`,
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: selectedOrder.payment_status === 'paid' ? 'default' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: selectedOrder.payment_status === 'paid' ? 0.7 : 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedOrder.payment_status !== 'paid') {
                            e.target.style.backgroundColor = '#dcfce7';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedOrder.payment_status !== 'paid') {
                            e.target.style.backgroundColor = '#f0fdf4';
                          }
                        }}
                        disabled={selectedOrder.payment_status === 'paid'}
                      >
                        <div style={{ fontSize: '1.2rem' }}>💰</div>
                        {selectedOrder.payment_status === 'paid' ? 'PAID ✓' : 'Mark Paid'}
                      </button>

                      {/* Mark as Done */}
                      <button
                        onClick={() => {
                          if (confirm(`Mark order ${selectedOrder.id} as COMPLETED?\n\nThis will update the order status to completed.`)) {
                            // TODO: Update order status in database
                            alert('Order status updated to COMPLETED\n\nNote: Database update functionality needs to be implemented.');
                          }
                        }}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: selectedOrder.status === 'completed' ? '#dcfce7' : '#ecfdf5',
                          color: selectedOrder.status === 'completed' ? '#15803d' : '#059669',
                          border: `1px solid ${selectedOrder.status === 'completed' ? '#bbf7d0' : '#10b981'}`,
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: selectedOrder.status === 'completed' ? 'default' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: selectedOrder.status === 'completed' ? 0.7 : 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedOrder.status !== 'completed') {
                            e.target.style.backgroundColor = '#dcfce7';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedOrder.status !== 'completed') {
                            e.target.style.backgroundColor = '#ecfdf5';
                          }
                        }}
                        disabled={selectedOrder.status === 'completed'}
                      >
                        <div style={{ fontSize: '1.2rem' }}>✓</div>
                        {selectedOrder.status === 'completed' ? 'DONE ✓' : 'Mark Done'}
                      </button>

                      {/* Contact Customer */}
                      <button
                        onClick={() => {
                          const email = selectedOrder.customer_email;
                          if (email) {
                            const subject = `Regarding your order #${selectedOrder.id}`;
                            const body = `Dear Customer,\n\nI hope this email finds you well. I'm writing regarding your recent order:\n\nOrder ID: ${selectedOrder.id}\nTopic: ${selectedOrder.topic}\nStatus: ${selectedOrder.status || 'pending'}\n\nBest regards,\nMaestro Essays Team`;
                            const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                            window.open(mailtoLink);
                          } else {
                            alert('Customer email not available for this order.');
                          }
                        }}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #3b82f6',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#dbeafe';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#eff6ff';
                        }}
                      >
                        <div style={{ fontSize: '1.2rem' }}>📧</div>
                        Contact Customer
                      </button>

                      {/* Assign Writer */}
                      <button
                        onClick={() => {
                          const writerName = prompt(`Assign order ${selectedOrder.id} to which writer?\n\nEnter writer name or ID:`);
                          if (writerName && writerName.trim()) {
                            // TODO: Update assigned writer in database
                            alert(`Order ${selectedOrder.id} assigned to: ${writerName}\n\nNote: Database update functionality needs to be implemented.`);
                          }
                        }}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: selectedOrder.assigned_writer_id ? '#e0e7ff' : '#f3f4f6',
                          color: selectedOrder.assigned_writer_id ? '#3730a3' : '#374151',
                          border: `1px solid ${selectedOrder.assigned_writer_id ? '#a5b4fc' : '#9ca3af'}`,
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = selectedOrder.assigned_writer_id ? '#c7d2fe' : '#e5e7eb';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = selectedOrder.assigned_writer_id ? '#e0e7ff' : '#f3f4f6';
                        }}
                      >
                        <div style={{ fontSize: '1.2rem' }}>👤</div>
                        {selectedOrder.assigned_writer_id ? 'Reassign Writer' : 'Assign Writer'}
                      </button>

                      {/* Set In Progress */}
                      <button
                        onClick={() => {
                          if (confirm(`Set order ${selectedOrder.id} as IN PROGRESS?\n\nThis will update the order status.`)) {
                            // TODO: Update order status in database
                            alert('Order status updated to IN PROGRESS\n\nNote: Database update functionality needs to be implemented.');
                          }
                        }}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: selectedOrder.status === 'in-progress' ? '#dbeafe' : '#eff6ff',
                          color: selectedOrder.status === 'in-progress' ? '#1e40af' : '#2563eb',
                          border: `1px solid ${selectedOrder.status === 'in-progress' ? '#93c5fd' : '#3b82f6'}`,
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: selectedOrder.status === 'in-progress' ? 'default' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: selectedOrder.status === 'in-progress' ? 0.7 : 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedOrder.status !== 'in-progress') {
                            e.target.style.backgroundColor = '#dbeafe';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedOrder.status !== 'in-progress') {
                            e.target.style.backgroundColor = '#eff6ff';
                          }
                        }}
                        disabled={selectedOrder.status === 'in-progress'}
                      >
                        <div style={{ fontSize: '1.2rem' }}>⏳</div>
                        {selectedOrder.status === 'in-progress' ? 'IN PROGRESS ✓' : 'Start Work'}
                      </button>

                      {/* Copy Order Info */}
                      <button
                        onClick={() => {
                          const orderInfo = `ORDER SUMMARY\n` +
                            `================\n` +
                            `ID: ${selectedOrder.id}\n` +
                            `Topic: ${selectedOrder.topic}\n` +
                            `Subject: ${selectedOrder.subject || 'N/A'}\n` +
                            `Price: $${selectedOrder.price}\n` +
                            `Pages: ${selectedOrder.pages || 'N/A'}\n` +
                            `Status: ${selectedOrder.status || 'pending'}\n` +
                            `Payment: ${selectedOrder.payment_status || 'pending'}\n` +
                            `Customer: ${selectedOrder.customer_email || 'N/A'}\n` +
                            `Created: ${new Date(selectedOrder.created_at).toLocaleDateString()}\n` +
                            `Deadline: ${selectedOrder.deadline ? new Date(selectedOrder.deadline).toLocaleDateString() : 'N/A'}`;
                          
                          navigator.clipboard.writeText(orderInfo).then(() => {
                            alert('Order information copied to clipboard!');
                          }).catch(() => {
                            alert('Copy failed. Please copy manually:\n\n' + orderInfo);
                          });
                        }}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#f9fafb',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#f9fafb';
                        }}
                      >
                        <div style={{ fontSize: '1.2rem' }}>📋</div>
                        Copy Info
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button
                    onClick={closeModal}
                    style={{
                      flex: '1',
                      padding: '0.75rem 1.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      color: '#374151',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  >
                    Close
                  </button>
                  <button
                    style={{
                      flex: '1',
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    onClick={() => {
                      // For now, copy order ID to clipboard
                      navigator.clipboard.writeText(selectedOrder.id).then(() => {
                        alert(`Order ID ${selectedOrder.id} copied to clipboard!\n\nYou can now use this ID to:\n• Search in your database\n• Update order status\n• Contact the customer\n• Assign to a writer`);
                      }).catch(() => {
                        alert(`Order ID: ${selectedOrder.id}\n\nManual copy required. Use this ID for order management.`);
                      });
                    }}
                  >
                    Manage Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealDataAdminPage;