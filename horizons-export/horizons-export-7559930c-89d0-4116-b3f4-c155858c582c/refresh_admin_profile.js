// Script to refresh admin profile data in the browser
// Run this in your browser console while logged in

console.log('🔄 Refreshing admin profile data...');

// Function to refresh profile data
async function refreshAdminProfile() {
    try {
        // Get the current user
        const { data: { user }, error: userError } = await window.supabase.auth.getUser();
        
        if (userError) {
            console.error('❌ Error getting user:', userError);
            return;
        }
        
        if (!user) {
            console.log('❌ No user logged in');
            return;
        }
        
        console.log('👤 Current user:', user.email);
        
        // Fetch the updated profile
        const { data: profile, error: profileError } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
        if (profileError) {
            console.error('❌ Error fetching profile:', profileError);
            return;
        }
        
        console.log('📋 Profile data:', profile);
        console.log('🛡️ Is Admin:', profile.is_admin);
        
        if (profile.is_admin) {
            console.log('✅ Admin access confirmed! You should now see admin navigation.');
            console.log('🔗 Try navigating to /admin');
        } else {
            console.log('❌ Admin access not found. Check your database settings.');
        }
        
        // Force a page refresh to update the UI
        console.log('🔄 Refreshing page to update UI...');
        setTimeout(() => window.location.reload(), 2000);
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

// Execute the refresh
refreshAdminProfile();