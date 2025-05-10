import '../../../../core/api/api_client.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/models/paginated_response.dart';
import '../../domain/models/tag.dart';
import '../../domain/repositories/tag_repository.dart';

class TagRepositoryImpl implements TagRepository {
  final ApiClient _apiClient;

  TagRepositoryImpl(this._apiClient);

  @override
  Future<PaginatedResponse<Tag>> getTags({
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
      ApiConstants.tags,
      queryParameters: queryParams,
    );
    
    return PaginatedResponse<Tag>.fromJson(
      response,
      (json) => Tag.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<Tag> getTagById(String id) async {
    final response = await _apiClient.get('${ApiConstants.tagById}$id');
    return Tag.fromJson(response['tag']);
  }
}
