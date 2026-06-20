"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MOCK_EVENTS } from "@/backend/lib/mock-data";
import { EventCardProps } from "@/frontend/shared/types/event.types";

interface EventContextType {
  events: EventCardProps[];
  addEvent: (event: EventCardProps) => void;
  deleteEvent: (id: string) => void;
  updateEvent: (id: string, updatedEvent: Partial<EventCardProps>) => void;
  fetchEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventCardProps[]>([]);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error("Failed to fetch events:", e);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const addEvent = async (eventData: EventCardProps) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        const savedEvent = await res.json();
        setEvents((prev) => [savedEvent, ...prev]);
        return savedEvent;
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create event");
      }
    } catch (e: any) {
      console.error("Create event API error:", e);
      throw e;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, isCancelled: true, status: 'cancelled' as any } : e
          )
        );
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to cancel event");
      }
    } catch (e: any) {
      console.error("Cancel event API error:", e);
      throw e;
    }
  };

  const updateEvent = async (id: string, updatedFields: Partial<EventCardProps>) => {
    try {
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedFields }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
        return updated;
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update event");
      }
    } catch (e: any) {
      console.error("Update event API error:", e);
      throw e;
    }
  };

  return (
    <EventContext.Provider value={{ events, addEvent, deleteEvent, updateEvent, fetchEvents }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
}
