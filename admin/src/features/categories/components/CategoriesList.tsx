import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  Folder
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
import { toast } from "@/components/ui/use-toast";

import { categoriesService } from "../services/categoriesService";
import type { Category } from "../../events/types/events";

export function CategoriesList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCategories(filtered);
    }
  }, [categories, searchQuery]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesService.getCategories();
      setCategories(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to load categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  const handleCreateCategory = () => {
    navigate('/categories/create');
  };

  const handleEditCategory = (categoryId: string) => {
    navigate(`/categories/${categoryId}/edit`);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      await categoriesService.deleteCategory(categoryToDelete.id);
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
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
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">Categories</h1>
            <p className="text-muted-foreground mt-1">
              Manage event categories for better organization
            </p>
          </div>
          <Button 
            className="gap-2 shadow-sm hover:shadow transition-all"
            onClick={handleCreateCategory}
          >
            <Plus className="h-4 w-4" />
            <span>Create Category</span>
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-4 bg-muted/40 p-4 rounded-lg">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
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
            <span className="ml-2">Loading categories...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center p-8 text-destructive gap-2">
            <AlertCircle className="h-6 w-6" />
            <span>{error}</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Folder className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No categories found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery 
                  ? "No categories match your search criteria" 
                  : "Create your first category to get started"}
              </p>
              <Button 
                className="mt-4 gap-2"
                onClick={handleCreateCategory}
              >
                <Plus className="h-4 w-4" />
                Create Category
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
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {category.description || "-"}
                      </TableCell>
                      <TableCell>{formatDate(category.createdAt)}</TableCell>
                      <TableCell>
                        {category.creator ? 
                          `${category.creator.firstName} ${category.creator.lastName}` : 
                          "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCategory(category.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/90"
                            onClick={() => handleDeleteClick(category)}
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
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.name}"? 
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
