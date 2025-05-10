import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';

part 'category.g.dart';

@JsonSerializable()
class CategorySummary extends Equatable {
  final String id;
  final String name;

  const CategorySummary({
    required this.id,
    required this.name,
  });

  factory CategorySummary.fromJson(Map<String, dynamic> json) => _$CategorySummaryFromJson(json);
  
  Map<String, dynamic> toJson() => _$CategorySummaryToJson(this);

  @override
  List<Object> get props => [id, name];
}

@JsonSerializable()
class CategoryDetail extends Equatable {
  final String id;
  final String name;
  final String? description;
  final String? color;
  final String? iconUrl;
  final int eventsCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  const CategoryDetail({
    required this.id,
    required this.name,
    this.description,
    this.color,
    this.iconUrl,
    required this.eventsCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory CategoryDetail.fromJson(Map<String, dynamic> json) => _$CategoryDetailFromJson(json);
  
  Map<String, dynamic> toJson() => _$CategoryDetailToJson(this);

  @override
  List<Object?> get props => [
    id, 
    name, 
    description, 
    color, 
    iconUrl, 
    eventsCount, 
    createdAt, 
    updatedAt
  ];
}
