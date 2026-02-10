import { Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudApiKey = process.env.CLOUDINARY_API_KEY;
const cloudApiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && cloudApiKey && cloudApiSecret) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: cloudApiKey,
        api_secret: cloudApiSecret,
    });
}

export async function POST(req: NextRequest){
    try {
        await connectDB();
        if (!cloudName || !cloudApiKey || !cloudApiSecret) {
            return NextResponse.json(
                { message: "Event creation failed", error: "Cloudinary is not configured" },
                { status: 500 }
            );
        }
        const contentType = req.headers.get('content-type') || '';
        let event: Record<string, unknown>;
        let formData: FormData | null = null;

        if (contentType.includes('application/json')) {
            event = await req.json();
        } else if (
            contentType.includes('multipart/form-data') ||
            contentType.includes('application/x-www-form-urlencoded')
        ) {
            formData = await req.formData();
            event = Object.fromEntries(formData.entries());
        } else {
            return NextResponse.json(
                {message: 'Event creation failed', error: 'Unsupported Content-Type'},
                {status: 415}
            );
        }

        // Normalize common fields from form-data strings
        const unquote = (value: string) => value.trim().replace(/^"|"$/g, '').trim();

        if (typeof event.mode === 'string') {
            event.mode = unquote(event.mode).toLowerCase();
        }

        if (typeof event.time === 'string') {
            event.time = unquote(event.time);
        }

        if (typeof event.date === 'string') {
            event.date = unquote(event.date);
        }

        const arrayFields = ['agenda', 'tags'] as const;
        for (const field of arrayFields) {
            const value = event[field];
            if (typeof value === 'string') {
                let parsed: unknown;
                try {
                    parsed = JSON.parse(value);
                } catch {
                    parsed = null;
                }

                if (Array.isArray(parsed)) {
                    event[field] = parsed;
                } else if (value.includes(',')) {
                    event[field] = value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean);
                } else if (value.trim().length > 0) {
                    event[field] = [value.trim()];
                }
            }
        }

        if (!formData) {
            return NextResponse.json(
                { message: "Event creation failed", error: "Multipart form-data required for image upload" },
                { status: 400 }
            );
        }

        const file = formData.get('image') as File | null;
        if (!file) {
            return NextResponse.json({ message: 'Image is required.' }, { status: 400 });
        }

        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject)=>{
            cloudinary.uploader.upload_stream({resource_type: 'image', folder: 'DevEvent'},(error, results)=>{
                if(error) return reject(error);

                resolve(results)
            }).end(buffer);
        })
        event.image = (uploadResult as {secure_url : string}).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags:tags,
            agenda:agenda,
        });
        return NextResponse.json({message: 'Event created successfully', event:createdEvent}, {status:201});
    } catch (e) {
        console.log(e);
        return NextResponse.json({message: 'Event creation failed', error: e instanceof Error ? e.message : 'Unknown'}, {status: 400});
    }
}

export async function GET(){
    try {
        await connectDB();

        const events = await Event.find().sort({createdAt : -1});

        return NextResponse.json({message: 'event fetch succesfully', events}, {status: 200});
    } catch (e) {
        return NextResponse.json({message: 'event fatching failed', error: e}, {status:500});
    }
}