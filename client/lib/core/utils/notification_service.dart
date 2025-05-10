import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/notification_model.dart';

class NotificationService {
  final SharedPreferences _prefs;
  
  NotificationService(this._prefs);
  
  // Get all notifications
  List<NotificationModel> getNotifications() {
    final notificationsJson = _prefs.getStringList('notifications') ?? [];
    return notificationsJson
        .map((json) => NotificationModel.fromJson(json))
        .toList()
        .reversed
        .toList(); // Most recent first
  }
  
  // Add a new notification
  Future<void> addNotification(NotificationModel notification) async {
    final notificationsJson = _prefs.getStringList('notifications') ?? [];
    notificationsJson.add(notification.toJson());
    
    // Keep only the last 50 notifications
    if (notificationsJson.length > 50) {
      notificationsJson.removeAt(0);
    }
    
    await _prefs.setStringList('notifications', notificationsJson);
  }
  
  // Mark a notification as read
  Future<void> markAsRead(String id) async {
    final notificationsJson = _prefs.getStringList('notifications') ?? [];
    final notifications = notificationsJson
        .map((json) => NotificationModel.fromJson(json))
        .toList();
    
    for (int i = 0; i < notifications.length; i++) {
      if (notifications[i].id == id && !notifications[i].isRead) {
        final updatedNotification = notifications[i].copyWith(isRead: true);
        notificationsJson[i] = updatedNotification.toJson();
      }
    }
    
    await _prefs.setStringList('notifications', notificationsJson);
  }
  
  // Mark all notifications as read
  Future<void> markAllAsRead() async {
    final notificationsJson = _prefs.getStringList('notifications') ?? [];
    final notifications = notificationsJson
        .map((json) => NotificationModel.fromJson(json))
        .toList();
    
    for (int i = 0; i < notifications.length; i++) {
      if (!notifications[i].isRead) {
        final updatedNotification = notifications[i].copyWith(isRead: true);
        notificationsJson[i] = updatedNotification.toJson();
      }
    }
    
    await _prefs.setStringList('notifications', notificationsJson);
  }
  
  // Get unread notifications count
  int getUnreadCount() {
    final notificationsJson = _prefs.getStringList('notifications') ?? [];
    final notifications = notificationsJson
        .map((json) => NotificationModel.fromJson(json))
        .toList();
    
    return notifications.where((notification) => !notification.isRead).length;
  }
  
  // Remove a specific notification by related ID (like eventId)
  Future<void> removeNotification(String relatedId) async {
    final notificationsJson = _prefs.getStringList('notifications') ?? [];
    final notifications = notificationsJson
        .map((json) => NotificationModel.fromJson(json))
        .toList();
    
    // Find notifications related to this ID and remove them
    notifications.removeWhere((notification) => 
      notification.actionData != null && 
      notification.actionData!['eventId'] == relatedId);
    
    // Convert back to JSON and save
    final updatedJson = notifications.map((notification) => notification.toJson()).toList();
    await _prefs.setStringList('notifications', updatedJson);
  }
  
  // Clear all notifications
  Future<void> clearAll() async {
    await _prefs.setStringList('notifications', []);
  }
  
  // Show a notification in the app
  void showNotification(BuildContext context, NotificationModel notification) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(notification.message),
        action: SnackBarAction(
          label: 'View',
          onPressed: () {
            // Navigate to the notification detail or related screen
            if (notification.actionRoute != null) {
              Navigator.pushNamed(context, notification.actionRoute!);
            }
          },
        ),
      ),
    );
  }
}
