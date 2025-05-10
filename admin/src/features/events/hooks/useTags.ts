import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export type Tag = {
  id: string;
  name: string;
};

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be a service call
        // const tagsData = await tagsService.getTags();
        
        // Mock data for now
        const tagsData = [
          { id: "1", name: "Technology" },
          { id: "2", name: "Business" },
          { id: "3", name: "Design" },
          { id: "4", name: "Marketing" },
          { id: "5", name: "Development" },
        ];
        
        setTags(tagsData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch tags');
        setError(error);
        toast.error('Failed to load tags');
        console.error('Error fetching tags:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const setInitialTags = (initialTags: string[]) => {
    setSelectedTags(initialTags);
  };

  return { 
    tags, 
    selectedTags, 
    isLoading, 
    error, 
    toggleTag,
    setInitialTags
  };
}
