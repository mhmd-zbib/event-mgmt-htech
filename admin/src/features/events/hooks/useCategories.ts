import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type Category = {
  id: string;
  name: string;
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be a service call
        // const categoriesData = await categoriesService.getCategories();
        
        // Mock data for now
        const categoriesData = [
          { id: "1", name: "Conference" },
          { id: "2", name: "Workshop" },
          { id: "3", name: "Seminar" },
          { id: "4", name: "Networking" },
        ];
        
        setCategories(categoriesData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch categories');
        setError(error);
        toast.error('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}
