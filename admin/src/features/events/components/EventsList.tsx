import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Calendar, 
  MapPin, 
  Users,
  Filter,
  Star,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEvents } from "../hooks/useEvents";
import type { EventSummary, EventsFilterParams } from "../types/events";

export function EventsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterParams, setFilterParams] = useState<EventsFilterParams>({
    page: 1,
    size: 10,
    sortBy: "startDate",
    sortOrder: "ASC"
  });
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { events, loading, error, totalItems, totalPages, refresh } = useEvents(filterParams);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterParams(prev => ({
      ...prev,
      search: searchQuery,
      page: 1 // Reset to first page on new search
    }));
  };

  const handleViewEvent = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Determine status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'past':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleRefresh = () => {
    // Use the refresh function from the hook
    refresh();
  };

  const handlePageChange = (page: number) => {
    setFilterParams(prev => ({ ...prev, page }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">Events</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor your organization's events.
            </p>
          </div>
          <Button className="gap-2 shadow-sm hover:shadow transition-all">
            <Plus className="h-4 w-4" />
            <span>Create Event</span>
          </Button>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col gap-4 bg-muted/40 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search events..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className={`shrink-0 ${activeFilter ? 'bg-primary/10 border-primary/30 text-primary' : ''}`}
                onClick={() => setActiveFilter(activeFilter ? null : 'filter')}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <div className="flex border rounded-md overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`shrink-0 rounded-none ${viewMode === 'list' ? 'bg-primary/10 text-primary' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`shrink-0 rounded-none ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                </Button>
              </div>
            </div>
          </div>
          
          {activeFilter && (
            <div className="flex flex-wrap gap-3 pt-3 border-t mt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {['upcoming', 'ongoing', 'past', 'cancelled'].map(status => (
                    <Badge 
                      key={status}
                      variant="outline" 
                      className={`cursor-pointer ${filterParams.status === status ? 'bg-primary/10 border-primary/30 text-primary' : ''}`}
                      onClick={() => setFilterParams(prev => ({
                        ...prev,
                        status: prev.status === status ? undefined : status as any,
                        page: 1
                      }))}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      {filterParams.status === status && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 ml-1"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Sort By</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: 'startDate', label: 'Date' },
                    { value: 'title', label: 'Title' },
                    { value: 'participantsCount', label: 'Participants' }
                  ].map(sort => (
                    <Badge 
                      key={sort.value}
                      variant="outline" 
                      className={`cursor-pointer ${filterParams.sortBy === sort.value ? 'bg-primary/10 border-primary/30 text-primary' : ''}`}
                      onClick={() => setFilterParams(prev => ({
                        ...prev,
                        sortBy: sort.value,
                        page: 1
                      }))}
                    >
                      {sort.label}
                      {filterParams.sortBy === sort.value && (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className={`h-3 w-3 ml-1 ${filterParams.sortOrder === 'DESC' ? 'rotate-180' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilterParams(prev => ({
                              ...prev,
                              sortOrder: prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
                            }));
                          }}
                        >
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {(filterParams.status || filterParams.sortBy !== 'startDate' || filterParams.sortOrder !== 'ASC') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7 px-2 ml-auto self-end"
                  onClick={() => setFilterParams({
                    page: 1,
                    size: 10,
                    sortBy: "startDate",
                    sortOrder: "ASC"
                  })}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <p className="text-sm text-muted-foreground">Loading events...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-md border border-destructive/20 shadow-sm">
              <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-80" />
              <p className="font-medium text-lg mb-1">Error Loading Events</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <Button 
              variant="outline" 
              className="mt-6 gap-2 shadow-sm hover:shadow transition-all"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </Button>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-muted p-8 rounded-lg max-w-md border border-border shadow-sm">
              <Calendar className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-70" />
              <p className="font-medium text-lg mb-1">No events found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new event.</p>
              <Button className="mt-4 gap-2" size="sm">
                <Plus className="h-3 w-3" />
                <span>Create Event</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid grid-cols-1 gap-6'}>
            {events.map(event => (
              <Card 
                key={event.id} 
                className="overflow-hidden hover:shadow-md transition-all border-border/60 hover:border-primary/30 cursor-pointer group"
                onClick={() => handleViewEvent(event.id)}
              >
                <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'flex-col sm:flex-row'}`}>
                  {/* Event image (if available) */}
                  <div 
                    className={`${viewMode === 'grid' ? 'w-full' : 'sm:w-60'} h-48 bg-muted flex-shrink-0 relative overflow-hidden`}
                  >
                    {event.imageUrl ? (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
                        <Calendar className="h-12 w-12 text-primary opacity-70" />
                      </div>
                    )}
                    {event.isFeatured && (
                      <div className="absolute top-2 left-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>Featured</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Event details */}
                  <CardContent className={`flex-1 p-4 ${viewMode === 'grid' ? 'pt-5' : 'sm:p-6'}`}>
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">{event.title}</h3>
                            {event.category && (
                              <div className="text-xs text-muted-foreground mt-1 bg-muted inline-block px-2 py-0.5 rounded">
                                {event.category.name}
                              </div>
                            )}
                          </div>
                          <Badge 
                            className={getStatusBadgeColor(event.status || 'upcoming')}
                          >
                            {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Upcoming'}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                      
                      <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'grid-cols-1' : 'md:grid-cols-3'} gap-3 pt-3 border-t`}>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary/70" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary/70" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4 text-primary/70" />
                          <span>
                            {event.participantsCount} / {event.capacity}
                            {event.participantsCount >= event.capacity && (
                              <span className="ml-1 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">Full</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && events.length > 0 && (
          <div className="flex justify-between items-center mt-8 pt-4 border-t">
            <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
              Showing {events.length} of {totalItems || 0} events
              {totalPages > 1 && (
                <span className="ml-1">• Page {filterParams.page || 1} of {totalPages}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!filterParams.page || filterParams.page <= 1}
                onClick={() => setFilterParams(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                className="gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="m15 18-6-6 6-6"/></svg>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!filterParams.page || filterParams.page >= totalPages}
                onClick={() => setFilterParams(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                className="gap-1"
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="m9 18 6-6-6-6"/></svg>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
