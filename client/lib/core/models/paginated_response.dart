import 'package:json_annotation/json_annotation.dart';
import 'pagination.dart';

part 'paginated_response.g.dart';

@JsonSerializable(genericArgumentFactories: true)
class PaginatedResponse<T> {
  final List<T> data;
  final Pagination pagination;
  final Sort sort;

  PaginatedResponse({
    required this.data,
    required this.pagination,
    required this.sort,
  });

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) {
    return _$PaginatedResponseFromJson(json, fromJsonT);
  }

  Map<String, dynamic> toJson(Object Function(T value) toJsonT) {
    return _$PaginatedResponseToJson(this, toJsonT);
  }
}
