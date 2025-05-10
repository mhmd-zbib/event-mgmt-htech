import 'package:equatable/equatable.dart';
import '../../domain/models/participant.dart';

abstract class ParticipantEvent extends Equatable {
  const ParticipantEvent();

  @override
  List<Object?> get props => [];
}

class LoadEventParticipants extends ParticipantEvent {
  final String eventId;
  final int page;
  final int size;
  final String? sortBy;
  final String? sortOrder;
  final ParticipantStatus? status;

  const LoadEventParticipants({
    required this.eventId,
    this.page = 1,
    this.size = 10,
    this.sortBy,
    this.sortOrder,
    this.status,
  });

  @override
  List<Object?> get props => [eventId, page, size, sortBy, sortOrder, status];
}

class RegisterForEvent extends ParticipantEvent {
  final String eventId;

  const RegisterForEvent({required this.eventId});

  @override
  List<Object> get props => [eventId];
}

class CancelRegistration extends ParticipantEvent {
  final String participantId;

  const CancelRegistration({required this.participantId});

  @override
  List<Object> get props => [participantId];
}

class UpdateParticipantStatus extends ParticipantEvent {
  final String participantId;
  final ParticipantStatus status;

  const UpdateParticipantStatus({
    required this.participantId,
    required this.status,
  });

  @override
  List<Object> get props => [participantId, status];
}

class LoadUserRegistrations extends ParticipantEvent {
  final String userId;
  final int page;
  final int size;
  final ParticipantStatus? status;

  const LoadUserRegistrations({
    required this.userId,
    this.page = 1,
    this.size = 10,
    this.status,
  });

  @override
  List<Object?> get props => [userId, page, size, status];
}
