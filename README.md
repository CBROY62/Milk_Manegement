# Milk Management System

A full-stack registration application built with React.js frontend and Node.js/Express.js backend, connected to MongoDB Atlas.

## Features

- Beautiful single-page registration form
- Real-time form validation
- Data persistence to MongoDB Atlas:
- Responsive design
- Error handling and user feedback

## Project Structure

```
Milk_Manegement/
├── backend/
│   ├── server.js          # Express server with MongoDB connection
│   ├── package.json       # Backend dependencies
│   └── .gitignore
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styling
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json       # Frontend dependencies
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB Atlas account (already configured)

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory (optional, connection string is already in server.js):
   ```
   MONGODB_URI=mongodb+srv://bhushand620:bhushand620@milk.9obgflc.mongodb.net/Milk_Management?appName=Milk
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

   The application will open in your browser at `http://localhost:3000`

## Database Information

- **Database Name**: Milk_Management
- **Collection Name**: Milk_data
- **Connection**: MongoDB Atlas Cloud

## API Endpoints

### POST `/api/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": "123 Main Street"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": { ... }
}
```

### GET `/api/registrations`
Get all registered users.

## Form Fields

- **Name**: Full name (required)
- **Email**: Email address (required, unique)
- **Phone**: Phone number (required)
- **Address**: Full address (required)

## Technologies Used

### Backend
- Node.js
- Express.js
- Mongoose (MongoDB ODM)
- CORS
- dotenv

### Frontend
- React.js
- Axios (HTTP client)
- CSS3 (Modern styling with gradients and animations)

## Troubleshooting

1. **Backend connection issues**: Make sure MongoDB Atlas allows connections from your IP address (check Network Access in MongoDB Atlas)

2. **CORS errors**: The backend has CORS enabled, but if you encounter issues, check the `cors` configuration in `server.js`

3. **Port already in use**: Change the PORT in `.env` file or `server.js` if port 5000 is already in use

4. **Email already exists**: The system prevents duplicate email registrations

## Notes

- The MongoDB connection string is already configured in `server.js`
- The application saves data to the `Milk_data` collection in the `Milk_Management` database
- All form fields are required for registration
- The form includes client-side and server-side validation

