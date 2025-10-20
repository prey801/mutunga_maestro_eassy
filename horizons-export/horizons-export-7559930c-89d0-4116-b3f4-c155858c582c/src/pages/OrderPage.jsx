import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { FileText, Paperclip, X, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

console.log('PayPal Client ID configured:', PAYPAL_CLIENT_ID ? 'Yes' : 'No');
console.log('PayPal Client ID (first 10 chars):', PAYPAL_CLIENT_ID?.substring(0, 10) + '...');
if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID.length < 20) {
  console.error('Invalid PayPal Client ID - Check .env.local file');
  console.error('Expected: VITE_PAYPAL_CLIENT_ID=your_paypal_client_id');
}

// PayPal Button Wrapper Component
const PayPalButtonWrapper = ({ price, createOrder, onApprove, onError, onCancel }) => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  
  useEffect(() => {
    console.log('PayPal Script Status:', { isPending, isRejected });
  }, [isPending, isRejected]);
  
  if (isPending) {
    return (
      <div className="w-full p-4 text-center">
        <p className="text-gray-600">Loading PayPal...</p>
      </div>
    );
  }
  
  if (isRejected) {
    return (
      <div className="w-full p-4 border border-red-200 rounded-lg bg-red-50">
        <h3 className="text-lg font-semibold text-red-800 mb-2">PayPal Unavailable</h3>
        <p className="text-red-600 mb-4">PayPal is currently unavailable. Please contact us directly to complete your order.</p>
        <div className="text-sm text-red-700">
          <p><strong>Email:</strong> support@maestroessays.com</p>
          <p><strong>Reference:</strong> Order total ${price}</p>
          <p className="mt-2 text-xs">Include your order details when contacting us.</p>
        </div>
      </div>
    );
  }
  
  return (
    <PayPalButtons
      style={{ 
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'pay',
        height: 48,
        tagline: false,
      }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
      onCancel={onCancel}
      forceReRender={[price]}
    />
  );
};

const OrderPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  // Debug user authentication
  useEffect(() => {
    console.log('OrderPage - Current user:', user);
    if (!user) {
      console.warn('No user found, order placement will fail');
    }
  }, [user]);
  const [formData, setFormData] = useState({
    paperType: 'Essay',
    academicLevel: 'College',
    wordCount: 275,
    urgency: '1 Week',
    description: '',
  });
  const [files, setFiles] = useState([]);
  const [price, setPrice] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [key, setKey] = useState(0);

  const academicLevelRates = {
    'High School': 0.08,
    'College': 0.10,
    'Undergraduate': 0.12,
    'Masters': 0.15,
    'PhD': 0.18,
  };

  const urgencyMultipliers = {
    '24 Hours': 2.0,
    '2 Days': 1.5,
    '3 Days': 1.5,
    '4 Days': 1.2,
    '5 Days': 1.2,
    '1 Week': 1.0,
    '2 Weeks': 1.0,
    '1 Month': 1.0,
    '1 Month+': 1.0,
  };

  const calculatePrice = useCallback(() => {
    const { academicLevel, wordCount, urgency } = formData;
    if (wordCount < 275) return '0.00';
    const rate = academicLevelRates[academicLevel] || 0;
    const multiplier = urgencyMultipliers[urgency] || 1.0;
    const calculatedPrice = rate * wordCount * multiplier;
    return calculatedPrice.toFixed(2);
  }, [formData, academicLevelRates, urgencyMultipliers]);

  useEffect(() => {
    const newPrice = calculatePrice();
    console.log('Price calculated:', newPrice, 'for form data:', formData);
    setPrice(newPrice);
    setKey(prevKey => prevKey + 1); // Force re-render of PayPal button when price changes
  }, [formData, calculatePrice]);

  useEffect(() => {
    const isValid = (
      formData.wordCount >= 275 && 
      parseFloat(price) > 0 && 
      user && 
      formData.description.trim().length > 0
    );
    console.log('Form validation:', {
      wordCount: formData.wordCount,
      price: price,
      user: !!user,
      description: formData.description.trim().length,
      isValid: isValid
    });
    setIsFormValid(isValid);
  }, [formData.wordCount, formData.description, price, user]);

  const handleInputChange = (field, value) => {
    let newFormData = { ...formData, [field]: value };
    if (field === "wordCount") {
      newFormData[field] = Math.max(275, parseInt(value, 10) || 275);
    }
    setFormData(newFormData);
  };
  
  const handleFileChange = (e) => {
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const uploadFiles = async (orderId) => {
    const uploadedAttachments = [];
    for (const file of files) {
      const fileName = `${uuidv4()}-${file.name}`;
      const filePath = `${user.id}/${orderId}/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('order_attachments')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }
      
      // Save attachment record to database
      const { error: dbError } = await supabase
        .from('order_attachments')
        .insert({
          order_id: orderId,
          filename: fileName,
          original_filename: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type || 'application/octet-stream',
          uploaded_by: user.id,
          is_from_client: true
        });
        
      if (dbError) {
        throw new Error(`Failed to save attachment record: ${dbError.message}`);
      }
      
      uploadedAttachments.push({
        filename: fileName,
        original_filename: file.name,
        file_path: filePath
      });
    }
    return uploadedAttachments;
  };

  const createOrder = async (data, actions) => {
    console.log('Creating PayPal order with data:', { formData, price, user });
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    if (!price || parseFloat(price) <= 0) {
      throw new Error('Invalid price amount');
    }
    
    try {
      const priceValue = parseFloat(price).toFixed(2);
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: `maestro_${Date.now()}`,
          description: `Maestro Essays - ${formData.paperType} (${formData.wordCount} words)`,
          amount: {
            currency_code: 'USD',
            value: priceValue,
          },
          payee: {
            email_address: "support@maestroessays.com"
          }
        }],
        application_context: {
          brand_name: 'Maestro Essays',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: window.location.origin + '/profile',
          cancel_url: window.location.origin + '/order',
        }
      };
      console.log('PayPal order data:', orderData);
      return actions.order.create(orderData);
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: 'Unable to create payment order. Please try again.'
      });
      throw error;
    }
  };

  const onApprove = async (data, actions) => {
    console.log('PayPal payment approved, starting order processing...');
    try {
      console.log('Capturing PayPal payment...');
      const paymentResult = await actions.order.capture();
      console.log('PayPal payment captured successfully:', paymentResult);
      
      const orderId = uuidv4();
      console.log('Generated order ID:', orderId);
      
      // Calculate deadline
      const deadlineDate = new Date();
      const urgencyMap = { 
        '24 Hours': 1, '2 Days': 2, '3 Days': 3, '4 Days': 4, 
        '5 Days': 5, '1 Week': 7, '2 Weeks': 14, '1 Month': 30, '1 Month+': 31 
      };
      const urgencyDays = urgencyMap[formData.urgency] || 7;
      deadlineDate.setDate(deadlineDate.getDate() + urgencyDays);
      
      // Map paper type to paper_category enum
      const paperCategoryMap = {
        'Essay': 'essay',
        'Term Paper': 'research_paper',
        'Dissertation': 'dissertation',
        'Other': 'other'
      };
      
      // Create order with new schema
      const orderRecord = {
        id: orderId,
        user_id: user.id,
        title: `${formData.paperType} - ${formData.academicLevel} Level`,
        description: formData.description || `Custom ${formData.paperType} for ${formData.academicLevel} level. Word count: ${formData.wordCount} words.`,
        paper_category: paperCategoryMap[formData.paperType] || 'essay',
        word_count: formData.wordCount,
        pages: Math.ceil(formData.wordCount / 275),
        deadline: deadlineDate.toISOString(),
        urgency_hours: urgencyDays * 24,
        is_urgent: urgencyDays <= 2,
        price: parseFloat(price),
        status: 'pending'
      };
      
      console.log('Creating database order record:', orderRecord);
      const { error: dbError } = await supabase.from('orders').insert([orderRecord]);
      
      if (dbError) {
        console.error('Database order insertion error:', dbError);
        throw dbError;
      }
      console.log('Order record created successfully');
      
      // Upload files after order creation
      if (files.length > 0) {
        console.log('Uploading files:', files.length);
        await uploadFiles(orderId);
        console.log('Files uploaded successfully');
      }
      
      // Create payment transaction record
      console.log('Creating payment transaction record...');
      const paymentTransactionData = {
        order_id: orderId,
        transaction_id: paymentResult.id,
        payment_method: 'paypal',
        amount: parseFloat(price),
        currency: 'USD',
        status: 'completed',
        gateway_response: paymentResult,
        processed_at: new Date().toISOString()
      };
      
      console.log('Payment transaction data:', paymentTransactionData);
      const { error: paymentError } = await supabase.from('payment_transactions').insert([paymentTransactionData]);
      
      if (paymentError) {
        console.warn('Payment transaction record failed:', paymentError);
        // Don't throw error here as the order was created successfully
      } else {
        console.log('Payment transaction record created successfully');
      }
      
      toast({
        title: "Payment Successful!",
        description: "Your order has been placed successfully. You will receive a confirmation email shortly.",
      });
      
      // Redirect to profile page after successful order
      setTimeout(() => {
        window.location.href = '/profile';
      }, 3000);
      
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error processing order', description: err.message });
      console.error('Capture or DB/Upload error:', err);
    }
  };
  
  const onError = (err) => {
    console.error('PayPal Error:', err);
    
    let errorMessage = 'An error occurred with your payment.';
    
    if (err && err.message) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    } else if (err && err.details && err.details.length > 0) {
      errorMessage = err.details[0].description || errorMessage;
    }
    
    toast({ 
      variant: 'destructive', 
      title: 'PayPal Error', 
      description: errorMessage
    });
  };

  // Show error if PayPal is not configured
  if (!PAYPAL_CLIENT_ID) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="p-8 border border-red-200 rounded-lg bg-red-50">
              <h3 className="text-lg font-semibold text-red-800 mb-4">PayPal Configuration Error</h3>
              <p className="text-red-600 mb-4">PayPal Client ID is not configured. Please contact support to complete your order.</p>
              <div className="text-sm text-red-700">
                <p><strong>Email:</strong> support@maestroessays.com</p>
                <p className="mt-2 text-xs">Technical Error: VITE_PAYPAL_CLIENT_ID missing from environment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider 
      options={{ 
        "client-id": PAYPAL_CLIENT_ID, 
        currency: "USD", 
        intent: "capture",
        "data-sdk-integration-source": "button-factory",
        "disable-funding": "paylater,credit",
        "debug": true,
        "locale": "en_US"
      }}
      onError={(error) => {
        console.error('PayPal Script Provider Error:', error);
      }}
    >
      <div className="min-h-screen py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Place Your <span className="text-gradient">Order</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fill out the form below to calculate your price and proceed with your custom academic paper.
            </p>
          </motion.div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-sky-600" />
                <span>Order Details</span>
              </CardTitle>
              <CardDescription>Adjust the details to see the price update instantly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="paperType">Paper Type</Label>
                  <Select value={formData.paperType} onValueChange={(value) => handleInputChange('paperType', value)}>
                    <SelectTrigger id="paperType"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Essay">Essay</SelectItem>
                      <SelectItem value="Term Paper">Term Paper</SelectItem>
                      <SelectItem value="Dissertation">Dissertation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="academicLevel">Academic Level</Label>
                  <Select value={formData.academicLevel} onValueChange={(value) => handleInputChange('academicLevel', value)}>
                    <SelectTrigger id="academicLevel"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="College">College</SelectItem>
                      <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="Masters">Masters</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="wordCount">Word Count (min. 275)</Label>
                  <Input id="wordCount" type="number" min="275" step="10" value={formData.wordCount} onChange={(e) => handleInputChange('wordCount', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                   <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                    <SelectTrigger id="urgency"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.keys(urgencyMultipliers).map(urg => <SelectItem key={urg} value={urg}>{urg}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Provide detailed instructions for your order..." value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={5} />
              </div>

              <div>
                <Label>Attachments</Label>
                <div onClick={() => fileInputRef.current.click()} className="mt-2 flex justify-center w-full px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-sky-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-sky-600 hover:text-sky-500">Upload files</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Any document or image files</p>
                  </div>
                  <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                </div>
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-center bg-sky-50/50 p-6 rounded-lg border border-sky-100">
                <p className="text-lg text-gray-600 mb-1">Estimated Price:</p>
                <p className="text-4xl font-bold text-gradient">${price}</p>
              </div>
              
              <div className="pt-4">
                {isFormValid ? (
                  <PayPalButtonWrapper
                    key={key}
                    price={price}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                    onCancel={(data) => {
                      console.log('PayPal payment cancelled:', data);
                      toast({ title: 'Payment Cancelled', description: 'You cancelled the payment process.' });
                    }}
                  />
                ) : (
                  <Button disabled className="w-full" size="lg">
                    {!user 
                      ? 'Please log in to place an order'
                      : formData.wordCount < 275 
                      ? 'Minimum 275 words required'
                      : formData.description.trim().length === 0
                      ? 'Please add order description'
                      : parseFloat(price) <= 0
                      ? 'Invalid price calculated'
                      : 'Complete all required fields'
                    }
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default OrderPage;