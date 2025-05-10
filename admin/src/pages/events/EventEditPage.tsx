import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { eventsService } from '@/features/events/services/eventsService';
import { EventForm } from '@/features/events/components/EventForm';

// UI components for layout
const Container = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`container mx-auto px-4 ${className}`} {...props}>
    {children}
  </div>
);

const Spinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

export default function EventEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        navigate("/events");
        return;
      }

      try {
        setLoading(true);
        const eventData = await eventsService.getEventById(id);
        
        // Format data for the form
        setEvent({
          title: eventData.title,
          description: eventData.description,
          startDate: new Date(eventData.startDate),
          endDate: new Date(eventData.endDate),
          location: eventData.location,
          categoryId: eventData.category?.id,
          capacity: eventData.capacity,
          isFeatured: eventData.isFeatured,
          imageUrl: eventData.imageUrl,
          tagIds: eventData.tags?.map(tag => tag.id) || []
        });
      } catch (err) {
        console.error("Failed to fetch event:", err);
        setError("Failed to load event. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  if (loading) {
    return (
      <Container className="py-6">
        <Helmet>
          <title>Loading Event | Admin Dashboard</title>
        </Helmet>
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-6">
        <Helmet>
          <title>Error | Admin Dashboard</title>
        </Helmet>
        <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => navigate('/events')}>Back to Events</Button>
        </div>
      </Container>
    );
  }

  return event ? (
    <Container className="py-6">
      <Helmet>
        <title>Edit Event: {event.title} | Admin Dashboard</title>
      </Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Event: {event.title}</h1>
        <Button variant="outline" onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </div>
      
      <div className="bg-card rounded-lg border p-6">
        <EventForm eventId={id} initialData={event} />
      </div>
    </Container>
  ) : null;
}
