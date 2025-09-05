const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const errorMiddleware = require('./src/middleware/errorMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/alerts', alertRoutes);


app.use(errorMiddleware);

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT, () => 
    console.log('Server started')))
  .catch((err) => console.error(err));
