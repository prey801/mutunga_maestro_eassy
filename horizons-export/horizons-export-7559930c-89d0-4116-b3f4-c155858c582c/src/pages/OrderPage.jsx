import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { FileText, Paperclip, X, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "ASTKsEuvNVk9vlLXqUUMvTEB_mKYeYPk5YFZKwBI2f4h3oZf2orffsuqYd1udJKL4eweIVjikWB7tzlx";

const OrderPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
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
    setPrice(newPrice);
    setKey(prevKey => prevKey + 1); // Force re-render of PayPal button when price changes
  }, [formData, calculatePrice]);

  useEffect(() => {
    setIsFormValid(formData.wordCount >= 275 && parseFloat(price) > 0);
  }, [formData.wordCount, price]);

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
    return actions.order.create({
      purchase_units: [{
        description: `Maestro Essays - ${formData.paperType}`,
        amount: {
          currency_code: 'USD',
          value: price,
        },
        payee: {
          email_address: "support@maestroessays.com"
        }
      }],
      application_context: {
        brand_name: 'Maestro Essays',
        return_url: 'https://maestroessays.com/thankyou',
        cancel_url: 'https://maestroessays.com/order',
      }
    });
  };

  const onApprove = async (data, actions) => {
    try {
      const paymentResult = await actions.order.capture();
      const orderId = uuidv4();
      
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
      const { error: dbError } = await supabase.from('orders').insert([{
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
      }]);
      
      if (dbError) throw dbError;
      
      // Upload files after order creation
      if (files.length > 0) {
        await uploadFiles(orderId);
      }
      
      // Create payment transaction record
      const { error: paymentError } = await supabase.from('payment_transactions').insert([{
        order_id: orderId,
        transaction_id: paymentResult.id,
        payment_method: 'paypal',
        amount: parseFloat(price),
        currency: 'USD',
        status: 'completed',
        gateway_response: paymentResult,
        processed_at: new Date().toISOString()
      }]);

      if (dbError) throw dbError;
      
      if (paymentError) {
        console.warn('Payment transaction record failed:', paymentError);
        // Don't throw error here as the order was created successfully
      }
      
      toast({
        title: "Payment Successful!",
        description: "Your order has been placed successfully. You will receive a confirmation email shortly.",
      });
      
      // Optional: Redirect to order confirmation or dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
      
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error processing order', description: err.message });
      console.error('Capture or DB/Upload error:', err);
    }
  };
  
  const onError = (err) => {
    toast({ variant: 'destructive', title: 'PayPal Error', description: 'An error occurred with your payment.' });
    console.error('PayPal Error:', err);
  };

  return (
    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
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
                  <PayPalButtons
                    key={key}
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
                  />
                ) : (
                  <Button disabled className="w-full" size="lg">Word count must be 275 or more</Button>
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