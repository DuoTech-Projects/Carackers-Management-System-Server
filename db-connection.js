const mongoose = require('mongoose');
require('dotenv').config();

const dbConnection = () => {
  return new Promise((resolve, reject) => {
    mongoose.set('strictQuery', false);
    mongoose.connect(`${process.env.DB_CONNECTION_BASE_STRING}/adminDB`)
    .then(() => resolve('DB connected'))
    .catch((err) => reject(err));
  });
};

module.exports = {
  dbConnection,
};