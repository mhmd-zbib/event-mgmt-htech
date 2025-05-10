import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

import { tagsService } from "../services/tagsService";
import type { Tag } from "../../events/types/events";

// Form schema validation
const tagFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  description: z.string().optional(),
});

type TagFormProps = {
  tagId?: string;
  initialData?: Partial<Tag>;
};

export function TagForm({ tagId, initialData }: TagFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!tagId;

  // Initialize form with default values or existing tag data
  const form = useForm<z.infer<typeof tagFormSchema>>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: initialData ? {
      ...initialData,
    } : {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof tagFormSchema>) => {
    setLoading(true);
    
    try {
      if (isEditMode) {
        await tagsService.updateTag(tagId, data);
        toast.success("Tag updated successfully");
      } else {
        await tagsService.createTag(data);
        toast.success("Tag created successfully");
      }
      
      // Navigate back to tags list
      navigate('/tags');
    } catch (error) {
      console.error("Error saving tag:", error);
      toast.error("Failed to save tag. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <Button 
              variant="ghost" 
              className="flex items-center gap-1 w-fit mb-2" 
              onClick={() => navigate('/tags')}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Tags</span>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              {isEditMode ? 'Edit Tag' : 'Create New Tag'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode 
                ? 'Update the details of your tag'
                : 'Fill in the details to create a new tag'}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tag Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter tag name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter tag description" 
                            className="min-h-24"
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tags')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditMode ? 'Update Tag' : 'Create Tag'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
