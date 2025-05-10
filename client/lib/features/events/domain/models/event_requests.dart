import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';

part 'event_requests.g.dart';

@JsonSerializable()
class CreateEventRequest extends Equatable {
  final String title;
  final String description;
  final DateTime startDate;
  final DateTime endDate;
  final String categoryId;
  final String? location;
  final int? capacity;
  final bool? isFeatured;
  final String? imageUrl;
  final List<String>? tagIds;

  const CreateEventRequest({
    required this.title,
    required this.description,
    required this.startDate,
    required this.endDate,
    required this.categoryId,
    this.location,
    this.capacity,
    this.isFeatured,
    this.imageUrl,
    this.tagIds,
  });

  factory CreateEventRequest.fromJson(Map<String, dynamic> json) => _$CreateEventRequestFromJson(json);
  
  Map<String, dynamic> toJson() => _$CreateEventRequestToJson(this);

  @override
  List<Object?> get props => [
    title, 
    description, 
    startDate, 
    endDate, 
    categoryId, 
    location, 
    capacity, 
    isFeatured, 
    imageUrl, 
    tagIds
  ];
}

@JsonSerializable()
class UpdateEventRequest extends Equatable {
  final String? title;
  final String? description;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? categoryId;
  final String? location;
  final int? capacity;
  final bool? isFeatured;
  final String? imageUrl;

  const UpdateEventRequest({
    this.title,
    this.description,
    this.startDate,
    this.endDate,
    this.categoryId,
    this.location,
    this.capacity,
    this.isFeatured,
    this.imageUrl,
  });

  factory UpdateEventRequest.fromJson(Map<String, dynamic> json) => _$UpdateEventRequestFromJson(json);
  
  Map<String, dynamic> toJson() => _$UpdateEventRequestToJson(this);

  @override
  List<Object?> get props => [
    title, 
    description, 
    startDate, 
    endDate, 
    categoryId, 
    location, 
    capacity, 
    isFeatured, 
    imageUrl
  ];
}

@JsonSerializable()
class EventTagsRequest extends Equatable {
  final List<String> tagIds;

  const EventTagsRequest({
    required this.tagIds,
  });

  factory EventTagsRequest.fromJson(Map<String, dynamic> json) => _$EventTagsRequestFromJson(json);
  
  Map<String, dynamic> toJson() => _$EventTagsRequestToJson(this);

  @override
  List<Object> get props => [tagIds];
}

@JsonSerializable()
class EventFilterParams extends Equatable {
  final int? page;
  final int? size;
  final String? sortBy;
  final String? sortOrder;
  final String? search;
  final String? categoryId;
  final String? tags;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? location;

  const EventFilterParams({
    this.page,
    this.size,
    this.sortBy,
    this.sortOrder,
    this.search,
    this.categoryId,
    this.tags,
    this.startDate,
    this.endDate,
    this.location,
  });

  Map<String, dynamic> toQueryParameters() {
    final Map<String, dynamic> params = {};
    
    if (page != null) params['page'] = page.toString();
    if (size != null) params['size'] = size.toString();
    if (sortBy != null) params['sortBy'] = sortBy;
    if (sortOrder != null) params['sortOrder'] = sortOrder;
    if (search != null) params['search'] = search;
    if (categoryId != null) params['categoryId'] = categoryId;
    if (tags != null) params['tags'] = tags;
    if (startDate != null) params['startDate'] = startDate.toIso8601String().split('T')[0];
    if (endDate != null) params['endDate'] = endDate.toIso8601String().split('T')[0];
    if (location != null) params['location'] = location;
    
    return params;
  }

  @override
  List<Object?> get props => [
    page, 
    size, 
    sortBy, 
    sortOrder, 
    search, 
    categoryId, 
    tags, 
    startDate, 
    endDate, 
    location
  ];
}
