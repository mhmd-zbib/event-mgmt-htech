import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TagForm } from "../../features/tags/components/TagForm";
import { tagsService } from "../../features/tags/services/tagsService";
import type { Tag } from "../../features/events/types/events";

export default function TagEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tag, setTag] = useState<Partial<Tag> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTag = async () => {
      if (!id) {
        navigate("/tags");
        return;
      }

      try {
        setLoading(true);
        const response = await tagsService.getTagById(id);
        const tagData = response.data;
        
        setTag({
          name: tagData.name,
          description: tagData.description
        });
      } catch (err) {
        console.error("Failed to fetch tag:", err);
        setError("Failed to load tag. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTag();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading tag...</p>
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

  return tag ? <TagForm tagId={id} initialData={tag} /> : null;
}
