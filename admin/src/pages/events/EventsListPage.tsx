import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { eventsService } from "@/features/events/services/eventsService";
import type { EventSummary } from "@/features/events/types/events";

export default function EventsListPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventsService.getEvents();
        // The API returns the events in the data object, but the exact property name may vary
        // Check for common property names like items, events, or data
        setEvents(data.items || data.events || data.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsService.deleteEvent(id);
        setEvents(events.filter(event => event.id !== id));
        toast.success('Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button asChild>
          <Link to="/events/create">Create Event</Link>
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center my-12">
          <p className="text-muted-foreground mb-4">No events found</p>
          <Button asChild>
            <Link to="/events/create">Create your first event</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    {format(new Date(event.startDate), 'MMM d, yyyy')}
                    {event.endDate && event.endDate !== event.startDate && 
                      ` - ${format(new Date(event.endDate), 'MMM d, yyyy')}`}
                  </TableCell>
                  <TableCell>{event.location || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(event.startDate) > new Date() ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Upcoming</Badge>
                    ) : new Date(event.endDate || event.startDate) < new Date() ? (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">Past</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Active</Badge>
                    )}
                    {event.isFeatured && (
                      <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Featured</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/events/${event.id}`}>View</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/events/${event.id}/edit`}>Edit</Link>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(event.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}