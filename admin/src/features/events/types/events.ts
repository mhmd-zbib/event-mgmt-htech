// Types based on the Events API spec

// Form data types for components
export interface EventFormData {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  categoryId?: string;
  location?: string;
  capacity?: number;
  isFeatured?: boolean;
  imageUrl?: string;
  tagIds?: string[];
}
export interface Pagination {
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Sort {
  sortBy: string;
  sortOrder: string;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface EventOrganizer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface UserParticipation {
  id: string;
  status: 'registered' | 'attended' | 'cancelled' | 'waitlisted';
  registrationDate: string;
  checkedIn: boolean;
}

export interface EventParticipant {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'registered' | 'attended' | 'cancelled' | 'waitlisted';
  registrationDate: string;
  checkedIn: boolean;
  checkedInAt?: string;
  ticketCode: string;
}

export interface EventsFilterParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
  search?: string;
  categoryId?: string;
  tags?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  status?: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
}

export interface EventSummary {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  participantsCount: number;
  isFeatured: boolean;
  imageUrl?: string;
  category: Category;
  createdAt?: string;
  createdBy?: string;
  status: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
  availableSeats?: number;
}

export interface EventDetail extends EventSummary {
  description: string;
  availableSeats: number;
  organizer: EventOrganizer;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  isRegistered: boolean;
  userParticipation?: UserParticipation;
}

export interface EventsResponse {
  // Support different API response formats
  data?: EventSummary[];
  items?: EventSummary[];
  events?: EventSummary[];
  pagination?: Pagination;
  sort?: Sort;
  // Total count might be included directly
  total?: number;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  categoryId: string;
  location?: string;
  capacity?: number;
  isFeatured?: boolean;
  imageUrl?: string;
  tagIds?: string[];
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  location?: string;
  capacity?: number;
  isFeatured?: boolean;
  imageUrl?: string;
  tagIds?: string[];
}

export interface ParticipantsFilterParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
  status?: 'registered' | 'attended' | 'cancelled' | 'waitlisted';
}

export interface ParticipantsResponse {
  data: EventParticipant[];
  pagination: Pagination;
  sort: Sort;
}