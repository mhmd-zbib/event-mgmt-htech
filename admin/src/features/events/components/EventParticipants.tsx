import { useState, useEffect } from "react";
import { 
  Check, 
  X, 
  ArrowUpDown, 
  Search, 
  RefreshCw,
  UserPlus,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventsService } from "../services/eventsService";
import type { EventParticipant, ParticipantsFilterParams } from "../types/events";

interface EventParticipantsProps {
  eventId: string;
}

export function EventParticipants({ eventId }: EventParticipantsProps) {
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterParams, setFilterParams] = useState<ParticipantsFilterParams>({
    page: 1,
    size: 10,
    sortBy: "registrationDate",
    sortOrder: "DESC"
  });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchParticipants();
  }, [eventId, filterParams]);

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Add status filter if selected
      const params = { ...filterParams };
      if (statusFilter) {
        params.status = statusFilter as any;
      }
      
      const response = await eventsService.getEventParticipants(eventId, params);
      setParticipants(response.data);
      
      if (response.pagination) {
        setTotalItems(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch participants:", err);
      setError("Could not load participants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    setFilterParams(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === "ASC" ? "DESC" : "ASC"
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when searching
    setFilterParams(prev => ({
      ...prev,
      page: 1
    }));
    // Implement search functionality when API supports it
    // For now, we'll just filter the current results client-side
    fetchParticipants();
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setFilterParams(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilterParams(prev => ({
      ...prev,
      page
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'attended':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'waitlisted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search participants..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="registered">Registered</SelectItem>
              <SelectItem value="attended">Attended</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="waitlisted">Waitlisted</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchParticipants()} 
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {!loading && `Showing ${participants.length} of ${totalItems} participants`}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <UserPlus className="h-4 w-4" />
            Add Participant
          </Button>
          
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("lastName")}
                  className="flex items-center gap-1 font-medium"
                >
                  Name
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("email")}
                  className="flex items-center gap-1 font-medium"
                >
                  Email
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-1 font-medium"
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("registrationDate")}
                  className="flex items-center gap-1 font-medium"
                >
                  Registration Date
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <span className="font-medium">Check-in</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Loading participants...
                  </div>
                </TableCell>
              </TableRow>
            ) : participants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-sm text-muted-foreground">
                    No participants found
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">
                    {participant.user.firstName} {participant.user.lastName}
                  </TableCell>
                  <TableCell>{participant.user.email}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(participant.status)}>
                      {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(participant.registrationDate)}
                  </TableCell>
                  <TableCell>
                    {participant.checkedIn ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Page {filterParams.page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filterParams.page <= 1 || loading}
              onClick={() => handlePageChange(filterParams.page! - 1)}
              className="gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="m15 18-6-6 6-6"/></svg>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filterParams.page >= totalPages || loading}
              onClick={() => handlePageChange(filterParams.page! + 1)}
              className="gap-1"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="m9 18 6-6-6-6"/></svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
