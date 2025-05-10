import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  Tag
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

import { tagsService } from "../services/tagsService";
import type { Tag as TagType } from "../../events/types/events";

export function TagsList() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTags, setFilteredTags] = useState<TagType[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<TagType | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (tags.length > 0) {
      const filtered = tags.filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tag.description && tag.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredTags(filtered);
    }
  }, [tags, searchQuery]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await tagsService.getTags();
      setTags(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch tags:", err);
      setError("Failed to load tags. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  const handleCreateTag = () => {
    navigate('/tags/create');
  };

  const handleEditTag = (tagId: string) => {
    navigate(`/tags/${tagId}/edit`);
  };

  const handleDeleteClick = (tag: TagType) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!tagToDelete) return;
    
    try {
      await tagsService.deleteTag(tagToDelete.id);
      setTags(prev => prev.filter(t => t.id !== tagToDelete.id));
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting tag:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete tag",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">Tags</h1>
            <p className="text-muted-foreground mt-1">
              Manage event tags for better organization and filtering
            </p>
          </div>
          <Button 
            className="gap-2 shadow-sm hover:shadow transition-all"
            onClick={handleCreateTag}
          >
            <Plus className="h-4 w-4" />
            <span>Create Tag</span>
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-4 bg-muted/40 p-4 rounded-lg">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="secondary">Search</Button>
          </form>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading tags...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center p-8 text-destructive gap-2">
            <AlertCircle className="h-6 w-6" />
            <span>{error}</span>
          </div>
        ) : filteredTags.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No tags found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery 
                  ? "No tags match your search criteria" 
                  : "Create your first tag to get started"}
              </p>
              <Button 
                className="mt-4 gap-2"
                onClick={handleCreateTag}
              >
                <Plus className="h-4 w-4" />
                Create Tag
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-medium px-2 py-1">
                          {tag.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {tag.description || "-"}
                      </TableCell>
                      <TableCell>{formatDate(tag.createdAt)}</TableCell>
                      <TableCell>
                        {tag.creator ? 
                          `${tag.creator.firstName} ${tag.creator.lastName}` : 
                          "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTag(tag.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/90"
                            onClick={() => handleDeleteClick(tag)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the tag "{tagToDelete?.name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
