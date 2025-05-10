import '../../../../core/models/paginated_response.dart';
import '../models/participant.dart';

abstract class ParticipantRepository {
  Future<PaginatedResponse<Participant>> getEventParticipants(
    String eventId, {
    int? page,
    int? size,
    String? sortBy,
    String? sortOrder,
    ParticipantStatus? status,
  });
  
  Future<Participant> registerForEvent(RegisterForEventRequest request);
  
  Future<Participant> updateParticipantStatus(
    String participantId, 
    UpdateParticipantStatusRequest request
  );
  
  Future<void> cancelRegistration(String participantId);
}
