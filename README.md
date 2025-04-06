# Library Automation System

A modern library management system built with React, Node.js, and Firebase.

## Project Overview

This Library Automation System provides an efficient and user-friendly solution for managing library operations including:
- Book inventory management
- User registration and management
- Book borrowing and returns
- Overdue notifications
- Reporting and analytics

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js + Express
- **Database**: Firebase (Realtime Database/Firestore)
- **Authentication**: Firebase Auth
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```
3. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

### Running the Application

Development mode (both frontend and backend):
```bash
npm run dev:full
```

Backend only:
```bash
npm run dev
```

Frontend only:
```bash
npm run client
```

## Project Structure

```
library-automation-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React Context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── public/           # Static files
├── server/                # Node.js backend
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   └── utils/           # Utility functions
└── package.json
```

## Features

- User authentication and authorization
- Book management (add, edit, delete)
- Member management
- Borrowing system
- Return tracking
- Fine calculation
- Reports generation

## Contributing

This project is developed by:
- Melda Yazgın
- Aytun Yüksek

## License

This project is part of academic coursework. 