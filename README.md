Film Hall Ticket Booking System
A MERN stack application for booking movie tickets with role-based access for users, admins, and operators.
Features

User: Browse movies, select seats, generate PDF tickets with QR codes, view booking history.
Admin: Manage movies, halls, showtimes, and view reports.
Operator: Scan QR codes and check-in tickets.
Tech Stack: React 18, React Router DOM v6, Tailwind CSS, Node.js, Express.js, MongoDB, jsPDF, QR code libraries.

Setup Instructions
Prerequisites

Node.js
MongoDB
npm or yarn

Backend Setup

Navigate to backend/
Run npm install
Create .env with:PORT=5000
MONGO_URI=mongodb://localhost:27017/filmhall-booking
NODE_ENV=development


Start server: npm run dev

Frontend Setup

Navigate to frontend/
Run npm install
Start app: npm start

Running the App

Backend runs on http://localhost:5000
Frontend runs on http://localhost:3000

Project Structure
film-hall-booking/
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── models/
│   ├── routes/
│   ├── controllers/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── styles/

Dependencies

Backend: express, mongoose, cors, dotenv, bcryptjs, express-validator, multer, qrcode
Frontend: react, react-router-dom, axios, jspdf, qrcode, jsqr, tailwindcss

License
ISC