import mongoose from 'mongoose';

const movementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['entrada', 'salida'],
      required: [true, 'El tipo de movimiento es obligatorio'],
    },
    quantity: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad debe ser al menos 1'],
    },
    note: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Movement', movementSchema);
