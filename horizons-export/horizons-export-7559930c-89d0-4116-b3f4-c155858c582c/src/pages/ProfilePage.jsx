import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, User, Calendar } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase();
  };
  
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User';

  return (
    <>
      <Helmet>
        <title>My Profile - Maestro Essays</title>
        <meta name="description" content="View and manage your Maestro Essays profile." />
      </Helmet>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="shadow-2xl bg-white/80 backdrop-blur-sm border-sky-200">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-sky-300">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={displayName} />
                <AvatarFallback className="text-3xl bg-sky-100 text-sky-700">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-3xl font-bold">{displayName}</CardTitle>
              <CardDescription>Welcome to your profile dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-sky-50 rounded-lg">
                <Mail className="w-5 h-5 text-sky-600" />
                <span className="text-gray-700">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-sky-50 rounded-lg">
                <User className="w-5 h-5 text-sky-600" />
                <span className="text-gray-700">{displayName}</span>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-sky-50 rounded-lg">
                <Calendar className="w-5 h-5 text-sky-600" />
                <span className="text-gray-700">
                  Joined on: {user ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default ProfilePage;