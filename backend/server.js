const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/operator', require('./routes/operatorRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));