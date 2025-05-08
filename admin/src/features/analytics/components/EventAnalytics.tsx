import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Info } from "lucide-react";
import { useEventAnalytics } from "../hooks/useAnalytics";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { EventAnalytics } from "../types/analytics";

// Define typed props for each chart component
type CategoryItemProps = {
  categoryId: string;
  eventCount: number;
  category: {
    name: string;
  };
};

type EventItemProps = {
  id: string;
  title: string;
  participantCount: number;
};

type TrendItemProps = {
  month: string;
  count: number;
};

export function EventAnalyticsView() {
  const { data, loading, error } = useEventAnalytics();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading event analytics...</span>
      </div>
    );
  }

  // Even if there's an error, we'll still display the component with empty data
  // We'll just show an alert about the error
  if (error) {
    return (
      <div className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            There was an issue loading event analytics. Showing demo data instead.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <EmptyEventsByCategory />
          <EmptyTopEventsByParticipants />
          <EmptyEventCreationTrends />
        </div>
      </div>
    );
  }

  if (!data || 
      (data.eventsByCategory.length === 0 && 
       data.topEventsByParticipants.length === 0 && 
       data.eventCreationTrends.length === 0)) {
    return (
      <div className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No event analytics data available yet. As events are created and attended, analytics will appear here.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <EmptyEventsByCategory />
          <EmptyTopEventsByParticipants />
          <EmptyEventCreationTrends />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      {data.eventsByCategory.length > 0 ? (
        <EventsByCategory data={data.eventsByCategory} />
      ) : (
        <EmptyEventsByCategory />
      )}
      
      {data.topEventsByParticipants.length > 0 ? (
        <TopEventsByParticipants data={data.topEventsByParticipants} />
      ) : (
        <EmptyTopEventsByParticipants />
      )}
      
      {data.eventCreationTrends.length > 0 ? (
        <EventCreationTrends data={data.eventCreationTrends} />
      ) : (
        <EmptyEventCreationTrends />
      )}
    </div>
  );
}

// Empty state components
function EmptyEventsByCategory() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Events by Category</CardTitle>
        <CardDescription>Distribution of events across categories</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-48">
        <p className="text-muted-foreground text-center">No category data available yet</p>
      </CardContent>
    </Card>
  );
}

function EmptyTopEventsByParticipants() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Top Events by Participants</CardTitle>
        <CardDescription>Events with highest participation</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-48">
        <p className="text-muted-foreground text-center">No event participation data available yet</p>
      </CardContent>
    </Card>
  );
}

function EmptyEventCreationTrends() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Event Creation Trends</CardTitle>
        <CardDescription>Number of events created per month</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-48">
        <p className="text-muted-foreground text-center">No event creation trends available yet</p>
      </CardContent>
    </Card>
  );
}

// Original components
function EventsByCategory({ data }: { data: CategoryItemProps[] }) {
  if (data.length === 0) {
    return <EmptyEventsByCategory />;
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Events by Category</CardTitle>
        <CardDescription>Distribution of events across categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-full">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.category.name}</span>
                  <span className="text-sm font-medium">{item.eventCount} events</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${(item.eventCount / Math.max(...data.map(d => d.eventCount))) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TopEventsByParticipants({ data }: { data: EventItemProps[] }) {
  if (data.length === 0) {
    return <EmptyTopEventsByParticipants />;
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Top Events by Participants</CardTitle>
        <CardDescription>Events with highest participation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((event, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{event.title}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${(event.participantCount / Math.max(...data.map(d => d.participantCount))) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-sm font-medium">{event.participantCount} participants</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EventCreationTrends({ data }: { data: TrendItemProps[] }) {
  if (data.length === 0) {
    return <EmptyEventCreationTrends />;
  }

  // Sort data by month
  const sortedData = [...data].sort((a, b) => new Date(a.month) - new Date(b.month));
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Event Creation Trends</CardTitle>
        <CardDescription>Number of events created per month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between">
          {sortedData.map((item, index) => {
            const maxCount = Math.max(...sortedData.map(d => d.count));
            const heightPercentage = (item.count / maxCount) * 100;
            const date = new Date(item.month + "-01");
            const monthName = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            
            return (
              <div key={index} className="flex flex-col items-center">
                <div className="relative flex-1 w-14 mx-1">
                  <div 
                    className="absolute bottom-0 w-full bg-blue-500 rounded-t-md"
                    style={{ height: `${heightPercentage}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {monthName} {year}
                </div>
                <div className="text-sm font-medium">{item.count}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}