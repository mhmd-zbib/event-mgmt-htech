import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { eventsService } from '../services/eventsService';
import type { CreateEventRequest, UpdateEventRequest } from '../types/events';
import { z } from 'zod';

// Form schema validation
export const eventFormSchema = z.object({
  // Required fields according to API spec
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required"),
  startDate: z.date({
    required_error: "Start date is required",
    invalid_type_error: "Start date must be a valid date",
  }),
  endDate: z.date({
    required_error: "End date is required",
    invalid_type_error: "End date must be a valid date",
  }),
  categoryId: z.string({
    required_error: "Category is required",
  }),
  
  // Optional fields according to API spec
  location: z.string().optional(),
  capacity: z.number().int().positive("Capacity must be a positive number").optional(),
  isFeatured: z.boolean().default(false),
  imageUrl: z.string().url("Image URL must be a valid URL").optional().nullable(),
  tagIds: z.array(z.string()).default([]),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export function useEventForm(eventId?: string) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Format the data for API submission
      const formattedData = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        // Required fields are already validated by the schema
        description: data.description,
        categoryId: data.categoryId,
        // Optional fields with proper handling
        location: data.location || undefined,
        capacity: data.capacity || undefined,
        isFeatured: data.isFeatured,
        imageUrl: data.imageUrl || undefined,
        tagIds: data.tagIds.length > 0 ? data.tagIds : undefined
      };

      if (eventId) {
        await eventsService.updateEvent(eventId, formattedData as UpdateEventRequest);
        toast.success("Event updated successfully");
      } else {
        await eventsService.createEvent(formattedData as CreateEventRequest);
        toast.success("Event created successfully");
      }
      
      // Navigate back to events list
      navigate("/events");
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    onSubmit
  };
}
