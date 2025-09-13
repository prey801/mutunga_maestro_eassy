import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.functions.invoke('get-all-users');

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch users",
          description: error.message || "You might not have permission to view this page.",
        });
        console.error("Error fetching users:", error);
      } else {
        setUsers(data.users || []);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [toast]);
  
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <Helmet>
        <title>Admin: All Users - Maestro Essays</title>
      </Helmet>
      <div className="min-h-[calc(100vh-8rem)] p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center space-x-3 mb-8">
            <Users className="w-8 h-8 text-sky-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Registered Users</h1>
          </div>
          
          {loading ? (
            <p className="text-lg font-semibold text-sky-600">Loading users...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card key={user.id} className="shadow-lg bg-white/80 backdrop-blur-sm border-sky-200">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                        <Avatar>
                            <AvatarFallback className="bg-sky-100 text-sky-700">
                                {getInitials(user.full_name)}
                            </AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-lg font-semibold">{user.full_name || 'No Name Provided'}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 break-all">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
           {!loading && users.length === 0 && (
             <p className="text-gray-600 mt-4">No users found. This might be because no users have signed up yet.</p>
           )}
        </motion.div>
      </div>
    </>
  );
};

export default AdminUsersPage;