import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  foodItem: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  status: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema({
  foodItem: {
    type: Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const OrderSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      default: 'COD',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
