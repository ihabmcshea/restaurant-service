import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Item } from '../../items/schemas/item.schema';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({
    type: [
      {
        item: { type: Object, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    required: true,
  })
  items: { item: Item; quantity: number }[];

  @Prop({ required: true, type: Number })
  totalPrice: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
