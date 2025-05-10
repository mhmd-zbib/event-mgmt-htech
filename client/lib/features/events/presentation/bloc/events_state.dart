import 'package:equatable/equatable.dart';
import '../../../../core/models/paginated_response.dart';
import '../../domain/models/event.dart';
import '../../../tags/domain/models/tag.dart';

enum EventsStatus {
  initial,
  loading,
  loaded,
  error,
}

class EventsState extends Equatable {
  final EventsStatus status;
  final PaginatedResponse<EventSummary>? events;
  final EventDetail? selectedEvent;
  final List<EventSummary>? featuredEvents;
  final List<EventSummary>? upcomingEvents;
  final List<Tag>? eventTags;
  final String? errorMessage;

  const EventsState({
    this.status = EventsStatus.initial,
    this.events,
    this.selectedEvent,
    this.featuredEvents,
    this.upcomingEvents,
    this.eventTags,
    this.errorMessage,
  });

  bool get isLoading => status == EventsStatus.loading;
  bool get isLoaded => status == EventsStatus.loaded;
  bool get hasError => status == EventsStatus.error;

  EventsState copyWith({
    EventsStatus? status,
    PaginatedResponse<EventSummary>? events,
    EventDetail? selectedEvent,
    List<EventSummary>? featuredEvents,
    List<EventSummary>? upcomingEvents,
    List<Tag>? eventTags,
    String? errorMessage,
  }) {
    return EventsState(
      status: status ?? this.status,
      events: events ?? this.events,
      selectedEvent: selectedEvent ?? this.selectedEvent,
      featuredEvents: featuredEvents ?? this.featuredEvents,
      upcomingEvents: upcomingEvents ?? this.upcomingEvents,
      eventTags: eventTags ?? this.eventTags,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  factory EventsState.initial() => const EventsState(status: EventsStatus.initial);
  
  factory EventsState.loading() => const EventsState(status: EventsStatus.loading);
  
  factory EventsState.loaded({
    PaginatedResponse<EventSummary>? events,
    EventDetail? selectedEvent,
    List<EventSummary>? featuredEvents,
    List<EventSummary>? upcomingEvents,
    List<Tag>? eventTags,
  }) => EventsState(
    status: EventsStatus.loaded,
    events: events,
    selectedEvent: selectedEvent,
    featuredEvents: featuredEvents,
    upcomingEvents: upcomingEvents,
    eventTags: eventTags,
  );
  
  factory EventsState.error(String message) => EventsState(
    status: EventsStatus.error,
    errorMessage: message,
  );

  @override
  List<Object?> get props => [
    status, 
    events, 
    selectedEvent, 
    featuredEvents, 
    upcomingEvents, 
    eventTags, 
    errorMessage
  ];
}
