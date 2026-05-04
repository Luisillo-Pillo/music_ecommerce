const mongoose = require('mongoose');

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Falta MONGODB_URI en el entorno');
  }
  await mongoose.connect(uri);
}

module.exports = { connectDb };
