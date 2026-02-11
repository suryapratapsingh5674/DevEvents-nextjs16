import BookEvents from "@/components/BookEvents";
import EventCrad from "@/components/EventCrad";
import EventDetailItem from "@/components/EventDetailItem";
import { IEvent } from "@/database/event.model";
import { GetSimilerEventsBySlug } from "@/lib/actions/event.actions";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type EventDetailsProps = {
  params: Promise<{ slug: string }>;
};

const EventDetailsLoader = async ({ params }: EventDetailsProps) => {
  const { slug } = await params;
  return <EventDetailsContent slug={slug} />;
};

const EventDetailsContent = async ({ slug }: { slug: string }) => {
  const request = await fetch(`${BASE_URL ?? ""}/api/events/${slug}`);
  const data = await request.json();
  const event = data?.event;
  if (!request.ok || !event?.description) return notFound();

  const {
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda,
    audience,
    tags,
    organizer,
  } = event;

  const bookings = 10;

  const similarEvents = await GetSimilerEventsBySlug(slug);

  return (
    <section id="event">
        <div className="header">
          <h1>Event Description</h1>
          <p>{description}</p>
        </div>

        <div className="details">
          {/* left side - event content */}
          <div className="content">
            <Image src={image} alt="event image" width={800} height={800} className="banner"/>
            <section className="flex-col-gap-2">
              <h1>Overview</h1>
              <p>{overview}</p>
            </section>

            <section className="flex-col-gap-2">
              <h1>Event Details</h1>
              <EventDetailItem icon="/icons/calendar.svg" alt="calender" label={date}/>
              <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time}/>
              <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location}/>
              <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode}/>
              <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience}/>
            </section>

            <div className="agenda">
              <h2>Agenda</h2>
              <ul>
                {agenda.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <section className="flex-col-gap-2">
              <h2>About the Organizer</h2>
              <p>{organizer}</p>
            </section>

            <div className="flex flex-row gap-1.5 flex-wrap">
              {tags.map((tag: string) => (
                <div className="pill" key={tag}>{tag}</div>
              ))}
            </div>
          </div>
          {/* right side - Booking form */}
          <aside className="booking">
            <div className="signup-card">
              <h2>Book Your Spot</h2>
              {bookings > 0 ? (
                <p className="text-sm">
                  Join {bookings} people who already booked there spot!
                </p>
              ):(
                <p className="text-sm">Be a </p>
              )}
              <BookEvents eventId={event._id} slug={event.slug}/>
            </div>
          </aside>
        </div>
        <div className="flex w-full flex-col gap-4 pt-20">
          <h2>Smilar Events</h2>
          <div className="events">
            {similarEvents.length > 0 && similarEvents.map((event: IEvent) => (
              <EventCrad
                key={String(event._id)}
                title={event.title}
                image={event.image}
                slug={event.slug}
                location={event.location}
                date={event.date}
                time={event.time}
              />
            ))}
          </div>
        </div>
    </section>
  )
}

const EventDetailsPage = ({ params }: EventDetailsProps) => {
  return (
    <Suspense fallback={<div className="section">Loading event...</div>}>
      <EventDetailsLoader params={params} />
    </Suspense>
  );
};

export default EventDetailsPage