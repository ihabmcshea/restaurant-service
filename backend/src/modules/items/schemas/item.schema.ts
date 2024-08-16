import { Schema, Document, Types } from 'mongoose';

export const ItemSchema = new Schema({
  id: { type: Types.ObjectId },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
});

export interface Item extends Document {
  title: string;
  description: string;
  price: number;
}
