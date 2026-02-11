import EventCrad from "@/components/EventCrad"
import ExpoloreBtn from "@/components/ExpoloreBtn"
import { IEvent } from "@/database/event.model";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL;

const normalizeBaseUrl = (value?: string) => {
  if (!value) {
    return "http://localhost:3000";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
};

const page = async () => {
  "use cache"
  cacheLife('hours');
  const response = await fetch(new URL("/api/events", normalizeBaseUrl(BASE_URL)));
  const {events} = await response.json();

  return (
    <section>
      <h1 className="text-center">The Hub for every dev <br /> Event you Can't Miss</h1>
      <p className="text-center mt-5">Hackathons, Meetups, and Conferneces, All in One Place</p>
      <ExpoloreBtn/>
      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events list-none">
          {events && events.length > 0 && events.map((event:IEvent)=>(
            <li key={event.title}>
              <EventCrad {...event}/>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default page