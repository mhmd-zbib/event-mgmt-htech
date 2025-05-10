import { Suspense } from "react";
import { EventDetail } from "@/features/events/components/EventDetail";

export default function EventDetailPage() {
  return (
    <Suspense fallback={<div>Loading event details...</div>}>
      <EventDetail />
    </Suspense>
  );
}