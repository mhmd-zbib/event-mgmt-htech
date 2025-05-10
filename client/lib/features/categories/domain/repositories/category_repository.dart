import '../../../../core/models/paginated_response.dart';
import '../models/category.dart';

abstract class CategoryRepository {
  Future<PaginatedResponse<CategorySummary>> getCategories({
    int? page,
    int? size,
    String? sortBy,
    String? sortOrder,
    String? search,
  });
  
  Future<CategoryDetail> getCategoryById(String id);
}
