import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, BarChart, Users, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview, RegistrationStatusChart } from "@/features/analytics/components/DashboardOverview";
import { EventAnalyticsView } from "@/features/analytics/components/EventAnalytics";
import { UserAnalyticsView } from "@/features/analytics/components/UserAnalytics";

export function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <DashboardOverview />
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
        <RegistrationStatusChart />
      </div>
      
      <Tabs defaultValue="events" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="events">Event Analytics</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="events" className="space-y-4">
          <EventAnalyticsView />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <UserAnalyticsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}