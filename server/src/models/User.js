const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: 'México' },
  },
  { _id: true }
);

const paymentMethodSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    type: { type: String, default: 'tarjeta' },
    last4: { type: String },
    brand: { type: String },
  },
  { _id: true }
);

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    profileImage: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    addresses: [addressSchema],
    paymentMethods: [paymentMethodSchema],
    cart: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
