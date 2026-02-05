import mongoose, { Schema, Types } from "mongoose";

export interface EventAttrs {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const normalizeDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date format");
  }
  // Store dates as ISO strings for consistency.
  return parsed.toISOString();
};

const normalizeTime = (value: string): string => {
  const trimmed = value.trim();
  const twentyFourHourMatch = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (twentyFourHourMatch) {
    return `${twentyFourHourMatch[1].padStart(2, "0")}:${twentyFourHourMatch[2]}`;
  }

  const twelveHourMatch = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(am|pm)$/i.exec(trimmed);
  if (!twelveHourMatch) {
    throw new Error("Invalid time format");
  }

  const hour = Number.parseInt(twelveHourMatch[1], 10);
  const minutes = twelveHourMatch[2];
  const meridiem = twelveHourMatch[3].toLowerCase();
  const normalizedHour = meridiem === "pm" ? (hour % 12) + 12 : hour % 12;
  return `${normalizedHour.toString().padStart(2, "0")}:${minutes}`;
};

const requireNonEmptyString = (value: string, field: string): void => {
  if (value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
};

const requireNonEmptyArray = (value: string[], field: string): void => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${field} is required`);
  }
};

const EventSchema = new Schema<EventAttrs>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true },
  },
  {
    timestamps: true,
  }
);

EventSchema.pre("save", function preSave(next) {
  try {
    // Ensure required fields are present and non-empty.
    requireNonEmptyString(this.title, "Title");
    requireNonEmptyString(this.description, "Description");
    requireNonEmptyString(this.overview, "Overview");
    requireNonEmptyString(this.image, "Image");
    requireNonEmptyString(this.venue, "Venue");
    requireNonEmptyString(this.location, "Location");
    requireNonEmptyString(this.date, "Date");
    requireNonEmptyString(this.time, "Time");
    requireNonEmptyString(this.mode, "Mode");
    requireNonEmptyString(this.audience, "Audience");
    requireNonEmptyString(this.organizer, "Organizer");
    requireNonEmptyArray(this.agenda, "Agenda");
    requireNonEmptyArray(this.tags, "Tags");

    // Normalize date and time values for consistent storage.
    this.date = normalizeDate(this.date);
    this.time = normalizeTime(this.time);

    // Only regenerate slug when the title changes.
    if (this.isModified("title")) {
      this.slug = slugify(this.title);
    }

    return next();
  } catch (error) {
    return next(error as Error);
  }
});

export type EventDocument = mongoose.HydratedDocument<EventAttrs>;
export const Event =
  (mongoose.models.Event as mongoose.Model<EventAttrs>) ||
  mongoose.model<EventAttrs>("Event", EventSchema);
