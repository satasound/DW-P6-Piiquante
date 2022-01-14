require('dotenv').config();

const db = {
  userneme: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  cluster: process.env.DB_CLUSTER,
  name: process.env.DB_NAME,
};
