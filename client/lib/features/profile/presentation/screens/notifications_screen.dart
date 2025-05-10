import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/config/dependency_injection.dart';
import '../../../../core/models/notification_model.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/notification_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late NotificationService _notificationService;
  late List<NotificationModel> _notifications;
  final DateFormat _dateFormat = DateFormat('MMM dd, yyyy • hh:mm a');

  @override
  void initState() {
    super.initState();
    _notificationService = getIt<NotificationService>();
    _loadNotifications();
  }

  void _loadNotifications() {
    setState(() {
      _notifications = _notificationService.getNotifications();
    });
  }

  Future<void> _markAllAsRead() async {
    await _notificationService.markAllAsRead();
    _loadNotifications();
  }

  Future<void> _markAsRead(String id) async {
    await _notificationService.markAsRead(id);
    _loadNotifications();
  }

  Future<void> _clearAll() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear All Notifications'),
        content: const Text('Are you sure you want to clear all notifications?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Clear All'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await _notificationService.clearAll();
      _loadNotifications();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (_notifications.isNotEmpty)
            PopupMenuButton<String>(
              onSelected: (value) {
                if (value == 'mark_all_read') {
                  _markAllAsRead();
                } else if (value == 'clear_all') {
                  _clearAll();
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'mark_all_read',
                  child: Text('Mark all as read'),
                ),
                const PopupMenuItem(
                  value: 'clear_all',
                  child: Text('Clear all'),
                ),
              ],
            ),
        ],
      ),
      body: _notifications.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              itemCount: _notifications.length,
              itemBuilder: (context, index) {
                final notification = _notifications[index];
                return _buildNotificationItem(notification);
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_off,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'No notifications yet',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'We\'ll notify you when something important happens',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationItem(NotificationModel notification) {
    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: AppTheme.errorColor,
        child: const Icon(
          Icons.delete,
          color: Colors.white,
        ),
      ),
      onDismissed: (direction) {
        // Remove the notification
        setState(() {
          _notifications.removeWhere((item) => item.id == notification.id);
        });
      },
      child: ListTile(
        leading: _getNotificationIcon(notification.type),
        title: Text(
          notification.title,
          style: TextStyle(
            fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(notification.message),
            const SizedBox(height: 4),
            Text(
              _dateFormat.format(notification.timestamp),
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
        isThreeLine: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        tileColor: notification.isRead ? null : AppTheme.primaryColor.withOpacity(0.05),
        onTap: () {
          _markAsRead(notification.id);
          // Navigate to the related screen if there's an action route
          if (notification.actionRoute != null) {
            Navigator.pushNamed(context, notification.actionRoute!);
          }
        },
      ),
    );
  }

  Widget _getNotificationIcon(NotificationType type) {
    IconData iconData;
    Color iconColor;

    switch (type) {
      case NotificationType.eventReminder:
        iconData = Icons.event;
        iconColor = Colors.blue;
        break;
      case NotificationType.registrationConfirmation:
        iconData = Icons.check_circle;
        iconColor = Colors.green;
        break;
      case NotificationType.eventUpdate:
        iconData = Icons.update;
        iconColor = Colors.orange;
        break;
      case NotificationType.system:
        iconData = Icons.info;
        iconColor = Colors.grey;
        break;
    }

    return CircleAvatar(
      backgroundColor: iconColor.withOpacity(0.2),
      child: Icon(
        iconData,
        color: iconColor,
        size: 20,
      ),
    );
  }
}
