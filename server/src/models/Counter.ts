import mongoose, { Schema } from 'mongoose';

export interface ICounter {
  _id: string; // key like 'invoice_seq_2611'
  seq: number;
}

const CounterSchema = new Schema<ICounter>(
  {
    _id: {
      type: String,
      required: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);

export const Counter = mongoose.model<ICounter>('Counter', CounterSchema);
