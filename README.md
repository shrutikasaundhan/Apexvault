# STT - Full-Stack Application

A comprehensive full-stack application with a React-based frontend and a Node.js/Express-based backend.

## 🚀 Tech Stack

### Frontend (Client)
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS v4
- **Router:** React Router v7
- **Features:** Swiper.js, Google OAuth (`@react-oauth/google`), Tabler Icons

### Backend (Server)
- **Runtime & Framework:** Node.js, Express
- **Database:** MongoDB (via Mongoose), Redis
- **Authentication:** Google Auth Library, bcrypt, cookie-parser
- **File Storage:** AWS S3 (with CloudFront Signer & Presigner)
- **Payments:** Razorpay
- **Emailing:** Resend, Nodemailer
- **Validation:** Zod

---

## 📁 Project Structure

```text
stt/
├── client/           # React frontend
└── server/           # Express.js backend
```

---

## 🛠️ Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Redis](https://redis.io/) (For caching)

---

### Setup Instructions

#### 1. Server Setup (Backend)

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and configure the environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   REDIS_URL=redis://localhost:6379
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   # Add other required environment variables (Razorpay, Google Auth, etc.)
   ```
4. Run the setup command (if database initialization is needed):
   ```bash
   npm run setup
   ```
5. Start the backend server in development mode:
   ```bash
   npm run dev
   ```

#### 2. Client Setup (Frontend)

1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory and configure your client keys (e.g. Google Client ID, backend API URL):
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## 📜 Available Scripts

### In the `server` directory:
- `npm run dev` - Starts the backend server with automated reloading (`node --watch`).
- `npm run setup` - Initializes database schema/configurations.

### In the `client` directory:
- `npm run dev` - Starts the local Vite development server.
- `npm run build` - Compiles the app for production.
- `npm run lint` - Lints code using ESLint.
- `npm run preview` - Locally previews the production build.
