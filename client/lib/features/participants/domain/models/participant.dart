import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';

part 'participant.g.dart';

enum ParticipantStatus {
  @JsonValue('registered')
  registered,
  @JsonValue('attended')
  attended,
  @JsonValue('cancelled')
  cancelled,
  @JsonValue('waitlisted')
  waitlisted
}

@JsonSerializable()
class Participant extends Equatable {
  final String id;
  final UserInfo user;
  final ParticipantStatus status;
  final DateTime registrationDate;
  final bool checkedIn;
  final DateTime? checkedInAt;
  final String? ticketCode;

  const Participant({
    required this.id,
    required this.user,
    required this.status,
    required this.registrationDate,
    required this.checkedIn,
    this.checkedInAt,
    this.ticketCode,
  });

  factory Participant.fromJson(Map<String, dynamic> json) => _$ParticipantFromJson(json);
  
  Map<String, dynamic> toJson() => _$ParticipantToJson(this);

  @override
  List<Object?> get props => [
    id, 
    user, 
    status, 
    registrationDate, 
    checkedIn, 
    checkedInAt, 
    ticketCode
  ];
}

@JsonSerializable()
class UserInfo extends Equatable {
  final String id;
  final String firstName;
  final String lastName;
  final String email;

  const UserInfo({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
  });

  factory UserInfo.fromJson(Map<String, dynamic> json) => _$UserInfoFromJson(json);
  
  Map<String, dynamic> toJson() => _$UserInfoToJson(this);

  @override
  List<Object> get props => [id, firstName, lastName, email];
}

@JsonSerializable()
class RegisterForEventRequest extends Equatable {
  final String eventId;

  const RegisterForEventRequest({
    required this.eventId,
  });

  factory RegisterForEventRequest.fromJson(Map<String, dynamic> json) => _$RegisterForEventRequestFromJson(json);
  
  Map<String, dynamic> toJson() => _$RegisterForEventRequestToJson(this);

  @override
  List<Object> get props => [eventId];
}

@JsonSerializable()
class UpdateParticipantStatusRequest extends Equatable {
  final ParticipantStatus status;

  const UpdateParticipantStatusRequest({
    required this.status,
  });

  factory UpdateParticipantStatusRequest.fromJson(Map<String, dynamic> json) => _$UpdateParticipantStatusRequestFromJson(json);
  
  Map<String, dynamic> toJson() => _$UpdateParticipantStatusRequestToJson(this);

  @override
  List<Object> get props => [status];
}
