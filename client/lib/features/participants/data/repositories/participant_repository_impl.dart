import '../../../../core/api/api_client.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/models/paginated_response.dart';
import '../../domain/models/participant.dart';
import '../../domain/repositories/participant_repository.dart';

class ParticipantRepositoryImpl implements ParticipantRepository {
  final ApiClient _apiClient;

  ParticipantRepositoryImpl(this._apiClient);

  @override
  Future<PaginatedResponse<Participant>> getEventParticipants(
    String eventId, {
    int? page,
    int? size,
    String? sortBy,
    String? sortOrder,
    ParticipantStatus? status,
  }) async {
    final Map<String, dynamic> queryParams = {};
    if (page != null) queryParams['page'] = page.toString();
    if (size != null) queryParams['size'] = size.toString();
    if (sortBy != null) queryParams['sortBy'] = sortBy;
    if (sortOrder != null) queryParams['sortOrder'] = sortOrder;
    if (status != null) queryParams['status'] = status.toString().split('.').last;

    final response = await _apiClient.get(
      '${ApiConstants.eventParticipants}$eventId/participants',
      queryParameters: queryParams,
    );
    
    return PaginatedResponse<Participant>.fromJson(
      response,
      (json) => Participant.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<Participant> registerForEvent(RegisterForEventRequest request) async {
    final response = await _apiClient.post(
      ApiConstants.participants,
      data: request.toJson(),
    );
    return Participant.fromJson(response['participant']);
  }

  @override
  Future<Participant> updateParticipantStatus(
    String participantId, 
    UpdateParticipantStatusRequest request
  ) async {
    final response = await _apiClient.put(
      '${ApiConstants.participantById}$participantId/status',
      data: request.toJson(),
    );
    return Participant.fromJson(response['participant']);
  }

  @override
  Future<void> cancelRegistration(String participantId) async {
    await _apiClient.delete('${ApiConstants.participantById}$participantId');
  }
}
