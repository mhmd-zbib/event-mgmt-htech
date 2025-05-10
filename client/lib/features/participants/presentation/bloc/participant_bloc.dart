import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/models/participant.dart';
import '../../domain/repositories/participant_repository.dart';
import 'participant_event.dart';
import 'participant_state.dart';

class ParticipantBloc extends Bloc<ParticipantEvent, ParticipantState> {
  final ParticipantRepository _participantRepository;

  ParticipantBloc(this._participantRepository) : super(const ParticipantState()) {
    on<LoadEventParticipants>(_onLoadEventParticipants);
    on<RegisterForEvent>(_onRegisterForEvent);
    on<CancelRegistration>(_onCancelRegistration);
    on<UpdateParticipantStatus>(_onUpdateParticipantStatus);
  }

  Future<void> _onLoadEventParticipants(
    LoadEventParticipants event,
    Emitter<ParticipantState> emit,
  ) async {
    emit(state.copyWith(
      isLoading: true,
      errorMessage: null,
    ));

    try {
      final participants = await _participantRepository.getEventParticipants(
        event.eventId,
        page: event.page,
        size: event.size,
        sortBy: event.sortBy,
        sortOrder: event.sortOrder,
        status: event.status,
      );

      emit(state.copyWith(
        isLoading: false,
        participants: participants,
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> _onRegisterForEvent(
    RegisterForEvent event,
    Emitter<ParticipantState> emit,
  ) async {
    emit(state.copyWith(
      isRegistering: true,
      errorMessage: null,
      registrationSuccess: false,
    ));

    try {
      final request = RegisterForEventRequest(eventId: event.eventId);
      final participant = await _participantRepository.registerForEvent(request);

      emit(state.copyWith(
        isRegistering: false,
        currentParticipant: participant,
        registrationSuccess: true,
      ));
    } catch (e) {
      emit(state.copyWith(
        isRegistering: false,
        errorMessage: e.toString(),
        registrationSuccess: false,
      ));
    }
  }

  Future<void> _onCancelRegistration(
    CancelRegistration event,
    Emitter<ParticipantState> emit,
  ) async {
    emit(state.copyWith(
      isCancelling: true,
      errorMessage: null,
      cancellationSuccess: false,
    ));

    try {
      await _participantRepository.cancelRegistration(event.participantId);

      emit(state.copyWith(
        isCancelling: false,
        cancellationSuccess: true,
      ));
    } catch (e) {
      emit(state.copyWith(
        isCancelling: false,
        errorMessage: e.toString(),
        cancellationSuccess: false,
      ));
    }
  }

  Future<void> _onUpdateParticipantStatus(
    UpdateParticipantStatus event,
    Emitter<ParticipantState> emit,
  ) async {
    emit(state.copyWith(
      isUpdating: true,
      errorMessage: null,
      updateSuccess: false,
    ));

    try {
      final request = UpdateParticipantStatusRequest(status: event.status);
      final participant = await _participantRepository.updateParticipantStatus(
        event.participantId,
        request,
      );

      emit(state.copyWith(
        isUpdating: false,
        currentParticipant: participant,
        updateSuccess: true,
      ));
    } catch (e) {
      emit(state.copyWith(
        isUpdating: false,
        errorMessage: e.toString(),
        updateSuccess: false,
      ));
    }
  }
}
