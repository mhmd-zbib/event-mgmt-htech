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

import { categoriesService } from "../services/categoriesService";
import type { Category } from "../../events/types/events";

// Form schema validation
const categoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  description: z.string().optional(),
});

type CategoryFormProps = {
  categoryId?: string;
  initialData?: Partial<Category>;
};

export function CategoryForm({ categoryId, initialData }: CategoryFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!categoryId;

  // Initialize form with default values or existing category data
  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: initialData ? {
      ...initialData,
    } : {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof categoryFormSchema>) => {
    setLoading(true);
    
    try {
      if (isEditMode) {
        await categoriesService.updateCategory(categoryId, data);
        toast.success("Category updated successfully");
      } else {
        await categoriesService.createCategory(data);
        toast.success("Category created successfully");
      }
      
      // Navigate back to categories list
      navigate('/categories');
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category. Please try again.");
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
              onClick={() => navigate('/categories')}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Categories</span>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              {isEditMode ? 'Edit Category' : 'Create New Category'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode 
                ? 'Update the details of your category'
                : 'Fill in the details to create a new category'}
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
                        <FormLabel>Category Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter category name" {...field} />
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
                            placeholder="Enter category description" 
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
                onClick={() => navigate('/categories')}
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
                    {isEditMode ? 'Update Category' : 'Create Category'}
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
