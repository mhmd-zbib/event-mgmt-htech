import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:intl/intl.dart';
import '../../../../core/config/dependency_injection.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/favorites_service.dart';
import '../../../../core/utils/notification_service.dart';
import '../../../../core/widgets/error_state.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../participants/domain/models/participant.dart';
import '../../../participants/presentation/bloc/participant_bloc.dart';
import '../../../participants/presentation/bloc/participant_event.dart';
import '../../../participants/presentation/bloc/participant_state.dart';
import '../../../participants/presentation/screens/registration_screen.dart';
import '../../domain/models/event.dart';
import '../bloc/events_bloc.dart';
import '../bloc/events_event.dart';
import '../bloc/events_state.dart';
import '../widgets/event_tag_chip.dart';

class EventDetailsScreen extends StatefulWidget {
  final String eventId;

  const EventDetailsScreen({
    super.key,
    required this.eventId,
  });

  @override
  State<EventDetailsScreen> createState() => _EventDetailsScreenState();
}

class _EventDetailsScreenState extends State<EventDetailsScreen> {
  final FavoritesService _favoritesService = getIt<FavoritesService>();
  final NotificationService _notificationService = getIt<NotificationService>();
  bool _isFavorite = false;
  bool _isRegistered = false;
  String? _participantId;

  @override
  void initState() {
    super.initState();
    _loadEventDetails();
    _checkFavoriteStatus();
    _checkRegistrationStatus();
  }

  void _loadEventDetails() {
    // Load event details
    context.read<EventsBloc>().add(LoadEventById(widget.eventId));
    // Load event tags
    context.read<EventsBloc>().add(LoadEventTags(widget.eventId));
  }

  void _checkFavoriteStatus() {
    setState(() {
      _isFavorite = _favoritesService.isFavorite(widget.eventId);
    });
  }

  void _checkRegistrationStatus() {
    final authState = context.read<AuthBloc>().state;
    if (authState is Authenticated) {
      // Load participants for this event to check registration status
      context.read<ParticipantBloc>().add(
        LoadEventParticipants(eventId: widget.eventId),
      );
    }
  }

  void _registerForEvent() async {
    try {
      final request = RegisterForEventRequest(eventId: widget.eventId);
      await getIt<ParticipantRepository>().registerForEvent(request);

      if (mounted) {
        // Reload event details to update registration status
        context.read<EventsBloc>().add(LoadEventById(widget.eventId));

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Successfully registered for the event'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to register: ${e.toString()}'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  void _cancelRegistration() async {
    try {
      final state = context.read<EventsBloc>().state;
      if (state.selectedEvent?.userParticipation != null) {
        final participantId = state.selectedEvent!.userParticipation!.id;
        await getIt<ParticipantRepository>().cancelRegistration(participantId);

        if (mounted) {
          // Reload event details to update registration status
          context.read<EventsBloc>().add(LoadEventById(widget.eventId));

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Registration cancelled successfully'),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to cancel registration: ${e.toString()}'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Event Details'),
        actions: [
          IconButton(
            icon: Icon(
              _isFavorite ? Icons.favorite : Icons.favorite_border,
              color: _isFavorite ? Colors.red : null,
            ),
            onPressed: () {
              final event = context.read<EventsBloc>().state.selectedEvent;
              if (event != null) {
                setState(() {
                  _isFavorite = !_isFavorite;
                  _favoritesService.toggleFavorite(widget.eventId, event: event);

                  // Add notification when adding to favorites
                  if (_isFavorite) {
                    final notification = NotificationModel.create(
                      title: 'Added to Favorites',
                      message: '${event.title} has been added to your favorites',
                      type: NotificationType.system,
                      actionRoute: '/event-details',
                      actionData: {'eventId': event.id},
                    );
                    _notificationService.addNotification(notification);
                  } else {
                    _notificationService.removeNotification(event.id);
                  }
                });
              }
            },
          ),
          BlocBuilder<ParticipantBloc, ParticipantState>(
            builder: (context, participantState) {
              // Check if user is already registered
              final authState = context.read<AuthBloc>().state;
              if (authState is Authenticated && participantState.participants != null) {
                final userId = authState.user.id;
                _isRegistered = participantState.isUserRegisteredForEvent(widget.eventId, userId);
                _participantId = participantState.getParticipantIdForEvent(widget.eventId, userId);
              }

              return IconButton(
                icon: Icon(
                  _isRegistered ? Icons.event_available : Icons.event_outlined,
                  color: _isRegistered ? Colors.green : null,
                ),
                tooltip: _isRegistered ? 'Registered' : 'Register',
                onPressed: () {
                  final event = context.read<EventsBloc>().state.selectedEvent;
                  if (event != null) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => RegistrationScreen(
                          eventId: widget.eventId,
                          event: event,
                        ),
                      ),
                    ).then((_) => _checkRegistrationStatus());
                  }
                },
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              // Share functionality
            },
          ),
        ],
      ),
      body: BlocBuilder<EventsBloc, EventsState>(
        builder: (context, state) {
          if (state.status == EventsStatus.loading && state.selectedEvent == null) {
            return const Center(child: CircularProgressIndicator());
          } else if (state.status == EventsStatus.error) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Error: ${state.errorMessage}',
                    style: TextStyle(color: AppTheme.errorColor),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      context.read<EventsBloc>().add(LoadEventById(widget.eventId));
                    },
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          } else if (state.selectedEvent == null) {
            return const Center(child: Text('Event not found'));
          } else {
            final event = state.selectedEvent!;
            final dateFormat = DateFormat('MMM dd, yyyy • hh:mm a');

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Event Image
                  if (event.imageUrl != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        event.imageUrl!,
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            height: 200,
                            width: double.infinity,
                            color: Colors.grey[300],
                            child: const Icon(
                              Icons.image_not_supported,
                              size: 50,
                              color: Colors.grey,
                            ),
                          );
                        },
                      ),
                    )
                  else
                    Container(
                      height: 200,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.event,
                        size: 50,
                        color: Colors.grey,
                      ),
                    ),
                  const SizedBox(height: 16),

                  // Title and Status
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          event.title,
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                      ),
                      Chip(
                        label: Text(
                          event.status.toString().split('.').last,
                          style: const TextStyle(color: Colors.white),
                        ),
                        backgroundColor: _getStatusColor(event.status),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Date and Time
                  Row(
                    children: [
                      const Icon(Icons.calendar_today, size: 16),
                      const SizedBox(width: 8),
                      Text(dateFormat.format(event.startDate)),
                    ],
                  ),
                  if (event.startDate.day != event.endDate.day)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today, size: 16),
                          const SizedBox(width: 8),
                          Text('Until: ${dateFormat.format(event.endDate)}'),
                        ],
                      ),
                    ),
                  const SizedBox(height: 8),

                  // Location
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 16),
                      const SizedBox(width: 8),
                      Expanded(child: Text(event.location)),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Category and Tags
                  Row(
                    children: [
                      Chip(
                        label: Text(event.category.name),
                        backgroundColor: AppTheme.primaryColor.withOpacity(0.2),
                      ),
                      const SizedBox(width: 8),
                      if (state.eventTags != null && state.eventTags!.isNotEmpty)
                        ...state.eventTags!.take(2).map((tag) => Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: Chip(
                                label: Text(tag.name),
                                backgroundColor: tag.color != null
                                    ? Color(int.parse('0xFF${tag.color!.substring(1)}'))
                                    : Colors.grey[300],
                              ),
                            )),
                      if ((state.eventTags?.length ?? 0) > 2)
                        Chip(
                          label: Text('+${state.eventTags!.length - 2}'),
                          backgroundColor: Colors.grey[300],
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Capacity and Registration
                  Row(
                    children: [
                      const Icon(Icons.people, size: 16),
                      const SizedBox(width: 8),
                      Text('${event.participantsCount}/${event.capacity} registered'),
                      const Spacer(),
                      Text('${event.availableSeats} seats left'),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Description
                  Text(
                    'About',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(event.description),
                  const SizedBox(height: 24),

                  // Organizer
                  Text(
                    'Organizer',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const CircleAvatar(
                        child: Icon(Icons.person),
                      ),
                      const SizedBox(width: 16),
                      Text(
                        '${event.organizer.firstName} ${event.organizer.lastName}',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Registration Button
                  BlocBuilder<ParticipantBloc, ParticipantState>(
                    builder: (context, participantState) {
                      // Check if user is already registered
                      final authState = context.read<AuthBloc>().state;
                      if (authState is Authenticated && participantState.participants != null) {
                        final userId = authState.user.id;
                        _isRegistered = participantState.isUserRegisteredForEvent(widget.eventId, userId);
                        _participantId = participantState.getParticipantIdForEvent(widget.eventId, userId);
                      }

                      return SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            final event = context.read<EventsBloc>().state.selectedEvent;
                            if (event != null) {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => RegistrationScreen(
                                    eventId: widget.eventId,
                                    event: event,
                                  ),
                                ),
                              ).then((_) => _checkRegistrationStatus());
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _isRegistered ? Colors.green : Theme.of(context).primaryColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                                  ? 'Register for Event'
                                  : 'Event is Full',
                            ),
                          ),
                  ),
                ],
              ),
            );
          }
        },
      ),
    );
  }

  Color _getStatusColor(dynamic status) {
    switch (status) {
      case 'upcoming':
        return Colors.blue;
      case 'ongoing':
        return Colors.green;
      case 'past':
        return Colors.grey;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.blue;
    }
  }
}
