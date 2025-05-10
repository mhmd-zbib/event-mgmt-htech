import '../../../../core/models/paginated_response.dart';
import '../models/tag.dart';

abstract class TagRepository {
  Future<PaginatedResponse<Tag>> getTags({
    int? page,
    int? size,
    String? sortBy,
    String? sortOrder,
    String? search,
  });
  
  Future<Tag> getTagById(String id);
}
