# Sri Prathibha Model High School

A comprehensive school management system with admin dashboard, student admissions, and event management capabilities.

## Features

- **Admin Dashboard**
  - Secure authentication system
  - Overview of admissions, students, and events
  - Responsive design for all devices

- **Student Admissions**
  - Online admission form with validation
  - Document upload support
  - Application status tracking

- **Event Management**
  - Create and manage school events
  - Event calendar view
  - Event registration

- **Contact Management**
  - Track inquiries and communications
  - Follow-up system

## Tech Stack

- **Frontend**
  - React.js
  - React Router for navigation
  - Tailwind CSS for styling
  - Framer Motion for animations
  - React Icons
  - Axios for API calls

- **Backend**
  - Node.js with Express
  - MongoDB with Mongoose
  - JWT Authentication
  - File upload handling
  - CORS enabled

## Project Structure

```
.
├── client/                 # Frontend React application
│   ├── public/
│   └── src/
│       ├── assets/         # Static assets
│       ├── components/     # Reusable components
│       ├── contexts/       # React contexts
│       ├── hooks/          # Custom React hooks
│       ├── layouts/        # Layout components
│       ├── pages/          # Page components
│       ├── App.js          # Main App component
│       └── index.js        # Entry point
│
└── server/                # Backend server
    ├── config/            # Configuration files
    ├── controllers/       # Route controllers
    ├── middleware/        # Custom middleware
    ├── models/           # Database models
    ├── routes/           # API routes
    ├── uploads/          # Uploaded files
    └── server.js         # Server entry point
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd Sri-Prathibha-Model-High-School
   ```

2. Install server dependencies
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies
   ```bash
   cd ../client
   npm install
   ```

4. Set up environment variables
   - Create a `.env` file in the server directory with:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ADMIN_EMAIL=admin@example.com
     ADMIN_PASSWORD=securepassword
     ```

5. Start the development servers
   - In the server directory:
     ```bash
     npm start
     ```
   - In the client directory (new terminal):
     ```bash
     npm start
     ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Default Admin Login

- **Email**: admin@example.com
- **Password**: securepassword

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ for Sri Prathibha Model High School
- Special thanks to all contributors