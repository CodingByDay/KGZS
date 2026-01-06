# Testing Guide for FoodEval Frontend

## Prerequisites

1. **Backend API must be running** on `http://localhost:5080`
   - Start the backend API server
   - Ensure the database is set up and migrations are applied
   - Verify the API is accessible at `http://localhost:5080/swagger`

2. **Environment Setup**
   - Ensure `.env` file exists with `VITE_API_BASE_URL=http://localhost:5080`
   - Or the default will be used automatically

## Quick Start

1. **Install dependencies** (if not already done):
```bash
cd frontend
npm install
```

2. **Start the development server**:
```bash
npm run dev
```

3. **Open your browser** to the URL shown (typically `http://localhost:5173`)

## Manual Testing Checklist

### 1. Landing Page (`/`)

- [ ] Page loads with hero section
- [ ] Features section displays correctly
- [ ] "Get Started - Login" button navigates to `/login`
- [ ] UI is responsive (test on different screen sizes)

### 2. Login Page (`/login`)

**Valid Login:**
- [ ] Enter valid email and password
- [ ] Click "Login" button
- [ ] Loading state shows "Loading..."
- [ ] On success: redirects to `/dashboard`
- [ ] Token is stored in localStorage (check DevTools → Application → Local Storage)

**Invalid Login:**
- [ ] Enter invalid credentials
- [ ] Error message displays: "Invalid email or password"
- [ ] Form remains on login page

**Form Validation:**
- [ ] Submit empty form → shows "Email is required" and "Password is required"
- [ ] Enter invalid email format → shows "Email is invalid"
- [ ] Error messages clear when typing

**UI States:**
- [ ] Button shows "Loading..." during API call
- [ ] Button is disabled during loading
- [ ] Inputs are disabled during loading

### 3. Dashboard Page (`/dashboard`)

**Authentication Check:**
- [ ] Access `/dashboard` without token → redirects to `/login`
- [ ] After login, can access dashboard

**User Information:**
- [ ] User ID displays correctly
- [ ] Email displays correctly
- [ ] Role displays correctly
- [ ] Loading state shows while fetching user data

**Logout:**
- [ ] Click "Logout" button
- [ ] Token is removed from localStorage
- [ ] Redirects to `/login`
- [ ] Cannot access `/dashboard` after logout

**Error Handling:**
- [ ] If API returns 401 → redirects to login
- [ ] If API error → shows error message

### 4. Protected Routes

- [ ] Try accessing `/dashboard` directly without login → redirects to `/login`
- [ ] After login, can access protected routes
- [ ] After logout, protected routes redirect to login

### 5. Error Pages

**404 Not Found:**
- [ ] Navigate to `/nonexistent` → shows 404 page
- [ ] "Go to Home" button works

**403 Forbidden:**
- [ ] Navigate to `/403` → shows forbidden page
- [ ] "Go to Home" button works

### 6. Offline Functionality

**Offline Detection:**
- [ ] Open browser DevTools → Network tab
- [ ] Set to "Offline" mode
- [ ] Yellow banner appears: "You are currently offline..."
- [ ] Banner disappears when back online

**Offline Queue:**
- [ ] Go offline (DevTools → Network → Offline)
- [ ] Try to perform a POST/PUT/DELETE action (if you have such endpoints)
- [ ] Action should be queued (check localStorage → `offline_queue`)
- [ ] Go back online
- [ ] Queued actions should flush automatically
- [ ] Check browser console for flush messages

**Testing Offline Queue:**
```javascript
// In browser console, manually test:
// 1. Go offline
// 2. Check localStorage.getItem('offline_queue')
// 3. Go online
// 4. Check if queue is cleared
```

### 7. API Integration

**Check Network Requests:**
- [ ] Open DevTools → Network tab
- [ ] Login → see POST to `/api/auth/login`
- [ ] Dashboard → see GET to `/api/auth/me` with `Authorization: Bearer <token>`
- [ ] Verify CORS headers are present

**Token Management:**
- [ ] Check localStorage has `auth_token` after login
- [ ] Token is sent in Authorization header for authenticated requests
- [ ] Token is removed on logout

## Browser DevTools Testing

### Chrome/Edge DevTools

1. **Application Tab:**
   - Local Storage → Check `auth_token` and `current_user`
   - Check `offline_queue` when testing offline

2. **Network Tab:**
   - Filter by "Fetch/XHR" to see API calls
   - Check request headers (Authorization)
   - Check response status codes
   - Use "Offline" throttling to test offline mode

3. **Console:**
   - Check for any errors
   - Check for offline queue flush messages

### Testing CORS

- [ ] Verify no CORS errors in console
- [ ] Check Network tab → Request Headers → Origin
- [ ] Check Response Headers → Access-Control-Allow-Origin

## Common Issues & Solutions

### Issue: CORS Error
**Solution:** Ensure backend CORS is configured for `http://localhost:5173` (or your dev port)

### Issue: 401 Unauthorized
**Solution:** 
- Check if token exists in localStorage
- Verify token is being sent in Authorization header
- Check if token has expired

### Issue: Network Error
**Solution:**
- Verify backend is running on `http://localhost:5080`
- Check `.env` file has correct `VITE_API_BASE_URL`
- Check browser console for detailed error

### Issue: Offline Queue Not Flushing
**Solution:**
- Check browser console for errors
- Verify `navigator.onLine` is true
- Check localStorage for queued actions

## Automated Testing (Optional)

To add automated tests, you can install testing libraries:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

Then create test files in a `__tests__` or `tests` directory.

## Performance Testing

- [ ] Page load time is reasonable (< 2 seconds)
- [ ] No console errors or warnings
- [ ] Images/assets load correctly
- [ ] No memory leaks (check with DevTools → Memory)

## Accessibility Testing

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators are visible
- [ ] Screen reader compatible (test with browser extensions)
- [ ] Color contrast meets WCAG standards

## Cross-Browser Testing

Test on:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

## Mobile Testing

- [ ] Responsive design works on mobile viewport
- [ ] Touch interactions work correctly
- [ ] Forms are usable on mobile
