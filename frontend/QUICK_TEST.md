# Quick Testing Steps

## 1. Start Backend (if not running)
```bash
cd backend/FoodEval.Api
dotnet run
# Should be running on http://localhost:5080
```

## 2. Start Frontend
```bash
cd frontend
npm install  # First time only
npm run dev
# Opens on http://localhost:5173
```

## 3. Test Authentication Flow

1. **Open** `http://localhost:5173`
2. **Click** "Get Started - Login"
3. **Login** with valid credentials (you need a user in the database)
4. **Verify** redirect to `/dashboard`
5. **Check** user info displays correctly
6. **Click** "Logout"
7. **Verify** redirect to `/login`

## 4. Test Protected Routes

1. **Logout** if logged in
2. **Navigate** directly to `http://localhost:5173/dashboard`
3. **Verify** automatic redirect to `/login`

## 5. Test Offline Mode

1. **Open** DevTools (F12)
2. **Go to** Network tab
3. **Select** "Offline" from throttling dropdown
4. **Verify** yellow banner appears
5. **Set** back to "Online"
6. **Verify** banner disappears

## 6. Check Browser Console

- No red errors
- Check Network tab for API calls
- Verify Authorization headers are sent

## Quick Verification Commands

```bash
# Check if backend is running
curl http://localhost:5080/health

# Check frontend is running
curl http://localhost:5173
```
