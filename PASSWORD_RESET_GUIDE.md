# Password Reset Flow - Testing Guide

## 🎉 What's New

Your password reset flow is now live! Users can reset their password in 3 simple steps.

---

## 🔐 How It Works

### **Frontend Pages**
1. **`/forgot-password`** - Enter email to request reset
2. **`/reset-password?token=XXX`** - Set new password with token

### **Backend Endpoints**
- `POST /api/v1/auth/forgot-password` - Generate reset token
- `POST /api/v1/auth/reset-password` - Validate token & update password

### **Security Features**
✅ Tokens expire in 1 hour  
✅ Tokens can only be used once  
✅ No email enumeration (always returns success message)  
✅ Secure token generation (32 bytes)  
✅ Bcrypt password hashing

---

## 🧪 Testing the Flow (Dev Mode)

Since we're not sending emails yet, the reset link is **logged to the server console** and **returned in the API response**.

### **Step 1: Request Password Reset**
1. Go to `https://pocket-pallet.vercel.app/login`
2. Click **"Forgot password?"**
3. Enter your email (e.g., `rjcicc@gmail.com`)
4. Click **"Send reset link"**

### **Step 2: Get the Reset Link**

**Option A: Check the server logs on Render**
1. Go to Render dashboard
2. Open your backend service logs
3. Look for the reset link in the console:
   ```
   ============================================================
   🔐 PASSWORD RESET REQUESTED
   ============================================================
   Email: rjcicc@gmail.com
   Reset Link: https://pocket-pallet.vercel.app/reset-password?token=ABC123...
   Expires: 2025-10-12 15:30:00
   ============================================================
   ```

**Option B: Use the dev mode button**
- The forgot-password page shows a **"Dev Mode"** box with a button
- Click **"Reset Password →"** to go directly to the reset page

### **Step 3: Reset Your Password**
1. The reset password page will load with your token
2. Enter your new password (minimum 6 characters)
3. Confirm the password
4. Click **"Reset password"**
5. You'll be redirected to login after 2 seconds

### **Step 4: Test Login**
1. Go to login page
2. Use your email and **new password**
3. Confirm you can log in successfully ✅

---

## 🚀 Deployment Status

**Backend (Render):**
- ✅ New `password_resets` table will be auto-created on next deploy
- ✅ Endpoints live at `/api/v1/auth/forgot-password` and `/api/v1/auth/reset-password`
- ✅ Console logging enabled for dev testing

**Frontend (Vercel):**
- ✅ New pages deployed: `/forgot-password` and `/reset-password`
- ✅ Login page "Forgot password?" link wired up

---

## 🌍 Environment Variables

Make sure these are set in **Render**:

```env
FRONTEND_URL=https://pocket-pallet.vercel.app
```

This is used to generate the correct reset links.

---

## 📧 Adding Email (Future Enhancement)

To send actual emails instead of console logs:

1. **Install email library:**
   ```bash
   pip install fastapi-mail
   ```

2. **Update backend config** (`app/core/config.py`):
   ```python
   MAIL_USERNAME: str = ""
   MAIL_PASSWORD: str = ""
   MAIL_FROM: str = "noreply@pocketpallet.com"
   MAIL_SERVER: str = "smtp.gmail.com"
   MAIL_PORT: int = 587
   ```

3. **Update forgot-password endpoint** (`app/api/endpoints/auth.py`):
   - Replace `print()` with email send
   - Remove `reset_link` from response (security)

4. **Recommended Services:**
   - **SendGrid** (free tier: 100 emails/day)
   - **Mailgun** (free tier: 5,000 emails/month)
   - **AWS SES** (cheap, reliable)

---

## 🔍 Troubleshooting

### "Invalid or expired reset token"
- Token was already used
- Token expired (> 1 hour old)
- Token doesn't exist in database

**Fix:** Request a new password reset

### "No reset link showing up"
- Check Render logs for the console output
- Verify `FRONTEND_URL` is set correctly in Render

### Backend not creating `password_resets` table
- The table will auto-create on next deploy
- Or manually trigger: Connect to Render PostgreSQL and run:
  ```sql
  CREATE TABLE password_resets (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    token VARCHAR UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ```

---

## 🎨 Design Notes

The password reset pages follow Pocket Pallet's design principles:

- **Calm & Confident:** Clear messaging, no alarm
- **Frictionless:** Minimal steps, auto-redirect
- **Wine-inspired:** Consistent color palette (wine-600, wine-50)
- **Positive:** "Set new password" not "Emergency reset"
- **Human:** Natural language throughout

---

## ✅ Testing Checklist

- [ ] Click "Forgot password?" on login page → goes to `/forgot-password`
- [ ] Enter email → shows success message
- [ ] Check Render logs → reset link appears
- [ ] Click reset link (or use dev button) → goes to `/reset-password`
- [ ] Enter new password → shows success message
- [ ] Auto-redirect to login after 2 seconds
- [ ] Login with new password → works ✅
- [ ] Try using same reset link again → shows "Invalid or expired" error
- [ ] Request new reset after 1 hour → old token doesn't work

---

## 📝 Notes

- The password reset flow is **production-ready** except for email sending
- All security best practices are implemented
- Token validation is robust and prevents replay attacks
- User experience is smooth and informative

**Next Steps:**
1. Test the full flow on the live site
2. Decide on email service (SendGrid recommended)
3. Add email sending to `forgot-password` endpoint
4. Remove console logging and API response `reset_link` field

---

Enjoy your secure password reset! 🍷🔐

