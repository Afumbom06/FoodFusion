# Restaurant Management System - Authentication Guide

## 🔐 Complete Authentication System

This RMS implementation includes a full-featured authentication system with all the components requested:

### ✅ Implemented Features

1. **Login Page** ✓
2. **Signup/Registration Page** ✓
3. **Forgot Password Page** ✓
4. **Reset Password Page** ✓
5. **Multi-Branch Selection Screen** ✓
6. **2FA/OTP Verification** ✓

---

## 🎯 Demo Credentials

### Standard User Accounts

#### Admin Account
- **Email:** `admin@restaurant.com`
- **Password:** `admin123`
- **Access:** Full system access, all branches

#### Manager Account
- **Email:** `manager@restaurant.com`
- **Password:** `manager123`
- **Access:** Branch-specific management (Downtown Branch)

#### Staff Account
- **Email:** `staff@restaurant.com`
- **Password:** `staff123`
- **Access:** Limited to assigned branch tasks

### Special Demo Accounts

#### Multi-Branch Manager
- **Email:** `multi@restaurant.com`
- **Password:** `multi123`
- **Features:** Shows branch selection screen after login

#### 2FA Enabled Account
- **Email:** `2fa@restaurant.com`
- **Password:** `secure123`
- **2FA Code:** `123456`
- **Features:** Requires OTP verification after login

---

## 🚀 User Flow Walkthrough

### New User Registration Flow
1. Click "Sign Up" from login page or landing page
2. Fill in required information:
   - Full Name
   - Email Address
   - Password (with strength indicator)
   - Confirm Password
   - Role (Admin/Manager/Staff)
   - Optional: Phone Number, Restaurant Name, Branch
3. Submit registration
4. Success confirmation
5. Auto-redirect to login

### Login Flow
1. Enter email and password
2. Optional: Check "Remember Me"
3. Submit credentials

**Paths:**
- **Standard User:** → Dashboard
- **Multi-Branch User:** → Branch Selection → Dashboard
- **2FA User:** → OTP Verification → Dashboard

### Password Recovery Flow
1. Click "Forgot Password" from login
2. Enter email address
3. System sends reset instructions (check browser console in demo)
4. Use reset link with token
5. Set new password
6. Auto-redirect to login

### Branch Selection (Multi-Branch Users)
1. After successful login
2. View all available branches
3. Search branches by name or location
4. Select desired branch
5. Continue to dashboard
6. Last selection is remembered

### 2FA Verification
1. After successful credential validation
2. 6-digit OTP sent to phone (simulated in demo)
3. Enter verification code
4. Auto-submit when all digits entered
5. Access granted to dashboard

---

## 🎨 UX Features Implemented

### Login Page
- ✅ Email/password validation
- ✅ "Remember Me" checkbox
- ✅ "Show/Hide Password" toggle
- ✅ Loading spinner during authentication
- ✅ Disabled button while submitting
- ✅ Error message display
- ✅ Quick demo credential buttons
- ✅ "Forgot Password" link
- ✅ "Sign Up" link
- ✅ "Back to Home" navigation

### Signup Page
- ✅ Multi-step form validation
- ✅ Real-time password strength indicator
- ✅ Password confirmation matching
- ✅ Email format validation
- ✅ Role-based field visibility
- ✅ Branch selection for managers/staff
- ✅ Restaurant name for admins
- ✅ Success confirmation screen
- ✅ Auto-redirect after registration

### Forgot Password
- ✅ Email validation
- ✅ Loading state
- ✅ Success confirmation
- ✅ Clear instructions
- ✅ Demo instructions (console log)

### Reset Password
- ✅ Token validation
- ✅ Password strength indicator
- ✅ Password confirmation
- ✅ Show/hide password toggles
- ✅ Success confirmation
- ✅ Auto-redirect to login

### Branch Selection
- ✅ Search functionality
- ✅ Branch cards with details
- ✅ Visual selection state
- ✅ "Remember last selected" feature
- ✅ Main branch badge
- ✅ Branch information display

### 2FA Verification
- ✅ 6-digit OTP input
- ✅ Auto-focus and auto-advance
- ✅ Paste support
- ✅ Auto-submit on completion
- ✅ Resend code with countdown
- ✅ Error handling with field reset
- ✅ Loading states

---

## 🔧 Technical Implementation

### State Management
- React Context API for authentication
- localStorage for persistent sessions
- sessionStorage for temporary sessions
- Branch selection persistence

### Security Features
- Password validation (minimum 6 characters)
- Email format validation
- Password strength indicator
- Token-based password reset
- 2FA support
- Role-based access control
- Remember Me functionality

### API Integration Points
The following functions are ready for backend integration:

```typescript
// AuthContext functions
login(email, password, rememberMe)
register(userData)
forgotPassword(email)
resetPassword(token, newPassword)
verify2FA(code)
selectBranch(branchId)
logout()
```

### Mock Data Structure
All authentication flows use mock data that matches expected backend responses:
- User objects with roles
- Password reset tokens
- OTP verification codes
- Branch information

---

## 🎯 Role-Based Routing

### Admin
- Full access to all modules
- Can manage all branches
- Branch selection optional

### Manager
- Branch-specific access
- May manage single or multiple branches
- Branch selection required if multi-branch

### Staff
- Limited to assigned branch
- Basic operations only
- No branch selection needed

---

## 📱 Responsive Design

All authentication screens are fully responsive:
- Mobile-first approach
- Tablet optimization
- Desktop layouts
- Touch-friendly inputs
- Accessible forms

---

## 🧪 Testing Instructions

### Test Login Flow
1. Visit landing page
2. Click "Start Free Trial" or "Sign In"
3. Use any demo credentials
4. Verify dashboard access

### Test Signup Flow
1. Click "Sign Up"
2. Fill in form with new credentials
3. Select role
4. Submit and verify success message
5. Login with new credentials

### Test Password Recovery
1. Click "Forgot Password"
2. Enter registered email
3. Check browser console for reset link
4. Navigate to reset password page
5. Set new password
6. Login with new password

### Test Multi-Branch Selection
1. Login with `multi@restaurant.com`
2. Verify branch selection screen appears
3. Search for branches
4. Select a branch
5. Verify dashboard access
6. Check localStorage for saved selection

### Test 2FA
1. Login with `2fa@restaurant.com`
2. Verify OTP screen appears
3. Enter code `123456`
4. Test auto-advance and paste features
5. Verify access granted

---

## 🔄 Future Enhancements

Ready for backend integration:
- [ ] Real email sending (SMTP/SendGrid)
- [ ] SMS OTP delivery (Twilio)
- [ ] Social authentication (Google, Facebook)
- [ ] Biometric authentication
- [ ] Session management
- [ ] Activity logging
- [ ] Password policy enforcement
- [ ] Account lockout after failed attempts
- [ ] Email verification on signup
- [ ] Admin approval for new accounts

---

## 📞 Support

For issues or questions about the authentication system:
- Check browser console for demo information
- Review error messages for validation issues
- Test with provided demo credentials first
- Ensure all required fields are filled

---

## 🎉 Quick Start

**Fastest way to test everything:**

1. **Landing Page** → Click "Start Free Trial"
2. **Login** → Click "Multi-Branch" demo button → Login
3. **Branch Selection** → Select any branch → Continue
4. **Dashboard** → Fully authenticated!

Or test 2FA:
1. **Login** → Click "2FA Demo" button → Login
2. **OTP Screen** → Enter `123456` → Verify
3. **Dashboard** → Access granted!

---

Built with ❤️ for Restaurant Management
