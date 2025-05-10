import '../../../../core/api/api_client.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/models/paginated_response.dart';
import '../../domain/models/category.dart';
import '../../domain/repositories/category_repository.dart';

class CategoryRepositoryImpl implements CategoryRepository {
  final ApiClient _apiClient;

  CategoryRepositoryImpl(this._apiClient);

  @override
  Future<PaginatedResponse<CategorySummary>> getCategories({
    int? page,
    int? size,
    String? sortBy,
    String? sortOrder,
    String? search,
  }) async {
    final Map<String, dynamic> queryParams = {};
    if (page != null) queryParams['page'] = page.toString();
    if (size != null) queryParams['size'] = size.toString();
    if (sortBy != null) queryParams['sortBy'] = sortBy;
    if (sortOrder != null) queryParams['sortOrder'] = sortOrder;
    if (search != null) queryParams['search'] = search;

    final response = await _apiClient.get(
      ApiConstants.categories,
      queryParameters: queryParams,
    );
    
    return PaginatedResponse<CategorySummary>.fromJson(
      response,
      (json) => CategorySummary.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<CategoryDetail> getCategoryById(String id) async {
    final response = await _apiClient.get('${ApiConstants.categoryById}$id');
    return CategoryDetail.fromJson(response['category']);
  }
}
