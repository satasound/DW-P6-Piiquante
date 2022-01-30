const express = require('express');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');
const app = express();

/********************************************************************************
 ******************  DOTENV Variables d'environnement  *************************
 *********************************************************************************/
require('dotenv').config();

/********************************************************************************
 *******************   MONGOOSE Database Connexion  *****************************
 *********************************************************************************/
mongoose
  // Connexion à la base de données
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('La connexion  à MongoDB a échoué !'));

/********************************************************************************
 ********************************   HEADERS   *****************************
 *********************************************************************************/
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

/********************************************************************************
 *********************   Express Rate Limit   *****************************
 *********************************************************************************/
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

/********************************************************************************
 *************************   HELMET           *****************************
 *********************************************************************************/
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/********************************************************************************
 *************************   JSON         *****************************
 *********************************************************************************/
app.use(express.json());

/********************************************************************************
 *************************   IMAGES PATH          *****************************
 *********************************************************************************/
app.use('/images', express.static(path.join(__dirname, 'images')));

/********************************************************************************
 *************************   ROUTES         *****************************
 *********************************************************************************/
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

//////////////////////////////////////////////////////////////////////
module.exports = app;
