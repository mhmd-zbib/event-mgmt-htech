import '../../../../core/api/api_client.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/models/paginated_response.dart';
import '../../../tags/domain/models/tag.dart';
import '../../domain/models/event.dart';
import '../../domain/models/event_requests.dart';
import '../../domain/repositories/event_repository.dart';

class EventRepositoryImpl implements EventRepository {
  final ApiClient _apiClient;

  EventRepositoryImpl(this._apiClient);

  @override
  Future<PaginatedResponse<EventSummary>> getEvents(EventFilterParams params) async {
    final response = await _apiClient.get(
      ApiConstants.events,
      queryParameters: params.toQueryParameters(),
    );
    
    return PaginatedResponse<EventSummary>.fromJson(
      response,
      (json) => EventSummary.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<EventDetail> getEventById(String id) async {
    final response = await _apiClient.get('${ApiConstants.eventById}$id');
    return EventDetail.fromJson(response['event']);
  }

  @override
  Future<EventDetail> createEvent(CreateEventRequest request) async {
    final response = await _apiClient.post(
      ApiConstants.events,
      data: request.toJson(),
    );
    return EventDetail.fromJson(response['event']);
  }

  @override
  Future<EventDetail> updateEvent(String id, UpdateEventRequest request) async {
    final response = await _apiClient.put(
      '${ApiConstants.eventById}$id',
      data: request.toJson(),
    );
    return EventDetail.fromJson(response['event']);
  }

  @override
  Future<void> deleteEvent(String id) async {
    await _apiClient.delete('${ApiConstants.eventById}$id');
  }

  @override
  Future<List<Tag>> getEventTags(String id) async {
    final response = await _apiClient.get('${ApiConstants.eventTags}$id/tags');
    final List<dynamic> tagsList = response['tags'];
    return tagsList.map((json) => Tag.fromJson(json)).toList();
  }

  @override
  Future<List<Tag>> addTagsToEvent(String id, EventTagsRequest request) async {
    final response = await _apiClient.post(
      '${ApiConstants.eventTags}$id/tags',
      data: request.toJson(),
    );
    final List<dynamic> tagsList = response['tags'];
    return tagsList.map((json) => Tag.fromJson(json)).toList();
  }

  @override
  Future<void> removeTagsFromEvent(String id, List<String> tagIds) async {
    final tagsString = tagIds.join(',');
    await _apiClient.delete(
      '${ApiConstants.eventTags}$id/tags',
      queryParameters: {'tagIds': tagsString},
    );
  }

  @override
  Future<List<EventSummary>> getFeaturedEvents() async {
    final response = await _apiClient.get(ApiConstants.featuredEvents);
    final List<dynamic> eventsList = response['events'];
    return eventsList.map((json) => EventSummary.fromJson(json)).toList();
  }

  @override
  Future<List<EventSummary>> getUpcomingEvents({int? limit, String? categoryId}) async {
    final Map<String, dynamic> queryParams = {};
    if (limit != null) queryParams['limit'] = limit.toString();
    if (categoryId != null) queryParams['categoryId'] = categoryId;
    
    final response = await _apiClient.get(
      ApiConstants.upcomingEvents,
      queryParameters: queryParams,
    );
    
    final List<dynamic> eventsList = response['events'];
    return eventsList.map((json) => EventSummary.fromJson(json)).toList();
  }
}
