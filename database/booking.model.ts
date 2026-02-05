import mongoose, { Schema, Types } from "mongoose";
import { Event } from "./event.model";

export interface BookingAttrs {
  eventId: Types.ObjectId;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<BookingAttrs>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    email: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

BookingSchema.pre("save", async function preSave(next) {
  try {
    // Validate email format before persisting the booking.
    if (!emailRegex.test(this.email)) {
      throw new Error("Invalid email format");
    }

    // Ensure the referenced event exists before saving.
    const exists = await Event.exists({ _id: this.eventId });
    if (!exists) {
      throw new Error("Referenced event does not exist");
    }

    return next();
  } catch (error) {
    return next(error as Error);
  }
});

export type BookingDocument = mongoose.HydratedDocument<BookingAttrs>;
export const Booking =
  (mongoose.models.Booking as mongoose.Model<BookingAttrs>) ||
  mongoose.model<BookingAttrs>("Booking", BookingSchema);
