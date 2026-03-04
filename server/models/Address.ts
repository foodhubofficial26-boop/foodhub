import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAddress>('Address', AddressSchema);
