import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { PenTool } from 'lucide-react';

const UpdatePasswordPage = () => {
  const { updatePassword, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This page should only be accessed after a password reset email link is clicked,
    // which results in a session with the 'PASSWORD_RECOVERY' event.
    if (!session) {
      navigate('/login');
      toast({
        variant: 'destructive',
        title: 'Invalid Access',
        description: 'Please use the password reset link from your email.',
      });
    }
  }, [session, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await updatePassword(password);
    if (!error) {
      toast({
        title: "Password Updated!",
        description: "You can now log in with your new password.",
      });
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Update Password - Maestro Essays</title>
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
              <CardTitle className="text-3xl font-bold">Set New Password</CardTitle>
              <CardDescription>
                Enter your new password below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default UpdatePasswordPage;