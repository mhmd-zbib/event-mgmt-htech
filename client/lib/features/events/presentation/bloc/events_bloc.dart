import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/models/event_requests.dart';
import '../../domain/repositories/event_repository.dart';
import 'events_event.dart';
import 'events_state.dart';

class EventsBloc extends Bloc<EventsEvent, EventsState> {
  final EventRepository _eventRepository;

  EventsBloc(this._eventRepository) : super(EventsState.initial()) {
    on<LoadEvents>(_onLoadEvents);
    on<LoadEventById>(_onLoadEventById);
    on<CreateEvent>(_onCreateEvent);
    on<UpdateEvent>(_onUpdateEvent);
    on<DeleteEvent>(_onDeleteEvent);
    on<LoadEventTags>(_onLoadEventTags);
    on<AddTagsToEvent>(_onAddTagsToEvent);
    on<RemoveTagsFromEvent>(_onRemoveTagsFromEvent);
    on<LoadFeaturedEvents>(_onLoadFeaturedEvents);
    on<LoadUpcomingEvents>(_onLoadUpcomingEvents);
  }

  Future<void> _onLoadEvents(LoadEvents event, Emitter<EventsState> emit) async {
    emit(EventsState.loading());
    try {
      final events = await _eventRepository.getEvents(event.params);
      emit(EventsState.loaded(events: events));
    } catch (e) {
      emit(EventsState.error(e.toString()));
    }
  }

  Future<void> _onLoadEventById(LoadEventById event, Emitter<EventsState> emit) async {
    emit(state.copyWith(status: EventsStatus.loading));
    try {
      final eventDetail = await _eventRepository.getEventById(event.id);
      emit(state.copyWith(
        status: EventsStatus.loaded,
        selectedEvent: eventDetail,
      ));
    } catch (e) {
      emit(EventsState.error(e.toString()));
    }
  }

  Future<void> _onCreateEvent(CreateEvent event, Emitter<EventsState> emit) async {
    emit(state.copyWith(status: EventsStatus.loading));
    try {
      final createdEvent = await _eventRepository.createEvent(event.request);
      emit(state.copyWith(
        status: EventsStatus.loaded,
        selectedEvent: createdEvent,
      ));
    } catch (e) {
      emit(EventsState.error(e.toString()));
    }
  }

  Future<void> _onUpdateEvent(UpdateEvent event, Emitter<EventsState> emit) async {
    emit(state.copyWith(status: EventsStatus.loading));
    try {
      final updatedEvent = await _eventRepository.updateEvent(event.id, event.request);
      emit(state.copyWith(
        status: EventsStatus.loaded,
        selectedEvent: updatedEvent,
      ));
    } catch (e) {
      emit(EventsState.error(e.toString()));
    }
  }

  Future<void> _onDeleteEvent(DeleteEvent event, Emitter<EventsState> emit) async {
    emit(state.copyWith(status: EventsStatus.loading));
    try {
      await _eventRepository.deleteEvent(event.id);
      // After deletion, we should refresh the events list
      // but we don't have the filter params here, so we'll just update the status
      emit(state.copyWith(
        status: EventsStatus.loaded,
        selectedEvent: null,
      ));
    } catch (e) {
      emit(EventsState.error(e.toString()));
    }
  }

  Future<void> _onLoadEventTags(LoadEventTags event, Emitter<EventsState> emit) async {
    emit(state.copyWith(status: EventsStatus.loading));
    try {
      final tags = await _eventRepository.getEventTags(event.eventId);
      emit(state.copyWith(
        status: EventsStatus.loaded,
        eventTags: tags,
      ));
    } catch (e) {
      emit(EventsState.error(e.toString()));
    }
  }

  Future<void> _onAddTagsToEvent(AddTagsToEvent event, Emitter<EventsState> emit) async {
    emit(state.copyWith(status: EventsStatus.loading));
    try {
      final request = EventTagsRequest(tagIds: event.tagIds);
      final tags = await _eventRepository.addTagsToEvent(event.eventId, request);
      
      // If we have a selected event, we should update it with the new tags
      final currentEvent = state.selectedEvent;
      if (currentEvent != null && currentEvent.id == event.eventId) {
        // We need to reload the event to get the updated tags
        final updatedEvent = await _eventRepository.getEventById(event.eventId);
        emit(state.copyWith(
          status: EventsStatus.loaded,
          selectedEvent: updatedEvent,
          eventTags: tags,
        ));
      } else {
        emit(state.copyWith(
          status: EventsStatus.loaded,
          eventTags: tags,
        ));
      }
    } catch (e) {
      emit(EventsState.error(e.toString()));
    }
  }

  Future<void> _onRemoveTagsFromEvent(RemoveTagsFromEvent event, Emitter<EventsState> emit) async {
    emit(state.copyWith(status: EventsStatus.loading));
    try {
      await _eventRepository.removeTagsFromEvent(event.eventId, event.tagIds);
      
      // If we have a selected event, we should update it with the new tags
      final currentEvent = state.selectedEvent;
      if (currentEvent != null && currentEvent.id == event.eventId) {
        // We need to reload the event to get the updated tags
        final updatedEvent = await _eventRepository.getEventById(event.eventId);
        final updatedTags = await _eventRepository.getEventTags(event.eventId);
        emit(state.copyWith(
          status: EventsStatus.loaded,
          selectedEvent: updatedEvent,
          eventTags: updatedTags,
        ));
      } else {
        // Just reload the tags
        final updatedTags = await _eventRepository.getEventTags(event.eventId);
        emit(state.copyWith(
          status: EventsStatus.loaded,
          eventTags: updatedTags,
        ));
      }
    } catch (e) {
      emit(EventsState.error(e.toString()));
    }
  }

  Future<void> _onLoadFeaturedEvents(LoadFeaturedEvents event, Emitter<EventsState> emit) async {
    emit(state.copyWith(status: EventsStatus.loading));
    try {
      final featuredEvents = await _eventRepository.getFeaturedEvents();
      emit(state.copyWith(
        status: EventsStatus.loaded,
        featuredEvents: featuredEvents,
      ));
    } catch (e) {
      emit(EventsState.error(e.toString()));
    }
  }

  Future<void> _onLoadUpcomingEvents(LoadUpcomingEvents event, Emitter<EventsState> emit) async {
    emit(state.copyWith(status: EventsStatus.loading));
    try {
      final upcomingEvents = await _eventRepository.getUpcomingEvents(
        limit: event.limit,
        categoryId: event.categoryId,
      );
      emit(state.copyWith(
        status: EventsStatus.loaded,
        upcomingEvents: upcomingEvents,
      ));
    } catch (e) {
      emit(EventsState.error(e.toString()));
    }
  }
}
