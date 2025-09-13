# 🔧 Fix Supabase Authentication Configuration

## The Problem
Your Supabase project is configured to redirect to `http://localhost:3000` but your Vite development server runs on `http://localhost:5173`.

## ✅ Solution Steps

### 1. Update Supabase Auth Settings
1. Go to your Supabase Dashboard: https://app.supabase.com/project/pcexiuwtmhqdpyhaxfwm
2. Navigate to **Authentication** → **URL Configuration**
3. Update the following URLs:

**Site URL:**
```
http://localhost:5173
```

**Redirect URLs:** (Add all these)
```
http://localhost:5173
http://localhost:5173/**
http://localhost:5173/auth/callback
https://maestroessays.com
https://maestroessays.com/**
https://maestroessays.com/auth/callback
```

### 2. Update Additional Redirect URLs
In the **Additional Redirect URLs** section, add:
```
http://localhost:5173/auth/confirm
http://localhost:5173/auth/reset-password
http://localhost:5173/dashboard
https://maestroessays.com/auth/confirm
https://maestroessays.com/auth/reset-password
https://maestroessays.com/dashboard
```

### 3. Email Templates (Optional but Recommended)
Go to **Authentication** → **Email Templates** and update the redirect URLs in your email templates from:
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```
to:
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```
(Should already be correct, but verify the SiteURL is being used)

### 4. Test the Fix
1. Clear your browser cache and cookies for localhost
2. Try signing up/signing in again
3. Check your email for the verification link
4. The link should now redirect to `http://localhost:5173`

## 🚨 Important Notes

- **Email links expire quickly** - Usually within 1 hour
- **Request a new verification email** after updating the settings
- **Clear browser cache** to avoid cached redirect issues
- **Production URLs** - Make sure to add your production domain when you deploy

## 🔄 Request New Verification Email

If you still have the expired link, you'll need to:
1. Go to your app's sign-in page
2. Click "Resend verification email" or sign up again
3. Check your email for the new verification link

## 📱 Quick Test Command

You can test your current dev server with:
```powershell
# Open your development server
Start-Process "http://localhost:5173"
```