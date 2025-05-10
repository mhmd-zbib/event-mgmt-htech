import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CategoryForm } from "../../features/categories/components/CategoryForm";
import { categoriesService } from "../../features/categories/services/categoriesService";
import type { Category } from "../../features/events/types/events";

export default function CategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Partial<Category> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) {
        navigate("/categories");
        return;
      }

      try {
        setLoading(true);
        const response = await categoriesService.getCategoryById(id);
        const categoryData = response.data;
        
        setCategory({
          name: categoryData.name,
          description: categoryData.description
        });
      } catch (err) {
        console.error("Failed to fetch category:", err);
        setError("Failed to load category. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return category ? <CategoryForm categoryId={id} initialData={category} /> : null;
}
