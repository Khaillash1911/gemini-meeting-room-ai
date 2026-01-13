# Gemini Meeting Room AI

## Milestone 2: Core Booking System

This project is a meeting room booking system built with Next.js 15+, Firebase, and Tailwind CSS.

### Setup Instructions

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Firebase**
    - Create a project in the [Firebase Console](https://console.firebase.google.com/).
    - Enable **Authentication** (Email/Password provider).
    - Enable **Firestore Database**.
    - Copy your web app's configuration keys.
    - Open `.env.local` and fill in the values:
      ```env
      NEXT_PUBLIC_FIREBASE_API_KEY=...
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
      NEXT_PUBLIC_FIREBASE_APP_ID=...
      ```

3.  **Run Locally**
    ```bash
    npm run dev
    ```
    Visit [http://localhost:3000](http://localhost:3000).

### Features
- **User Auth**: Sign up and login (Email/Password).
- **Admin Dashboard**: View all rooms and their QR codes.
- **Room Management**: Create new rooms with capacity and location.
- **Booking Flow**: Book a room by date, time, and duration.
