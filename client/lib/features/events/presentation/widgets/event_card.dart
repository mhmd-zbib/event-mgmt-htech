import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/config/dependency_injection.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/favorites_service.dart';
import '../../../../core/utils/notification_service.dart';
import '../../../../core/models/notification_model.dart';
import '../../domain/models/event.dart';

class EventCard extends StatefulWidget {
  final EventSummary event;
  final VoidCallback onTap;

  const EventCard({
    super.key,
    required this.event,
    this.onTap,
  });

  @override
  State<EventCard> createState() => _EventCardState();
}

class _EventCardState extends State<EventCard> {
  late FavoritesService _favoritesService;
  late NotificationService _notificationService;
  late bool _isFavorite;

  @override
  void initState() {
    super.initState();
    _favoritesService = getIt<FavoritesService>();
    _notificationService = getIt<NotificationService>();
    _isFavorite = _favoritesService.isFavorite(widget.event.id);
  }

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('MMM dd, yyyy • hh:mm a');

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      clipBehavior: Clip.antiAlias,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: widget.onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Event Image
            if (widget.event.imageUrl != null)
              Image.network(
                widget.event.imageUrl!,
                height: 150,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    height: 150,
                    width: double.infinity,
                    color: Colors.grey[300],
                    child: const Icon(
                      Icons.image_not_supported,
                      size: 50,
                      color: Colors.grey,
                    ),
                  );
                },
              )
            else
              Container(
                height: 150,
                width: double.infinity,
                color: Colors.grey[300],
                child: const Icon(
                  Icons.event,
                  size: 50,
                  color: Colors.grey,
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and Status
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          widget.event.title,
                          style: Theme.of(context).textTheme.titleLarge,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      IconButton(
                        icon: Icon(
                          _isFavorite ? Icons.favorite : Icons.favorite_border,
                          color: _isFavorite ? Colors.red : null,
                          size: 22,
                        ),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () {
                          setState(() {
                            _isFavorite = !_isFavorite;
                            _favoritesService.toggleFavorite(widget.event.id);
                            
                            // Add notification when adding to favorites
                            if (_isFavorite) {
                              final notification = NotificationModel.create(
                                title: 'Added to Favorites',
                                message: '${widget.event.title} has been added to your favorites',
                                type: NotificationType.system,
                                actionRoute: '/event-details',
                                actionData: {'eventId': widget.event.id},
                              );
                              _notificationService.addNotification(notification);
                            }
                          });
                        },
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _getStatusColor(widget.event.status),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          widget.event.status.toString().split('.').last,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  
                  // Date
                  Row(
                    children: [
                      const Icon(Icons.calendar_today, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          dateFormat.format(widget.event.startDate),
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  
                  // Location
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          widget.event.location,
                          style: Theme.of(context).textTheme.bodyMedium,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  
                  // Category and Capacity
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          widget.event.category.name,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      const Spacer(),
                      const Icon(Icons.people, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        '${widget.event.participantsCount}/${widget.event.capacity}',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(EventStatus status) {
    switch (status) {
      case EventStatus.upcoming:
        return Colors.blue;
      case EventStatus.ongoing:
        return Colors.green;
      case EventStatus.past:
        return Colors.grey;
      case EventStatus.cancelled:
        return Colors.red;
    }
  }
}
