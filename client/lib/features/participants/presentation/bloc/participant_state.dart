import 'package:equatable/equatable.dart';
import '../../../../core/models/paginated_response.dart';
import '../../domain/models/participant.dart';

class ParticipantState extends Equatable {
  final bool isLoading;
  final String? errorMessage;
  final PaginatedResponse<Participant>? participants;
  final Participant? currentParticipant;
  final bool isRegistering;
  final bool isUpdating;
  final bool isCancelling;
  final bool registrationSuccess;
  final bool updateSuccess;
  final bool cancellationSuccess;

  const ParticipantState({
    this.isLoading = false,
    this.errorMessage,
    this.participants,
    this.currentParticipant,
    this.isRegistering = false,
    this.isUpdating = false,
    this.isCancelling = false,
    this.registrationSuccess = false,
    this.updateSuccess = false,
    this.cancellationSuccess = false,
  });

  ParticipantState copyWith({
    bool? isLoading,
    String? errorMessage,
    PaginatedResponse<Participant>? participants,
    Participant? currentParticipant,
    bool? isRegistering,
    bool? isUpdating,
    bool? isCancelling,
    bool? registrationSuccess,
    bool? updateSuccess,
    bool? cancellationSuccess,
  }) {
    return ParticipantState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      participants: participants ?? this.participants,
      currentParticipant: currentParticipant ?? this.currentParticipant,
      isRegistering: isRegistering ?? this.isRegistering,
      isUpdating: isUpdating ?? this.isUpdating,
      isCancelling: isCancelling ?? this.isCancelling,
      registrationSuccess: registrationSuccess ?? this.registrationSuccess,
      updateSuccess: updateSuccess ?? this.updateSuccess,
      cancellationSuccess: cancellationSuccess ?? this.cancellationSuccess,
    );
  }

  @override
  List<Object?> get props => [
    isLoading,
    errorMessage,
    participants,
    currentParticipant,
    isRegistering,
    isUpdating,
    isCancelling,
    registrationSuccess,
    updateSuccess,
    cancellationSuccess,
  ];

  bool get hasError => errorMessage != null;
  
  // Helper methods to check if the user is registered for an event
  bool isUserRegisteredForEvent(String eventId, String userId) {
    if (participants == null || participants!.data.isEmpty) {
      return false;
    }
    
    return participants!.data.any((participant) => 
      participant.user.id == userId && 
      participant.status != ParticipantStatus.cancelled
    );
  }
  
  // Get participant ID if user is registered for an event
  String? getParticipantIdForEvent(String eventId, String userId) {
    if (participants == null || participants!.data.isEmpty) {
      return null;
    }
    
    final participant = participants!.data.firstWhere(
      (participant) => 
        participant.user.id == userId && 
        participant.status != ParticipantStatus.cancelled,
      orElse: () => Participant(
        id: '',
        user: UserInfo(id: '', firstName: '', lastName: '', email: ''),
        status: ParticipantStatus.cancelled,
        registrationDate: DateTime.now(),
        checkedIn: false,
      ),
    );
    
    return participant.id.isEmpty ? null : participant.id;
  }
}
