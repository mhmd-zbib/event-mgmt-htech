import 'package:equatable/equatable.dart';
import '../../domain/models/event_requests.dart';

abstract class EventsEvent extends Equatable {
  const EventsEvent();

  @override
  List<Object?> get props => [];
}

class LoadEvents extends EventsEvent {
  final EventFilterParams params;

  const LoadEvents(this.params);

  @override
  List<Object> get props => [params];
}

class LoadEventById extends EventsEvent {
  final String id;

  const LoadEventById(this.id);

  @override
  List<Object> get props => [id];
}

class CreateEvent extends EventsEvent {
  final CreateEventRequest request;

  const CreateEvent(this.request);

  @override
  List<Object> get props => [request];
}

class UpdateEvent extends EventsEvent {
  final String id;
  final UpdateEventRequest request;

  const UpdateEvent(this.id, this.request);

  @override
  List<Object> get props => [id, request];
}

class DeleteEvent extends EventsEvent {
  final String id;

  const DeleteEvent(this.id);

  @override
  List<Object> get props => [id];
}

class LoadEventTags extends EventsEvent {
  final String eventId;

  const LoadEventTags(this.eventId);

  @override
  List<Object> get props => [eventId];
}

class AddTagsToEvent extends EventsEvent {
  final String eventId;
  final List<String> tagIds;

  const AddTagsToEvent(this.eventId, this.tagIds);

  @override
  List<Object> get props => [eventId, tagIds];
}

class RemoveTagsFromEvent extends EventsEvent {
  final String eventId;
  final List<String> tagIds;

  const RemoveTagsFromEvent(this.eventId, this.tagIds);

  @override
  List<Object> get props => [eventId, tagIds];
}

class LoadFeaturedEvents extends EventsEvent {
  const LoadFeaturedEvents();
}

class LoadUpcomingEvents extends EventsEvent {
  final int? limit;
  final String? categoryId;

  const LoadUpcomingEvents({this.limit, this.categoryId});

  @override
  List<Object?> get props => [limit, categoryId];
}
