import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import PayPalButtonComponent from './Paypal-payment.jsx';



const PaymentPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orderId, setOrderId] = useState(null);
  const [orderPrice, setOrderPrice] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get order details from session storage
    const storedOrderId = sessionStorage.getItem('pendingOrderId');
    const storedPrice = sessionStorage.getItem('orderPrice');
    const storedDetails = sessionStorage.getItem('orderDetails');
    
    if (!storedOrderId || !storedPrice) {
      toast({
        variant: 'destructive',
        title: 'No Order Found',
        description: 'Please create an order first'
      });
      navigate('/order');
      return;
    }
    
    setOrderId(storedOrderId);
    setOrderPrice(storedPrice);
    if (storedDetails) {
      try {
        setOrderDetails(JSON.parse(storedDetails));
      } catch (e) {
        console.error('Error parsing order details:', e);
      }
    }
    setIsLoading(false);
  }, [navigate, toast]);


  const handleBackToOrder = () => {
    navigate('/order');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Payment Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/order')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">
            Order #{orderId?.slice(0, 8)}...
          </p>
        </div>

        {/* Payment Card */}
        <Card className="shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Complete your payment using PayPal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Summary */}
            {orderDetails && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Order Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paper Type:</span>
                    <span className="font-medium">{orderDetails.paperType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Academic Level:</span>
                    <span className="font-medium">{orderDetails.academicLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Word Count:</span>
                    <span className="font-medium">{orderDetails.wordCount} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadline:</span>
                    <span className="font-medium">{orderDetails.urgency}</span>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">${orderPrice}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Security Badge */}
            <Alert className="bg-green-50 border-green-200">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Secure Payment</strong>
                <p className="text-sm mt-1">
                  Your payment information is encrypted and secure. We never store your payment details.
                </p>
              </AlertDescription>
            </Alert>

            {/* Simple PayPal Button Component */}
            <div className="pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Pay with PayPal</h4>
              <PayPalButtonComponent />
            </div>

            {/* Support Info */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <p>Having trouble? Contact support at</p>
              <a href="mailto:support@maestroessays.com" className="text-blue-600 hover:underline">
                support@maestroessays.com
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">Accepted Payment Methods</p>
          <div className="flex justify-center space-x-4">
            <Badge variant="secondary">PayPal</Badge>
            <Badge variant="secondary">Visa</Badge>
            <Badge variant="secondary">Mastercard</Badge>
            <Badge variant="secondary">American Express</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;