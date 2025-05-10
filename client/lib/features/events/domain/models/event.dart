import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';
import '../../../categories/domain/models/category.dart';
import '../../../tags/domain/models/tag.dart';

part 'event.g.dart';

enum EventStatus {
  @JsonValue('upcoming')
  upcoming,
  @JsonValue('ongoing')
  ongoing,
  @JsonValue('past')
  past,
  @JsonValue('cancelled')
  cancelled
}

@JsonSerializable()
class EventSummary extends Equatable {
  final String id;
  final String title;
  final DateTime startDate;
  final DateTime endDate;
  final String location;
  final int capacity;
  final int participantsCount;
  final bool isFeatured;
  final String? imageUrl;
  final CategorySummary category;
  final DateTime createdAt;
  final EventStatus status;

  const EventSummary({
    required this.id,
    required this.title,
    required this.startDate,
    required this.endDate,
    required this.location,
    required this.capacity,
    required this.participantsCount,
    required this.isFeatured,
    this.imageUrl,
    required this.category,
    required this.createdAt,
    required this.status,
  });

  factory EventSummary.fromJson(Map<String, dynamic> json) => _$EventSummaryFromJson(json);
  
  Map<String, dynamic> toJson() => _$EventSummaryToJson(this);

  @override
  List<Object?> get props => [
    id, 
    title, 
    startDate, 
    endDate, 
    location, 
    capacity, 
    participantsCount, 
    isFeatured, 
    imageUrl, 
    category, 
    createdAt, 
    status
  ];
}

@JsonSerializable()
class EventDetail extends Equatable {
  final String id;
  final String title;
  final String description;
  final DateTime startDate;
  final DateTime endDate;
  final String location;
  final int capacity;
  final int participantsCount;
  final int availableSeats;
  final bool isFeatured;
  final String? imageUrl;
  final CategorySummary category;
  final List<Tag> tags;
  final OrganizerSummary organizer;
  final DateTime createdAt;
  final DateTime updatedAt;
  final EventStatus status;
  final bool isRegistered;
  final UserParticipation? userParticipation;

  const EventDetail({
    required this.id,
    required this.title,
    required this.description,
    required this.startDate,
    required this.endDate,
    required this.location,
    required this.capacity,
    required this.participantsCount,
    required this.availableSeats,
    required this.isFeatured,
    this.imageUrl,
    required this.category,
    required this.tags,
    required this.organizer,
    required this.createdAt,
    required this.updatedAt,
    required this.status,
    required this.isRegistered,
    this.userParticipation,
  });

  factory EventDetail.fromJson(Map<String, dynamic> json) => _$EventDetailFromJson(json);
  
  Map<String, dynamic> toJson() => _$EventDetailToJson(this);

  @override
  List<Object?> get props => [
    id, 
    title, 
    description,
    startDate, 
    endDate, 
    location, 
    capacity, 
    participantsCount, 
    availableSeats,
    isFeatured, 
    imageUrl, 
    category, 
    tags,
    organizer,
    createdAt, 
    updatedAt,
    status,
    isRegistered,
    userParticipation
  ];
}

@JsonSerializable()
class OrganizerSummary extends Equatable {
  final String id;
  final String firstName;
  final String lastName;

  const OrganizerSummary({
    required this.id,
    required this.firstName,
    required this.lastName,
  });

  factory OrganizerSummary.fromJson(Map<String, dynamic> json) => _$OrganizerSummaryFromJson(json);
  
  Map<String, dynamic> toJson() => _$OrganizerSummaryToJson(this);

  @override
  List<Object> get props => [id, firstName, lastName];
}

@JsonSerializable()
class UserParticipation extends Equatable {
  final String id;
  @JsonKey(name: 'status')
  final ParticipationStatus status;
  final DateTime registrationDate;
  final bool checkedIn;

  const UserParticipation({
    required this.id,
    required this.status,
    required this.registrationDate,
    required this.checkedIn,
  });

  factory UserParticipation.fromJson(Map<String, dynamic> json) => _$UserParticipationFromJson(json);
  
  Map<String, dynamic> toJson() => _$UserParticipationToJson(this);

  @override
  List<Object> get props => [id, status, registrationDate, checkedIn];
}

enum ParticipationStatus {
  @JsonValue('registered')
  registered,
  @JsonValue('attended')
  attended,
  @JsonValue('cancelled')
  cancelled,
  @JsonValue('waitlisted')
  waitlisted
}
