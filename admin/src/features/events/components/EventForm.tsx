import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Import custom hooks
import { useCategories } from "../hooks/useCategories";
import { useTags } from "../hooks/useTags";
import { useEventForm, eventFormSchema } from "../hooks/useEventForm";
import type { EventFormValues } from "../hooks/useEventForm";

interface EventFormProps {
  eventId?: string;
  initialData?: Partial<EventFormValues>;
}

export function EventForm({ eventId, initialData }: EventFormProps) {
  // Use custom hooks
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { tags, selectedTags, toggleTag, setInitialTags, isLoading: tagsLoading } = useTags();
  const { isSubmitting, onSubmit } = useEventForm(eventId);
  
  // Initialize form with react-hook-form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      isFeatured: initialData?.isFeatured || false,
      tagIds: initialData?.tagIds || [],
      startDate: initialData?.startDate || new Date(),
      endDate: initialData?.endDate || new Date(new Date().setDate(new Date().getDate() + 1)),
      categoryId: initialData?.categoryId || "",
      capacity: initialData?.capacity,
      imageUrl: initialData?.imageUrl || ""
    }
  });

  // Set initial tags if available in initialData
  useEffect(() => {
    if (initialData?.tagIds) {
      setInitialTags(initialData.tagIds);
    }
  }, [initialData, setInitialTags]);
  
  // Check if any data is loading
  const isLoading = categoriesLoading || tagsLoading;
  
  // Handle form submission
  const handleSubmit = form.handleSubmit((data) => {
    // Ensure tagIds from selected tags are included in the form data
    const formData = {
      ...data,
      tagIds: selectedTags,
      // Make sure required fields are properly formatted
      categoryId: data.categoryId || "",
      isFeatured: data.isFeatured || false,
    };
    onSubmit(formData);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="text-sm text-muted-foreground mb-4">
          Fields marked with <span className="text-red-500">*</span> are required
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Title - Required */}
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Start Date - Required */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date <span className="text-red-500">*</span></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Date - Required */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date <span className="text-red-500">*</span></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description - Required */}
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Event description" 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Event location" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category - Required */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Capacity */}
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Event capacity"
                    {...field}
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : parseInt(value, 10));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Featured */}
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* Image URL */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="Image URL" {...field} value={field.value === undefined ? "" : field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tags */}
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="tagIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                    {tags.map((tag) => (
                      <div
                        key={tag.id}
                        className={`px-3 py-1 rounded-full cursor-pointer text-sm ${selectedTags.includes(tag.id) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                        onClick={() => {
                          toggleTag(tag.id);
                          // Update the form field value when tags are toggled
                          const newTagIds = selectedTags.includes(tag.id)
                            ? selectedTags.filter(id => id !== tag.id)
                            : [...selectedTags, tag.id];
                          field.onChange(newTagIds);
                        }}
                      >
                        {tag.name}
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : eventId ? "Update Event" : "Create Event"}
        </Button>
      </form>
    </Form>
  );
}
