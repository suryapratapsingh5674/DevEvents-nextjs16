'use server'
import Booking from "@/database/booking.model";
import connectDB from "../mongodb";

export const createBooking = async ({eventId, slug, email }:{eventId:string, slug:string, email:string})=>{
    try {
        await connectDB();
        const booking = await Booking.create({eventId, slug, email});
        return {success: true}
    } catch (e) {
        if ((e as { code?: number })?.code === 11000) {
            return { success: false, error: "You already booked this event." };
        }
        console.error('create booking failed', e);
        return {success:false}
    }
}