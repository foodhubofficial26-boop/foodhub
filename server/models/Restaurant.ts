import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  description?: string;
  imageUrl?: string;
  address?: string;
  phone?: string;
  rating: number;
  isVeg: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
