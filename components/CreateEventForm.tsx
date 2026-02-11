"use client";

import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useState } from "react";

const initialForm = {
  title: "",
  description: "",
  overview: "",
  venue: "",
  location: "",
  date: "",
  time: "",
  mode: "online",
  audience: "",
  organizer: "",
};

const splitList = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const CreateEventForm = () => {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [tags, setTags] = useState("");
  const [agenda, setAgenda] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!imageFile) {
      setError("Please select an image.");
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      payload.set(key, value);
    });

    payload.set("tags", JSON.stringify(splitList(tags)));
    payload.set("agenda", JSON.stringify(splitList(agenda)));
    payload.set("image", imageFile);

    try {
      setSubmitting(true);
      const response = await fetch("/api/events", {
        method: "POST",
        body: payload,
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result?.error || "Failed to create event.");
        posthog.capture("event_create_failed", { reason: result?.error });
        return;
      }

      posthog.capture("event_created", { event_slug: result?.event?.slug });
      if (result?.event?.slug) {
        router.push(`/events/${result.event.slug}`);
      } else {
        router.push("/");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create event.";
      setError(message);
      posthog.capture("event_create_failed", { reason: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id="create-event-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="React Summit 2026"
            required
          />
        </div>
        <div>
          <label htmlFor="organizer">Organizer</label>
          <input
            id="organizer"
            name="organizer"
            value={form.organizer}
            onChange={handleChange}
            placeholder="DevEvents Team"
            required
          />
        </div>
        <div>
          <label htmlFor="audience">Audience</label>
          <input
            id="audience"
            name="audience"
            value={form.audience}
            onChange={handleChange}
            placeholder="Frontend developers, students, founders"
            required
          />
        </div>

        <div>
          <label htmlFor="venue">Venue</label>
          <input
            id="venue"
            name="venue"
            value={form.venue}
            onChange={handleChange}
            placeholder="Main Hall"
            required
          />
        </div>
        <div>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Bangalore, India"
            required
          />
        </div>
        <div>
          <label htmlFor="mode">Mode</label>
          <select id="mode" name="mode" value={form.mode} onChange={handleChange}>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="time">Time</label>
          <input
            id="time"
            name="time"
            type="time"
            value={form.time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="span-2 span-3">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Tell attendees why this event matters."
            rows={3}
            required
          />
        </div>

        <div className="span-2 span-3">
          <label htmlFor="overview">Overview</label>
          <textarea
            id="overview"
            name="overview"
            value={form.overview}
            onChange={handleChange}
            placeholder="Short overview for the event detail page."
            rows={2}
            required
          />
        </div>

        <div className="span-2 span-3">
          <label htmlFor="agenda">Agenda</label>
          <textarea
            id="agenda"
            name="agenda"
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            placeholder="Keynote\nPanel discussion\nNetworking"
            rows={3}
            required
          />
          <p className="helper">Use commas or new lines to separate agenda items.</p>
        </div>

        <div>
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="react, nextjs, frontend"
            required
          />
          <p className="helper">Use commas to separate tags.</p>
        </div>

        <div>
          <label htmlFor="image">Event Image</label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="native-file"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            required
          />
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create Event"}
      </button>
    </form>
  );
};

export default CreateEventForm;
