import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodItem extends Document {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  isVeg: boolean;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FoodItemSchema: Schema = new Schema(
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
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFoodItem>('FoodItem', FoodItemSchema);
