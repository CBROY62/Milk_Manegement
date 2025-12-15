# Admin User Setup Instructions

## Problem
Current logged-in user का role 'customer' है, जबकि admin routes के लिए 'admin' role चाहिए। इसलिए admin sections पर click करने पर access denied हो रहा है।

## Solution: Create Admin User

### Method 1: Using npm script with Command-Line Arguments (Recommended)

**Naye admin create karne ke liye command-line arguments use karein:**

1. **Backend folder में जाएं:**
   ```bash
   cd backend
   ```

2. **Admin user create करें with custom details:**
   ```bash
   npm run create:admin -- --name "Admin Name" --email "admin@example.com" --password "SecurePass123" --phone "9876543210" --address "Admin Address"
   ```

   **Minimal required fields:**
   ```bash
   npm run create:admin -- --name "Admin Name" --email "admin@example.com" --password "Pass123" --phone "9876543210"
   ```

3. **Help message देखने के लिए:**
   ```bash
   npm run create:admin -- --help
   ```

4. **Script output में credentials देखें** और **Frontend में login करें**

### Method 2: Using Default Admin (Backward Compatible)

अगर कोई arguments नहीं दिए, तो default admin create होगा:

```bash
cd backend
npm run create:admin
```

**Default credentials:**
- Email: `admin@whitecraft.com`
- Password: `Admin@123`
- Name: `Admin User`
- Phone: `9999999999`

### Method 3: Direct Node Command

```bash
cd backend
node scripts/createAdminUser.js --name "Admin Name" --email "admin@example.com" --password "Pass123" --phone "9876543210"
```

## Multiple Admins Create करना

Ab aap multiple admins easily create kar sakte hain! Har admin ke liye different email use karein:

```bash
# First admin
npm run create:admin -- --name "John Admin" --email "john@example.com" --password "Pass123" --phone "9876543210"

# Second admin
npm run create:admin -- --name "Jane Admin" --email "jane@example.com" --password "Pass456" --phone "9876543211"

# Third admin
npm run create:admin -- --name "Bob Admin" --email "bob@example.com" --password "Pass789" --phone "9876543212"
```

**Note:** Har admin ka unique email hona chahiye. Script automatically email uniqueness check karti hai.

## Important Notes

⚠️ **Security:**
- First login के बाद password change करें
- Production में strong password use करें (minimum 6 characters)
- Admin credentials को secure रखें
- Command-line में password visible hota hai, history clear karein agar needed

⚠️ **Multiple Admins:**
- Ab multiple admins create kar sakte hain (pehle sirf ek admin allowed tha)
- Har admin ka unique email hona chahiye
- Agar same email se admin already exists, script warning dega

⚠️ **Existing User:**
- Agar user already exists but admin nahi hai, script automatically usko admin role de degi
- Agar user already admin hai, script inform karega
- Email uniqueness check automatically hota hai

## Command-Line Arguments Reference

### Available Options

| Option | Required | Description | Example |
|--------|----------|-------------|---------|
| `--name` | Yes* | Admin user name | `--name "John Admin"` |
| `--email` | Yes* | Admin email (must be unique) | `--email "john@example.com"` |
| `--password` | Yes* | Admin password (min 6 chars) | `--password "SecurePass123"` |
| `--phone` | Yes* | Admin phone number | `--phone "9876543210"` |
| `--address` | No | Admin address | `--address "123 Main St"` |
| `--help` or `-h` | No | Show help message | `--help` |

*Required when using command-line arguments. If no arguments provided, default admin will be created.

### Usage Examples

**Create admin with all fields:**
```bash
npm run create:admin -- --name "Super Admin" --email "superadmin@company.com" --password "SuperSecure123!" --phone "9876543210" --address "Company Headquarters"
```

**Create admin with minimal fields:**
```bash
npm run create:admin -- --name "Admin" --email "admin@test.com" --password "admin123" --phone "9999999999"
```

**Show help:**
```bash
npm run create:admin -- --help
```

**Create default admin (no arguments):**
```bash
npm run create:admin
```

## Troubleshooting

### Error: Validation errors (Name/Email/Password/Phone required)
- **Solution:** Sabhi required fields provide karein:
  ```bash
  npm run create:admin -- --name "Name" --email "email@example.com" --password "pass123" --phone "9999999999"
  ```

### Error: Password must be at least 6 characters
- **Solution:** Password minimum 6 characters ka hona chahiye
- Example: `--password "Secure123"` ✅
- Example: `--password "12345"` ❌ (too short)

### Error: Please enter a valid email address
- **Solution:** Valid email format use karein
- Example: `--email "admin@example.com"` ✅
- Example: `--email "invalid-email"` ❌

### Error: Email already exists
- **Solution:** Different email use करें या existing user से login करें
- Agar existing user admin nahi hai, script automatically usko admin bana degi

### Error: MongoDB connection failed
- **Check:** MongoDB URI correct है या नहीं (`.env` file में `MONGODB_URI`)
- **Check:** Internet connection
- **Check:** MongoDB Atlas whitelist settings
- **Check:** MongoDB service running hai ya nahi

### Still getting access denied after login
- Browser console check करें (F12)
- User role verify करें: `localStorage.getItem('user')` में role check करें
- Logout करके फिर से login करें
- Browser cache clear करें
- Backend logs check करें

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

