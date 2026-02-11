import CreateEventForm from "@/components/CreateEventForm";

const CreateEventPage = () => {
  return (
    <section id="create-event">
      <div className="create-event-shell">
        <div className="header">
          <h1>Create a new event</h1>
          <p>Share the details and let developers discover your event.</p>
        </div>
        <div className="form-card">
          <CreateEventForm />
        </div>
      </div>
    </section>
  );
};

export default CreateEventPage;
