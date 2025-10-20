import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { FileText, Paperclip, X, UploadCloud, BookOpen, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { v4 as uuidv4 } from 'uuid';

// Import our enhanced database services
import { 
  orderService, 
  subjectService, 
  paymentService,
  attachmentService,
  createNotification 
} from '@/lib/database';
import type { 
  Subject, 
  CreateOrderRequest, 
  PaperCategory,
  OrderFormData 
} from '@/types/database';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

const EnhancedOrderPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  // Enhanced form state
  const [formData, setFormData] = useState<OrderFormData>({
    paperType: 'essay',
    academicLevel: 'College',
    wordCount: 275,
    urgency: '1 Week',
    description: '',
    subject: '',
    formattingStyle: 'APA',
    sourcesRequired: 0,
    files: []
  });
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [price, setPrice] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Enhanced pricing configuration
  const academicLevelRates = {
    'High School': 0.08,
    'College': 0.10,
    'Undergraduate': 0.12,
    'Masters': 0.15,
    'PhD': 0.18,
  };

  const urgencyMultipliers = {
    '24 Hours': 2.5,
    '2 Days': 2.0,
    '3 Days': 1.8,
    '4 Days': 1.5,
    '5 Days': 1.3,
    '1 Week': 1.0,
    '2 Weeks': 0.95,
    '1 Month': 0.9,
    '1 Month+': 0.85,
  };

  const paperTypeMultipliers = {
    'essay': 1.0,
    'research_paper': 1.2,
    'thesis': 1.8,
    'dissertation': 2.0,
    'case_study': 1.1,
    'lab_report': 1.1,
    'presentation': 0.8,
    'coursework': 1.0,
    'assignment': 0.9,
    'other': 1.0,
  };

  // Load subjects on component mount
  useEffect(() => {
    const loadSubjects = async () => {
      const { data, error } = await subjectService.getAll();
      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading subjects",
          description: error.message,
        });
      } else if (data) {
        setSubjects(data);
      }
    };
    
    loadSubjects();
  }, [toast]);

  const calculatePrice = useCallback(() => {
    const { academicLevel, wordCount, urgency, paperType, sourcesRequired } = formData;
    if (wordCount < 275) return '0.00';
    
    const baseRate = academicLevelRates[academicLevel] || 0;
    const urgencyMultiplier = urgencyMultipliers[urgency] || 1.0;
    const typeMultiplier = paperTypeMultipliers[paperType as PaperCategory] || 1.0;
    const sourcesMultiplier = 1 + (sourcesRequired * 0.05); // 5% per source
    
    const calculatedPrice = baseRate * wordCount * urgencyMultiplier * typeMultiplier * sourcesMultiplier;
    return calculatedPrice.toFixed(2);
  }, [formData, academicLevelRates, urgencyMultipliers, paperTypeMultipliers]);

  useEffect(() => {
    const newPrice = calculatePrice();
    setPrice(parseFloat(newPrice));
    setKey(prevKey => prevKey + 1);
  }, [formData, calculatePrice]);

  useEffect(() => {
    setIsFormValid(
      formData.wordCount >= 275 && 
      price > 0 && 
      formData.subject !== '' &&
      formData.description.trim().length > 10
    );
  }, [formData, price]);

  const handleInputChange = (field: keyof OrderFormData, value: any) => {
    let newFormData = { ...formData, [field]: value };
    
    if (field === "wordCount") {
      newFormData[field] = Math.max(275, parseInt(value, 10) || 275);
    }
    
    setFormData(newFormData);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...Array.from(e.target.files!)]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };
  
  const uploadFiles = async (orderId: string) => {
    const uploadedAttachments = [];
    
    for (const file of formData.files) {
      const filePath = `${user.id}/${orderId}/${uuidv4()}-${file.name}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('order_attachments')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }

      // Create attachment record
      const { data: attachment, error: dbError } = await attachmentService.create({
        order_id: orderId,
        filename: `${uuidv4()}-${file.name}`,
        original_filename: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
        uploaded_by: user.id,
        is_from_client: true,
      });

      if (dbError) {
        throw new Error(`Failed to record attachment ${file.name}: ${dbError.message}`);
      }

      uploadedAttachments.push(attachment);
    }
    
    return uploadedAttachments;
  };

  const createOrder = async (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [{
        description: `Maestro Essays - ${formData.paperType} (${formData.wordCount} words)`,
        amount: {
          currency_code: 'USD',
          value: price.toString(),
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

  const onApprove = async (data: any, actions: any) => {
    try {
      setLoading(true);
      const details = await actions.order.capture();
      
      const orderId = uuidv4();
      
      // Upload files if any
      if (formData.files.length > 0) {
        await uploadFiles(orderId);
      }
      
      const deadlineDate = new Date();
      const urgencyMap = { 
        '24 Hours': 1, '2 Days': 2, '3 Days': 3, '4 Days': 4, 
        '5 Days': 5, '1 Week': 7, '2 Weeks': 14, '1 Month': 30, '1 Month+': 31 
      };
      deadlineDate.setDate(deadlineDate.getDate() + (urgencyMap[formData.urgency] || 7));

      // Create order with enhanced data
      const orderData: CreateOrderRequest = {
        topic: `${formData.paperType.replace('_', ' ')} - Custom Order`,
        work_type: formData.paperType,
        academic_level: formData.academicLevel,
        pages: Math.ceil(formData.wordCount / 275),
        deadline: deadlineDate.toISOString(),
        price: price,
        instructions: formData.description,
        subject_id: formData.subject || null,
        paper_category: formData.paperType as PaperCategory,
        word_count: formData.wordCount,
        formatting_style: formData.formattingStyle,
        sources_required: formData.sourcesRequired,
        is_urgent: ['24 Hours', '2 Days', '3 Days'].includes(formData.urgency),
      };

      const { data: order, error: orderError } = await orderService.create(orderData);
      if (orderError) throw orderError;

      // Create payment transaction record
      await paymentService.create({
        order_id: orderId,
        transaction_id: details.id,
        payment_method: 'paypal',
        amount: price,
        currency: 'USD',
        status: 'completed',
        gateway_response: details,
        processed_at: new Date().toISOString(),
      });

      // Create notification for admin
      await createNotification(
        'admin-user-id', // You'd need to get admin user IDs
        'New Order Received',
        `A new ${formData.paperType} order has been placed by ${user.email}`,
        'payment_received',
        orderId
      );
      
      toast({
        title: "Payment Successful!",
        description: "Your order has been placed successfully. You'll receive a confirmation email shortly.",
      });

      // Reset form and redirect
      setTimeout(() => {
        window.location.href = '/thankyou';
      }, 2000);
      
    } catch (err) {
      toast({ 
        variant: 'destructive', 
        title: 'Error processing order', 
        description: err.message 
      });
      console.error('Order creation error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const onError = (err: any) => {
    toast({ 
      variant: 'destructive', 
      title: 'PayPal Error', 
      description: 'An error occurred with your payment. Please try again.' 
    });
    console.error('PayPal Error:', err);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="paperType" className="text-sm font-medium text-gray-700">
            Paper Type
          </Label>
          <Select value={formData.paperType} onValueChange={(value) => handleInputChange('paperType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select paper type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="essay">Essay</SelectItem>
              <SelectItem value="research_paper">Research Paper</SelectItem>
              <SelectItem value="thesis">Thesis</SelectItem>
              <SelectItem value="dissertation">Dissertation</SelectItem>
              <SelectItem value="case_study">Case Study</SelectItem>
              <SelectItem value="lab_report">Lab Report</SelectItem>
              <SelectItem value="presentation">Presentation</SelectItem>
              <SelectItem value="coursework">Coursework</SelectItem>
              <SelectItem value="assignment">Assignment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
            Subject Area
          </Label>
          <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject area" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="academicLevel" className="text-sm font-medium text-gray-700">
            Academic Level
          </Label>
          <Select value={formData.academicLevel} onValueChange={(value) => handleInputChange('academicLevel', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
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
          <Label htmlFor="urgency" className="text-sm font-medium text-gray-700">
            Deadline
          </Label>
          <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24 Hours">
                <div className="flex items-center space-x-2">
                  <span>24 Hours</span>
                  <Badge variant="destructive" className="text-xs">URGENT</Badge>
                </div>
              </SelectItem>
              <SelectItem value="2 Days">2 Days</SelectItem>
              <SelectItem value="3 Days">3 Days</SelectItem>
              <SelectItem value="4 Days">4 Days</SelectItem>
              <SelectItem value="5 Days">5 Days</SelectItem>
              <SelectItem value="1 Week">1 Week</SelectItem>
              <SelectItem value="2 Weeks">2 Weeks</SelectItem>
              <SelectItem value="1 Month">1 Month</SelectItem>
              <SelectItem value="1 Month+">1 Month+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="wordCount" className="text-sm font-medium text-gray-700">
            Word Count (minimum 275)
          </Label>
          <Input
            id="wordCount"
            type="number"
            min="275"
            value={formData.wordCount}
            onChange={(e) => handleInputChange('wordCount', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="formattingStyle" className="text-sm font-medium text-gray-700">
            Formatting Style
          </Label>
          <Select value={formData.formattingStyle} onValueChange={(value) => handleInputChange('formattingStyle', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="APA">APA</SelectItem>
              <SelectItem value="MLA">MLA</SelectItem>
              <SelectItem value="Chicago">Chicago</SelectItem>
              <SelectItem value="Harvard">Harvard</SelectItem>
              <SelectItem value="IEEE">IEEE</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sourcesRequired" className="text-sm font-medium text-gray-700">
            Sources Required
          </Label>
          <Input
            id="sourcesRequired"
            type="number"
            min="0"
            max="50"
            value={formData.sourcesRequired}
            onChange={(e) => handleInputChange('sourcesRequired', parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
          Detailed Instructions
        </Label>
        <Textarea
          id="description"
          placeholder="Please provide detailed instructions for your paper. Include any specific requirements, formatting guidelines, sources to use, or topics to cover..."
          rows={8}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="mt-1"
        />
        <p className="text-sm text-gray-500 mt-2">
          {formData.description.length}/500 characters minimum recommended
        </p>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-4 block">
          Attach Files (Optional)
        </Label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-sky-400 transition-colors"
        >
          <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Click to upload files or drag and drop</p>
          <p className="text-sm text-gray-400">PDF, DOC, DOCX, TXT files up to 10MB each</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {formData.files.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Attached Files</Label>
          {formData.files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-6 border border-sky-200">
        <h3 className="text-lg font-semibold text-sky-900 mb-4">Order Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Paper Type:</span>
            <span className="font-medium">{formData.paperType.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Academic Level:</span>
            <span className="font-medium">{formData.academicLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Word Count:</span>
            <span className="font-medium">{formData.wordCount} words</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Deadline:</span>
            <span className="font-medium flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formData.urgency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Formatting:</span>
            <span className="font-medium">{formData.formattingStyle}</span>
          </div>
          {formData.sourcesRequired > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Sources:</span>
              <span className="font-medium">{formData.sourcesRequired}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold text-sky-900">
            <span>Total Price:</span>
            <span className="flex items-center">
              <DollarSign className="w-5 h-5" />
              {price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Options</h3>
        <PayPalButtons
          key={key}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          disabled={!isFormValid || loading}
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
          }}
        />
      </div>
    </div>
  );

  return (
    <PayPalScriptProvider options={{ 
      "client-id": PAYPAL_CLIENT_ID, 
      currency: "USD", 
      intent: "capture" 
    }}>
      <div className="min-h-screen py-20 bg-gradient-to-br from-gray-50 to-white">
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
              Get expert help with your academic writing. Fill out the details below for an instant quote.
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className={`flex items-center ${stepNum < 3 ? 'flex-1' : ''}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= stepNum
                        ? 'bg-sky-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {stepNum}
                  </div>
                  <span className={`ml-3 font-medium ${
                    step >= stepNum ? 'text-sky-600' : 'text-gray-500'
                  }`}>
                    {stepNum === 1 && 'Order Details'}
                    {stepNum === 2 && 'Instructions & Files'}
                    {stepNum === 3 && 'Review & Payment'}
                  </span>
                  {stepNum < 3 && (
                    <div className={`flex-1 h-1 mx-4 rounded ${
                      step > stepNum ? 'bg-sky-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={(step / 3) * 100} className="h-2" />
          </div>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-sky-600" />
                <span>
                  {step === 1 && 'Order Configuration'}
                  {step === 2 && 'Instructions & Attachments'}
                  {step === 3 && 'Review & Payment'}
                </span>
              </CardTitle>
              <CardDescription>
                {step === 1 && 'Configure your order details and see the price update in real-time'}
                {step === 2 && 'Provide detailed instructions and attach any relevant files'}
                {step === 3 && 'Review your order and complete the payment'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Current Price</p>
                    <p className="text-2xl font-bold text-sky-600">${price.toFixed(2)}</p>
                  </div>
                  
                  {step < 3 ? (
                    <Button
                      onClick={() => setStep(step + 1)}
                      disabled={
                        (step === 1 && (!formData.subject || !formData.paperType)) ||
                        (step === 2 && formData.description.trim().length < 10)
                      }
                    >
                      Next
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-600">
                      Complete payment above
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            {[
              {
                icon: BookOpen,
                title: "Expert Writers",
                description: "Our writers are experts in their fields with advanced degrees"
              },
              {
                icon: Clock,
                title: "On-Time Delivery",
                description: "We guarantee delivery before your deadline, every time"
              },
              {
                icon: FileText,
                title: "Original Content",
                description: "100% original, plagiarism-free content with quality guarantee"
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <feature.icon className="w-12 h-12 text-sky-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default EnhancedOrderPage;