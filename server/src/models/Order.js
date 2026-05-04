const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true, min: 0 },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    paymentSummary: {
      label: String,
      type: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
