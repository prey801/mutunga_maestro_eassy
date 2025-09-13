import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { PenTool } from 'lucide-react';

const ResetPasswordPage = () => {
  const { resetPasswordForEmail } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPasswordForEmail(email);
    if (!error) {
      setSubmitted(true);
      toast({
        title: "Check your email",
        description: "A password reset link has been sent to your email address.",
      });
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Reset Password - Maestro Essays</title>
      </Helmet>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md shadow-2xl bg-white/80 backdrop-blur-sm border-sky-200">
            <CardHeader className="text-center">
              <div className="flex justify-center items-center space-x-2 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <PenTool className="w-7 h-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
              <CardDescription>
                {submitted ? "Please check your inbox." : "Enter your email to receive a password reset link."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center text-gray-700">
                  <p>If an account with that email exists, we've sent instructions to reset your password. You can close this page now.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link to="/login" className="text-sm font-medium text-sky-600 hover:underline">
                Back to Login
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPasswordPage;