import { useNavigate } from 'react-router-dom';
import { EventForm } from "../../features/events/components/EventForm";
import { Button } from "@/components/ui/button";

export default function EventCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Event</h1>
        <Button variant="outline" onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </div>
      
      <div className="bg-card rounded-lg border p-6">
        <EventForm />
      </div>
    </div>
  );
}
