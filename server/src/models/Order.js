import mongoose from 'mongoose';

export const ORDER_STATUSES = ['requested', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }, // price at order time
    quantity: { type: Number, required: true, min: 1, max: 10 },
    size: { type: Number, default: null },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Owner always comes from the token (req.userId), never from the body.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: {
      type: [orderItemSchema],
      validate: { validator: (v) => v.length > 0, message: 'Order needs at least one item' },
    },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'requested' },
    history: { type: [historySchema], default: () => [{ status: 'requested' }] },
    contact: {
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      note: { type: String, default: '', trim: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
