import EventCrad from "@/components/EventCrad"
import ExpoloreBtn from "@/components/ExpoloreBtn"
import { events } from "@/lib/constants" 

const page = () => {
  return (
    <section>
      <h1 className="text-center">The Hub for every dev <br /> Event you Can't Miss</h1>
      <p className="text-center mt-5">Hackathons, Meetups, and Conferneces, All in One Place</p>
      <ExpoloreBtn/>
      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events list-none">
          {events.map((event)=>(
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