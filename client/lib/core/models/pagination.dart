import 'package:json_annotation/json_annotation.dart';

part 'pagination.g.dart';

@JsonSerializable()
class Pagination {
  final int total;
  final int page;
  final int size;
  final int pages;

  Pagination({
    required this.total,
    required this.page,
    required this.size,
    required this.pages,
  });

  factory Pagination.fromJson(Map<String, dynamic> json) => _$PaginationFromJson(json);
  
  Map<String, dynamic> toJson() => _$PaginationToJson(this);
}

@JsonSerializable()
class Sort {
  final String by;
  final String order;

  Sort({
    required this.by,
    required this.order,
  });

  factory Sort.fromJson(Map<String, dynamic> json) => _$SortFromJson(json);
  
  Map<String, dynamic> toJson() => _$SortToJson(this);
}
