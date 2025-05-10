import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  ChevronLeft,
  Tag as TagIcon,
  AlertCircle,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { eventsService } from '../services/eventsService';
import { EventTags } from './EventTags';
import { EventParticipants } from './EventParticipants';
import type { EventDetail as EventDetailType } from '../types/events';

// Using the EventDetailType imported from types/events.ts

export function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    if (eventId) {
      fetchEventDetails(eventId);
    }
  }, [eventId]);

  const fetchEventDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Get event details from the API
      const eventData = await eventsService.getEventById(id);
      setEvent(eventData);
    } catch (err: any) {
      console.error('Error fetching event details:', err);
      setError(err.message || 'Failed to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventId || !window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventsService.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      navigate('/events');
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const durationMs = endDateObj.getTime() - startDateObj.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours > 0 ? `${hours}h` : ''} ${minutes > 0 ? `${minutes}m` : ''}`.trim() || "0m";
  };

  const getStatusBadgeColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'upcoming': 'bg-blue-100 text-blue-800 border-blue-200',
      'ongoing': 'bg-green-100 text-green-800 border-green-200',
      'past': 'bg-gray-100 text-gray-800 border-gray-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    return statusMap[status.toLowerCase()] || statusMap['upcoming'];
  };

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex justify-center items-center py-12">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Event</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => eventId && fetchEventDetails(eventId)}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/events')}>Back to Events</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      {/* Back button and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/events')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="gap-1"
            onClick={handleDeleteEvent}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
      
      {/* Event header */}
      <div className="space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
              <p className="text-muted-foreground mt-1">
                {formatDate(event.startDate)} • Organized by {event.organizer.firstName} {event.organizer.lastName}
              </p>
            </div>
            <Badge 
              className={getStatusBadgeColor(event.status)}
              variant="outline"
            >
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
          </div>
        </div>
        
        {/* Event Image */}
        {event.imageUrl && (
          <div className="rounded-lg overflow-hidden h-[300px] w-full">
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full sm:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>{event.description}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Category:</span> {event.category.name}
                    </p>
                  </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="participants" className="py-4">
              {eventId && <EventParticipants eventId={eventId} />}
            </TabsContent>
          </Tabs>
          
          {/* Event details grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">{formatDate(event.startDate)}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                      <p className="text-sm text-muted-foreground">
                        Duration: {calculateDuration(event.startDate, event.endDate)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-sm text-muted-foreground">
                        {event.participantsCount} / {event.capacity} participants ({event.availableSeats} seats available)
                      </p>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${Math.min((event.participantsCount / event.capacity) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Organizer</p>
                      <p className="text-sm text-muted-foreground">
                        {event.organizer.firstName} {event.organizer.lastName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <TagIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Category</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline">{event.category.name}</Badge>
                      </div>
                    </div>
                  </div>
                  
                <div className="flex items-start gap-3">
                  <TagIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Tags</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {event.tags.length > 0 ? (
                        event.tags.map((tag) => (
                          <Badge 
                            key={tag.id} 
                            style={{ backgroundColor: '#6366f1' }} 
                            variant="outline" 
                            className="border-none text-white"
                          >
                            {tag.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No tags added</p>
                      )}
                    </div>
                  </div>
                    <TagIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="w-full">
                      {eventId && <EventTags eventId={eventId} initialTags={event.tags} />}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Action Card */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                {!event.isRegistered ? (
                  <Button className="w-full">
                    {event.availableSeats > 0 ? 'Register for Event' : 'Join Waitlist'}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full">
                    {event.userParticipation?.status === 'registered' ? 'Cancel Registration' : 'View Registration'}
                  </Button>
                )}
                <Button variant="outline" className="w-full">Download Attendee List</Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate(`/events/${eventId}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleDeleteEvent}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/events')}>Back to Events</Button>
        </div>
      )}
    </div>
  );
}
    </div>
  );
}

export default EventDetail;
