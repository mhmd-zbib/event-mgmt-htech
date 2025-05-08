import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Info } from "lucide-react";
import { useUserAnalytics } from "../hooks/useAnalytics";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UserAnalytics } from "../types/analytics";

// Define typed props for each chart component
type ActiveUserProps = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  eventCount: number;
};

type RegistrationTrendProps = {
  month: string;
  count: number;
};

export function UserAnalyticsView() {
  const { data, loading, error } = useUserAnalytics();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading user analytics...</span>
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
            There was an issue loading user analytics. Showing demo data instead.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <EmptyMostActiveUsers />
          <EmptyUserRegistrationTrends />
        </div>
      </div>
    );
  }

  if (!data || 
      (data.mostActiveUsers.length === 0 && 
       data.userRegistrationTrends.length === 0)) {
    return (
      <div className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No user analytics data available yet. As users sign up and participate in events, analytics will appear here.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <EmptyMostActiveUsers />
          <EmptyUserRegistrationTrends />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      {data.mostActiveUsers.length > 0 ? (
        <MostActiveUsers data={data.mostActiveUsers} />
      ) : (
        <EmptyMostActiveUsers />
      )}
      
      {data.userRegistrationTrends.length > 0 ? (
        <UserRegistrationTrends data={data.userRegistrationTrends} />
      ) : (
        <EmptyUserRegistrationTrends />
      )}
    </div>
  );
}

// Empty state components
function EmptyMostActiveUsers() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Most Active Users</CardTitle>
        <CardDescription>Users with highest participation in events</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-48">
        <p className="text-muted-foreground text-center">No active user data available yet</p>
      </CardContent>
    </Card>
  );
}

function EmptyUserRegistrationTrends() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>User Registration Trends</CardTitle>
        <CardDescription>Number of users registered per month</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-48">
        <p className="text-muted-foreground text-center">No registration trends available yet</p>
      </CardContent>
    </Card>
  );
}

// Original components
function MostActiveUsers({ data }: { data: ActiveUserProps[] }) {
  if (data.length === 0) {
    return <EmptyMostActiveUsers />;
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Most Active Users</CardTitle>
        <CardDescription>Users with highest participation in events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((user, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ 
                      width: `${(user.eventCount / Math.max(...data.map(d => d.eventCount))) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-sm font-medium">{user.eventCount} events</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UserRegistrationTrends({ data }: { data: RegistrationTrendProps[] }) {
  if (data.length === 0) {
    return <EmptyUserRegistrationTrends />;
  }

  // Sort data by month
  const sortedData = [...data].sort((a, b) => new Date(a.month) - new Date(b.month));
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>User Registration Trends</CardTitle>
        <CardDescription>Number of users registered per month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between px-2">
          {sortedData.map((item, index) => {
            const maxCount = Math.max(...sortedData.map(d => d.count));
            const heightPercentage = (item.count / maxCount) * 100;
            const date = new Date(item.month + "-01");
            const monthName = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            
            return (
              <div key={index} className="flex flex-col items-center group">
                <div className="relative flex-1 w-12 mx-1">
                  <div 
                    className="absolute bottom-0 w-full bg-purple-500 rounded-t-md group-hover:bg-purple-600 transition-colors"
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