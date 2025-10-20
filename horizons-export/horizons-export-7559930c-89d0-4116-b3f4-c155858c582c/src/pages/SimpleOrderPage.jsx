import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  FileText, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  DollarSign,
  BookOpen,
  Info,
  Paperclip,
  X,
  UploadCloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';

const SimpleOrderPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    paperType: '',
    academicLevel: '',
    wordCount: 275,
    urgency: '',
    subject: '',
    topic: '',
    description: '',
  });
  
  const [files, setFiles] = useState([]);
  const [price, setPrice] = useState(0);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Pricing configuration
  const academicLevelRates = {
    'High School': 8,
    'College': 10,
    'Undergraduate': 12,
    'Masters': 15,
    'PhD': 18,
  };

  const urgencyMultipliers = {
    '24 Hours': 2.0,
    '48 Hours': 1.7,
    '3 Days': 1.5,
    '5 Days': 1.3,
    '7 Days': 1.2,
    '14 Days': 1.0,
    '21 Days': 0.9,
    '30+ Days': 0.85,
  };

  const paperTypes = [
    'Essay',
    'Research Paper',
    'Term Paper',
    'Thesis',
    'Dissertation',
    'Case Study',
    'Literature Review',
    'Article Review',
    'Book Report',
    'Presentation',
    'Other'
  ];

  const subjects = [
    'English',
    'Literature',
    'History',
    'Psychology',
    'Sociology',
    'Business',
    'Management',
    'Marketing',
    'Nursing',
    'Medicine',
    'Computer Science',
    'Mathematics',
    'Biology',
    'Chemistry',
    'Physics',
    'Philosophy',
    'Political Science',
    'Economics',
    'Law',
    'Other'
  ];

  // Calculate price based on form data
  const calculatePrice = useCallback(() => {
    const { academicLevel, wordCount, urgency } = formData;
    if (!academicLevel || !urgency || wordCount < 275) return 0;
    
    const baseRate = academicLevelRates[academicLevel] || 10;
    const urgencyMultiplier = urgencyMultipliers[urgency] || 1.0;
    const pages = Math.ceil(wordCount / 275);
    
    return (baseRate * pages * urgencyMultiplier).toFixed(2);
  }, [formData]);

  useEffect(() => {
    setPrice(calculatePrice());
  }, [formData, calculatePrice]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.paperType) newErrors.paperType = 'Paper type is required';
    if (!formData.academicLevel) newErrors.academicLevel = 'Academic level is required';
    if (!formData.urgency) newErrors.urgency = 'Urgency is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.topic.trim()) newErrors.topic = 'Topic is required';
    if (!formData.description.trim() || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    if (formData.wordCount < 275) newErrors.wordCount = 'Minimum word count is 275';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (step === 1 && validateForm()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };

  // Handle file changes
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  // Remove file
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Create order and navigate to payment
  const handleCreateOrder = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to place an order'
      });
      navigate('/login');
      return;
    }

    setIsLoading(true);

    try {
      const orderId = uuidv4();
      
      // Calculate deadline
      const deadlineDate = new Date();
      const urgencyMap = {
        '24 Hours': 1,
        '48 Hours': 2,
        '3 Days': 3,
        '5 Days': 5,
        '7 Days': 7,
        '14 Days': 14,
        '21 Days': 21,
        '30+ Days': 30
      };
      const daysToAdd = urgencyMap[formData.urgency] || 7;
      deadlineDate.setDate(deadlineDate.getDate() + daysToAdd);

      // Map paper type to category
      const paperCategoryMap = {
        'Essay': 'essay',
        'Research Paper': 'research_paper',
        'Term Paper': 'research_paper',
        'Thesis': 'thesis',
        'Dissertation': 'dissertation',
        'Case Study': 'case_study',
        'Literature Review': 'other',
        'Article Review': 'other',
        'Book Report': 'other',
        'Presentation': 'presentation',
        'Other': 'other'
      };

      // Create order object - removed academic_level as it doesn't exist in database
      const orderData = {
        id: orderId,
        user_id: user.id,
        title: `${formData.paperType}: ${formData.topic}`,
        description: formData.description,
        paper_category: paperCategoryMap[formData.paperType] || 'other',
        subject: formData.subject,
        word_count: formData.wordCount,
        pages: Math.ceil(formData.wordCount / 275),
        deadline: deadlineDate.toISOString(),
        urgency_hours: daysToAdd * 24,
        is_urgent: daysToAdd <= 2,
        price: parseFloat(price),
        status: 'pending'  // Changed from 'draft' to match enum values
      };

      // Save order to database
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('Order creation error:', error);
        throw error;
      }

      toast({
        title: 'Order Created!',
        description: 'Redirecting to payment...',
      });

      // Upload files if any
      if (files.length > 0) {
        try {
          for (const file of files) {
            const fileName = `${orderId}/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
              .from('order_attachments')
              .upload(fileName, file);
            
            if (uploadError) {
              console.error('File upload error:', uploadError);
              // Don't fail the order creation if file upload fails
            }
          }
        } catch (uploadErr) {
          console.error('Error uploading files:', uploadErr);
        }
      }

      // Store order ID in session storage for payment page
      sessionStorage.setItem('pendingOrderId', orderId);
      sessionStorage.setItem('orderPrice', price);
      sessionStorage.setItem('orderDetails', JSON.stringify(formData));

      // Navigate to payment page
      setTimeout(() => {
        navigate('/payment');
      }, 1500);

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create order. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                  step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}>
                  {step > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
                </div>
                <span className="ml-2 font-medium">Order Details</span>
              </div>
              
              <div className="w-20 h-0.5 bg-gray-300">
                <div className={`h-full bg-blue-600 transition-all duration-300 ${
                  step >= 2 ? 'w-full' : 'w-0'
                }`} />
              </div>
              
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                  step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}>
                  2
                </div>
                <span className="ml-2 font-medium">Review & Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Order Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Create Your Order</CardTitle>
                <CardDescription>
                  Fill in the details below and we'll calculate your price instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Paper Type and Academic Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paperType">
                      Paper Type <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.paperType} 
                      onValueChange={(value) => handleInputChange('paperType', value)}
                    >
                      <SelectTrigger className={errors.paperType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select paper type" />
                      </SelectTrigger>
                      <SelectContent>
                        {paperTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.paperType && (
                      <p className="text-sm text-red-500 mt-1">{errors.paperType}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="academicLevel">
                      Academic Level <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.academicLevel} 
                      onValueChange={(value) => handleInputChange('academicLevel', value)}
                    >
                      <SelectTrigger className={errors.academicLevel ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select academic level" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(academicLevelRates).map(level => (
                          <SelectItem key={level} value={level}>
                            {level} (${academicLevelRates[level]}/page)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.academicLevel && (
                      <p className="text-sm text-red-500 mt-1">{errors.academicLevel}</p>
                    )}
                  </div>
                </div>

                {/* Subject and Word Count */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.subject} 
                      onValueChange={(value) => handleInputChange('subject', value)}
                    >
                      <SelectTrigger className={errors.subject ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subject && (
                      <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="wordCount">
                      Word Count <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="wordCount" 
                        type="number" 
                        min="275" 
                        step="25"
                        value={formData.wordCount} 
                        onChange={(e) => handleInputChange('wordCount', parseInt(e.target.value) || 275)}
                        className={errors.wordCount ? 'border-red-500' : ''}
                      />
                      <Badge variant="secondary">
                        ≈ {Math.ceil(formData.wordCount / 275)} pages
                      </Badge>
                    </div>
                    {errors.wordCount && (
                      <p className="text-sm text-red-500 mt-1">{errors.wordCount}</p>
                    )}
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <Label htmlFor="urgency">
                    Urgency <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.urgency} 
                    onValueChange={(value) => handleInputChange('urgency', value)}
                  >
                    <SelectTrigger className={errors.urgency ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select deadline" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(urgencyMultipliers).map(urgency => (
                        <SelectItem key={urgency} value={urgency}>
                          {urgency} 
                          {urgencyMultipliers[urgency] > 1 && (
                            <span className="text-orange-600 ml-2">
                              (+{Math.round((urgencyMultipliers[urgency] - 1) * 100)}% rush fee)
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.urgency && (
                    <p className="text-sm text-red-500 mt-1">{errors.urgency}</p>
                  )}
                </div>

                {/* Topic */}
                <div>
                  <Label htmlFor="topic">
                    Topic/Title <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="topic"
                    placeholder="Enter your paper topic or title"
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    className={errors.topic ? 'border-red-500' : ''}
                  />
                  {errors.topic && (
                    <p className="text-sm text-red-500 mt-1">{errors.topic}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">
                    Instructions <span className="text-red-500">*</span>
                  </Label>
                  <Textarea 
                    id="description"
                    placeholder="Provide detailed instructions for your order (minimum 20 characters)..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={5}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <Label>Attachments (Optional)</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <div className="space-y-1 text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          Upload files
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, or images up to 10MB each
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      multiple
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                    />
                  </div>
                  
                  {/* Display uploaded files */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700 truncate max-w-xs">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Display */}
                {price > 0 && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-lg">
                      <span className="font-semibold text-blue-900">Estimated Price: </span>
                      <span className="text-2xl font-bold text-blue-600">${price}</span>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Next Button */}
                <Button 
                  onClick={handleNextStep}
                  size="lg"
                  className="w-full"
                >
                  Continue to Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Review & Payment */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Review Your Order</CardTitle>
                <CardDescription>
                  Please review your order details before proceeding to payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Paper Type</p>
                      <p className="font-medium">{formData.paperType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Academic Level</p>
                      <p className="font-medium">{formData.academicLevel}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Subject</p>
                      <p className="font-medium">{formData.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Word Count</p>
                      <p className="font-medium">{formData.wordCount} words ({Math.ceil(formData.wordCount / 275)} pages)</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deadline</p>
                      <p className="font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formData.urgency}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Price</p>
                      <p className="text-2xl font-bold text-blue-600">${price}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">Topic</p>
                    <p className="font-medium">{formData.topic}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Instructions</p>
                    <p className="text-sm bg-white p-3 rounded border">{formData.description}</p>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Attached Files</p>
                      <div className="space-y-1">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Paperclip className="h-3 w-3 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Alert */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    After clicking "Proceed to Payment", you'll be redirected to our secure payment page 
                    to complete your order.
                  </AlertDescription>
                </Alert>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button 
                    variant="outline"
                    onClick={handlePreviousStep}
                    className="flex-1"
                  >
                    Back to Edit
                  </Button>
                  <Button 
                    onClick={handleCreateOrder}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        Proceed to Payment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SimpleOrderPage;