import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';

part 'tag.g.dart';

@JsonSerializable()
class Tag extends Equatable {
  final String id;
  final String name;
  final String? color;

  const Tag({
    required this.id,
    required this.name,
    this.color,
  });

  factory Tag.fromJson(Map<String, dynamic> json) => _$TagFromJson(json);
  
  Map<String, dynamic> toJson() => _$TagToJson(this);

  @override
  List<Object?> get props => [id, name, color];
}
