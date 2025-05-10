import type { 
  EventsResponse, 
  EventDetail, 
  EventSummary,
  Tag,
  ParticipantsResponse,
  Category
} from "../types/events";

// Mock categories data - explicitly exported
export const mockCategories: Category[] = [
  { 
    id: "1", 
    name: "Conference", 
    description: "Large-scale events with multiple speakers",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin"
  },
  { 
    id: "2", 
    name: "Workshop", 
    description: "Hands-on learning sessions",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin"
  },
  { 
    id: "3", 
    name: "Seminar", 
    description: "Educational events focused on specific topics",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin"
  },
  { 
    id: "4", 
    name: "Networking", 
    description: "Events focused on making connections",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin"
  }
];

// Mock tags data
export const mockTags: Tag[] = [
  { 
    id: "1", 
    name: "Technology", 
    description: "Technology-related events",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin"
  },
  { 
    id: "2", 
    name: "Business", 
    description: "Business and entrepreneurship events",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin"
  },
  { 
    id: "3", 
    name: "Design", 
    description: "Design and UX/UI events",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin"
  },
  { 
    id: "4", 
    name: "Marketing", 
    description: "Marketing and advertising events",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin"
  },
  { 
    id: "5", 
    name: "Development", 
    description: "Software development events",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin"
  }
];

// Mock events data
export const mockEvents: EventSummary[] = [
  {
    id: "1",
    title: "Tech Conference 2025",
    startDate: new Date(2025, 5, 15).toISOString(),
    endDate: new Date(2025, 5, 17).toISOString(),
    location: "San Francisco, CA",
    description: "Annual tech conference featuring the latest innovations",
    isFeatured: true,
    capacity: 500,
    participantsCount: 0,
    category: mockCategories[0],
    status: "upcoming",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: "2",
    title: "Design Workshop",
    startDate: new Date(2025, 6, 10).toISOString(),
    endDate: new Date(2025, 6, 11).toISOString(),
    location: "New York, NY",
    description: "Hands-on workshop for UX/UI designers",
    isFeatured: false,
    capacity: 50,
    participantsCount: 0,
    category: mockCategories[1],
    status: "upcoming",
    imageUrl: "https://images.unsplash.com/photo-1576153192396-180ecef2a715?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80"
  },
  {
    id: "3",
    title: "Startup Networking Event",
    startDate: new Date(2025, 5, 25).toISOString(),
    endDate: new Date(2025, 5, 25).toISOString(),
    location: "Austin, TX",
    description: "Connect with founders, investors, and startup enthusiasts",
    isFeatured: true,
    capacity: 100,
    participantsCount: 0,
    category: mockCategories[3],
    status: "upcoming",
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: "4",
    title: "JavaScript Meetup",
    startDate: new Date(2025, 7, 5).toISOString(),
    endDate: new Date(2025, 7, 5).toISOString(),
    location: "Chicago, IL",
    description: "Monthly meetup for JavaScript developers",
    isFeatured: false,
    capacity: 50,
    participantsCount: 0,
    category: mockCategories[2],
    status: "upcoming",
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: "5",
    title: "Product Management Summit",
    startDate: new Date(2025, 8, 20).toISOString(),
    endDate: new Date(2025, 8, 22).toISOString(),
    location: "Seattle, WA",
    description: "Summit for product managers to share insights and strategies",
    isFeatured: true,
    capacity: 200,
    participantsCount: 0,
    category: mockCategories[1],
    status: "upcoming",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
  }
];

// Simple event-tag associations
export const eventTags: Record<string, string[]> = {
  "1": ["1", "5"],  // Tech Conference has Technology and Development tags
  "2": ["3"],      // Design Workshop has Design tag
  "3": ["2", "4"]  // Startup Networking has Business and Marketing tags
};

// Mock participants data (simplified)
export const mockParticipants = Array.from({ length: 10 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `Participant ${i + 1}`,
  email: `participant${i + 1}@example.com`,
  registeredAt: new Date(2025, 4, Math.floor(Math.random() * 30) + 1).toISOString()
}));

// Helper function to get event details
export const getEventDetails = (id: string): EventDetail | undefined => {
  const event = mockEvents.find(e => e.id === id);
  if (!event) return undefined;
  
  const eventTagIds = eventTags[id] || [];
  const tags = mockTags.filter(tag => eventTagIds.includes(tag.id));
  
  return {
    ...event,
    description: event.description || "",
    availableSeats: event.capacity - event.participantsCount,
    tags,
    organizer: {
      id: "admin",
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isRegistered: false
  };
};

// Helper function to get paginated events
export const getPaginatedEvents = (page: number = 1, limit: number = 10): EventsResponse => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedEvents = mockEvents.slice(startIndex, endIndex);
  
  return {
    events: paginatedEvents,
    pagination: {
      total: mockEvents.length,
      page,
      size: limit,
      totalPages: Math.ceil(mockEvents.length / limit),
      hasNext: endIndex < mockEvents.length,
      hasPrevious: page > 1
    }
  };
};

// Helper function to get paginated participants
export const getPaginatedParticipants = (_eventId: string, page: number = 1, limit: number = 10): ParticipantsResponse => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  // Convert simple participants to EventParticipant structure
  const eventParticipants = mockParticipants.map(p => ({
    id: p.id,
    user: {
      id: `u-${p.id}`,
      firstName: p.name.split(' ')[0],
      lastName: p.name.split(' ')[1] || 'User',
      email: p.email
    },
    status: 'registered' as const,
    registrationDate: p.registeredAt,
    checkedIn: false,
    ticketCode: `TICKET-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  }));
  
  const paginatedParticipants = eventParticipants.slice(startIndex, endIndex);
  
  return {
    data: paginatedParticipants,
    pagination: {
      total: mockParticipants.length,
      page,
      size: limit,
      totalPages: Math.ceil(mockParticipants.length / limit),
      hasNext: endIndex < mockParticipants.length,
      hasPrevious: page > 1
    },
    sort: {
      sortBy: "registrationDate",
      sortOrder: "desc"
    }
  };
};

// Helper function to create a new event (simplified)
export const createEvent = (eventData: any): EventSummary => {
  const newId = (mockEvents.length + 1).toString();
  const categoryId = eventData.categoryId || "1";
  const category = mockCategories.find(c => c.id === categoryId) || mockCategories[0];
  
  const newEvent: EventSummary = {
    id: newId,
    title: eventData.title,
    description: eventData.description || "",
    startDate: eventData.startDate,
    endDate: eventData.endDate,
    location: eventData.location || "",
    capacity: eventData.capacity || 100,
    participantsCount: 0,
    isFeatured: eventData.isFeatured || false,
    category,
    status: "upcoming",
    imageUrl: eventData.imageUrl || ""
  };
  
  mockEvents.push(newEvent);
  
  // Store tag associations if provided
  if (eventData.tagIds && eventData.tagIds.length > 0) {
    eventTags[newId] = [...eventData.tagIds];
  }
  
  return newEvent;
};

// Helper function to update an event (simplified)
export const updateEvent = (id: string, eventData: any): EventSummary | undefined => {
  const eventIndex = mockEvents.findIndex(e => e.id === id);
  if (eventIndex === -1) return undefined;
  
  const currentEvent = mockEvents[eventIndex];
  let category = currentEvent.category;
  
  // Update category if provided
  if (eventData.categoryId) {
    const newCategory = mockCategories.find(c => c.id === eventData.categoryId);
    if (newCategory) {
      category = newCategory;
    }
  }
  
  // Update the event
  const updatedEvent: EventSummary = {
    ...currentEvent,
    title: eventData.title || currentEvent.title,
    description: eventData.description || currentEvent.description,
    startDate: eventData.startDate || currentEvent.startDate,
    endDate: eventData.endDate || currentEvent.endDate,
    location: eventData.location || currentEvent.location,
    capacity: eventData.capacity || currentEvent.capacity,
    isFeatured: eventData.isFeatured !== undefined ? eventData.isFeatured : currentEvent.isFeatured,
    category,
    imageUrl: eventData.imageUrl || currentEvent.imageUrl
  };
  
  // Update the event in our mock data
  mockEvents[eventIndex] = updatedEvent;
  
  // Update tag associations if provided
  if (eventData.tagIds) {
    eventTags[id] = [...eventData.tagIds];
  }
  
  return updatedEvent;
};

// Helper function to delete an event (simplified)
export const deleteEvent = (id: string): boolean => {
  const eventIndex = mockEvents.findIndex(e => e.id === id);
  if (eventIndex === -1) return false;
  
  // Remove the event from our mock data
  mockEvents.splice(eventIndex, 1);
  
  // Remove tag associations
  delete eventTags[id];
  
  return true;
};
