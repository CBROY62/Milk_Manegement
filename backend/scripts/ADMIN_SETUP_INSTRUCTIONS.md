# Admin User Setup Instructions

## Problem
Current logged-in user का role 'customer' है, जबकि admin routes के लिए 'admin' role चाहिए। इसलिए admin sections पर click करने पर access denied हो रहा है।

## Solution: Create Admin User

### Method 1: Using npm script (Recommended)

1. **Backend folder में जाएं:**
   ```bash
   cd backend
   ```

2. **Admin user create करें:**
   ```bash
   npm run create:admin
   ```

3. **Script output में credentials देखें:**
   - Email: `admin@whitecraft.com`
   - Password: `Admin@123`
   - (Default credentials - script में change कर सकते हैं)

4. **Frontend में login करें:**
   - Login page पर जाएं
   - Admin email और password से login करें
   - अब admin sections access हो जाएंगे

### Method 2: Direct Node Command

```bash
cd backend
node scripts/createAdminUser.js
```

## Customizing Admin Credentials

Admin user की details change करने के लिए:

1. `backend/scripts/createAdminUser.js` file खोलें
2. `adminUser` object में values change करें:
   ```javascript
   const adminUser = {
     name: 'Your Admin Name',
     email: 'your-admin@email.com',
     password: 'YourSecurePassword',
     phone: '9999999999',
     address: 'Your Address',
     role: 'admin',
     isB2B: false,
     isActive: true
   };
   ```
3. Script को फिर से run करें

## Important Notes

⚠️ **Security:**
- First login के बाद password change करें
- Production में strong password use करें
- Admin credentials को secure रखें

⚠️ **Existing Admin:**
- अगर admin user already exists, script warning देगा
- Existing admin के email से login करें
- या script में different email use करें

## Troubleshooting

### Error: Email already exists
- Solution: Script में different email use करें या existing user से login करें

### Error: MongoDB connection failed
- Check: MongoDB URI correct है या नहीं
- Check: Internet connection
- Check: MongoDB Atlas whitelist settings

### Still getting access denied after login
- Browser console check करें (F12)
- User role verify करें: `localStorage.getItem('user')` में role check करें
- Logout करके फिर से login करें
- Browser cache clear करें

## Alternative: Update Current User Role

अगर current user का role directly database में update करना है:

1. MongoDB Compass या MongoDB Atlas में जाएं
2. `users` collection खोलें
3. Current user find करें (email से)
4. `role` field को `'admin'` में update करें
5. Frontend में logout/login करें

**MongoDB Query:**
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Verification

Admin user successfully create होने के बाद:

1. Login page पर admin credentials से login करें
2. Sidebar में "ADMINISTRATION" section दिखना चाहिए
3. Admin sections (Dashboard, Users, Products, etc.) access होने चाहिए
4. Browser console में role check करें:
   ```javascript
   // Console में run करें
   JSON.parse(localStorage.getItem('user')).role
   // Output: "admin" होना चाहिए
   ```

## Support

अगर issues आ रहे हैं:
1. Browser console check करें
2. Network tab में API calls check करें
3. Backend logs check करें
4. MongoDB में user document verify करें

