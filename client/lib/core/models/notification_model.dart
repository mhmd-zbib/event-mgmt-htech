import 'dart:convert';
import 'package:equatable/equatable.dart';
import 'package:uuid/uuid.dart';

enum NotificationType {
  eventReminder,
  registrationConfirmation,
  eventUpdate,
  system,
}

class NotificationModel extends Equatable {
  final String id;
  final String title;
  final String message;
  final NotificationType type;
  final DateTime timestamp;
  final bool isRead;
  final String? actionRoute;
  final Map<String, dynamic>? actionData;

  const NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.timestamp,
    this.isRead = false,
    this.actionRoute,
    this.actionData,
  });

  factory NotificationModel.create({
    required String title,
    required String message,
    required NotificationType type,
    String? actionRoute,
    Map<String, dynamic>? actionData,
  }) {
    return NotificationModel(
      id: const Uuid().v4(),
      title: title,
      message: message,
      type: type,
      timestamp: DateTime.now(),
      actionRoute: actionRoute,
      actionData: actionData,
    );
  }

  NotificationModel copyWith({
    String? id,
    String? title,
    String? message,
    NotificationType? type,
    DateTime? timestamp,
    bool? isRead,
    String? actionRoute,
    Map<String, dynamic>? actionData,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      type: type ?? this.type,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      actionRoute: actionRoute ?? this.actionRoute,
      actionData: actionData ?? this.actionData,
    );
  }

  factory NotificationModel.fromJson(String source) {
    final map = json.decode(source) as Map<String, dynamic>;
    return NotificationModel(
      id: map['id'] as String,
      title: map['title'] as String,
      message: map['message'] as String,
      type: NotificationType.values.firstWhere(
        (e) => e.toString() == map['type'],
        orElse: () => NotificationType.system,
      ),
      timestamp: DateTime.parse(map['timestamp'] as String),
      isRead: map['isRead'] as bool,
      actionRoute: map['actionRoute'] as String?,
      actionData: map['actionData'] != null 
          ? json.decode(map['actionData'] as String) as Map<String, dynamic>
          : null,
    );
  }

  String toJson() {
    return json.encode({
      'id': id,
      'title': title,
      'message': message,
      'type': type.toString(),
      'timestamp': timestamp.toIso8601String(),
      'isRead': isRead,
      'actionRoute': actionRoute,
      'actionData': actionData != null ? json.encode(actionData) : null,
    });
  }

  @override
  List<Object?> get props => [
    id,
    title,
    message,
    type,
    timestamp,
    isRead,
    actionRoute,
    actionData,
  ];
}
