import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { eventsService } from "../services/eventsService";
import { useTags } from "../hooks/useTags";
import type { Tag } from "../types/events";

interface EventTagsProps {
  eventId: string;
  initialTags?: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
}

export function EventTags({ eventId, initialTags = [], onTagsChange }: EventTagsProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { tags: availableTags, loading: tagsLoading } = useTags();

  // Fetch tags if not provided initially
  useEffect(() => {
    if (initialTags.length === 0) {
      fetchEventTags();
    }
  }, [eventId, initialTags.length]);

  const fetchEventTags = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedTags = await eventsService.getEventTags(eventId);
      setTags(fetchedTags);
      if (onTagsChange) {
        onTagsChange(fetchedTags);
      }
    } catch (err) {
      console.error("Failed to fetch event tags:", err);
      setError("Could not load tags. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!selectedTagId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedTags = await eventsService.addEventTags(eventId, [selectedTagId]);
      setTags(updatedTags);
      if (onTagsChange) {
        onTagsChange(updatedTags);
      }
      setSelectedTagId("");
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Failed to add tag:", err);
      setError("Could not add tag. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await eventsService.removeEventTags(eventId, [tagId]);
      const updatedTags = tags.filter(tag => tag.id !== tagId);
      setTags(updatedTags);
      if (onTagsChange) {
        onTagsChange(updatedTags);
      }
    } catch (err) {
      console.error("Failed to remove tag:", err);
      setError("Could not remove tag. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter out tags that are already added to the event
  const getAvailableTags = () => {
    const currentTagIds = new Set(tags.map(tag => tag.id));
    return availableTags.filter(tag => !currentTagIds.has(tag.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Tags</h3>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tag to Event</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Select 
                value={selectedTagId} 
                onValueChange={setSelectedTagId}
                disabled={tagsLoading || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableTags().map(tag => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: tag.color || '#e5e7eb' }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddTag} 
                  disabled={!selectedTagId || loading}
                >
                  Add Tag
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {loading && tags.length === 0 ? (
          <div className="text-sm text-muted-foreground">Loading tags...</div>
        ) : tags.length === 0 ? (
          <div className="text-sm text-muted-foreground">No tags added yet</div>
        ) : (
          tags.map(tag => (
            <Badge 
              key={tag.id} 
              variant="outline" 
              className="flex items-center gap-1 pr-1"
              style={{ backgroundColor: tag.color || '#e5e7eb' }}
            >
              {tag.name}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 rounded-full hover:bg-muted/60"
                onClick={() => handleRemoveTag(tag.id)}
                disabled={loading}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
