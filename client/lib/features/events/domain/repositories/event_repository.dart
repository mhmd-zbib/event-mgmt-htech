import '../../../../core/models/paginated_response.dart';
import '../models/event.dart';
import '../models/event_requests.dart';
import '../../../tags/domain/models/tag.dart';

abstract class EventRepository {
  Future<PaginatedResponse<EventSummary>> getEvents(EventFilterParams params);
  Future<EventDetail> getEventById(String id);
  Future<EventDetail> createEvent(CreateEventRequest request);
  Future<EventDetail> updateEvent(String id, UpdateEventRequest request);
  Future<void> deleteEvent(String id);
  Future<List<Tag>> getEventTags(String id);
  Future<List<Tag>> addTagsToEvent(String id, EventTagsRequest request);
  Future<void> removeTagsFromEvent(String id, List<String> tagIds);
  Future<List<EventSummary>> getFeaturedEvents();
  Future<List<EventSummary>> getUpcomingEvents({int? limit, String? categoryId});
}
