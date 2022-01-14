const express = require('express');
const mongoose = require('mongoose');

const app = express();
// const helmet = require('helmet');
const path = require('path');

//Variables d'environnement
require('dotenv').config();

const userRoutes = require('./routes/user'); //routes user
const sauceRoutes = require('./routes/sauce'); //routes sauce (ex stuffRoutes)

// CONNEXION DATABASE
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('La connexion  à MongoDB a échoué !'));

// HEADERS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// EXPRESS - HELMET
app.use(express.json());
// app.use(helmet());

// IMAGES PATH
app.use('/images', express.static(path.join(__dirname, 'images')));
// app.use(express.static('images'));

// ROUTES
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
