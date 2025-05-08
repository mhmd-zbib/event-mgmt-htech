import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Calendar, Users, TagIcon, PieChart, Loader2 } from "lucide-react";
import { useDashboardOverview } from "../hooks/useAnalytics";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DashboardOverview as DashboardOverviewType } from "../types/analytics";

export function DashboardOverview() {
  const { data, loading, error } = useDashboardOverview();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load analytics: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertDescription>No analytics data available.</AlertDescription>
      </Alert>
    );
  }

  const { counts, registrationStatusCounts } = data;

  const statCards = [
    {
      title: "Total Events",
      value: counts.totalEvents,
      icon: Calendar,
      info: `${counts.upcomingEvents} upcoming, ${counts.ongoingEvents} ongoing`,
    },
    {
      title: "Total Users",
      value: counts.totalUsers,
      icon: Users,
      info: "",
    },
    {
      title: "Participations",
      value: counts.totalParticipants,
      icon: BarChart,
      info: `${registrationStatusCounts.attended} attended`,
    },
    {
      title: "Categories",
      value: counts.totalCategories,
      icon: TagIcon,
      info: "",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            {stat.info && <p className="text-xs text-muted-foreground">{stat.info}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type RegistrationStatusCountsProps = {
  registered: number;
  attended: number;
  cancelled: number;
  waitlisted: number;
};

export function RegistrationStatusChart() {
  const { data, loading, error } = useDashboardOverview();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const { registrationStatusCounts } = data;
  const statuses = [
    { name: "Registered", value: registrationStatusCounts.registered, color: "bg-blue-500" },
    { name: "Attended", value: registrationStatusCounts.attended, color: "bg-green-500" },
    { name: "Cancelled", value: registrationStatusCounts.cancelled, color: "bg-red-500" },
    { name: "Waitlisted", value: registrationStatusCounts.waitlisted, color: "bg-amber-500" },
  ];

  const total = Object.values(registrationStatusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Status</CardTitle>
        <CardDescription>Distribution of participant registrations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statuses.map((status) => (
            <div key={status.name} className="flex items-center">
              <div className="w-full">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{status.name}</span>
                  <span className="text-sm font-medium">
                    {status.value} ({total > 0 ? Math.round((status.value / total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${status.color} h-2 rounded-full`} 
                    style={{ width: `${total > 0 ? (status.value / total) * 100 : 0}%` }}
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