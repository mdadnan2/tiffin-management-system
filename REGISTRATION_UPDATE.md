# Registration Form Update

## Changes Made

### ✅ Added Role Field to Registration

**What was added:**
1. Role dropdown selector in registration form
2. Options: USER or ADMIN
3. Default selection: USER
4. Shield icon for visual clarity

**Files Modified:**
- `frontend/src/app/register/page.tsx` - Added role state and dropdown
- `frontend/src/lib/api.ts` - Updated register function to accept role parameter
- `frontend/src/components/ui/select.tsx` - Created Select component (NEW)

**How it works:**
- Users can now select their role during registration
- Role is sent to the backend API
- Backend validates and creates user with selected role

**Testing:**
1. Go to http://localhost:3000/register
2. Fill in: Name, Email, Password
3. Select Role: USER or ADMIN
4. Click "Create Account"
5. User will be created with the selected role

**Default Behavior:**
- If no role is selected, defaults to USER
- Backend also defaults to USER if role is not provided
