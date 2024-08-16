import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Item } from '../../items/schemas/item.schema';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  items: { item: Item; quantity: number }[];
  @Prop({ required: true })
  totalPrice: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
