import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/config/dependency_injection.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/notification_service.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../events/domain/models/event.dart';
import '../../../events/presentation/bloc/events_bloc.dart';
import '../../../events/presentation/bloc/events_state.dart';
import '../../domain/models/participant.dart';
import '../bloc/participant_bloc.dart';
import '../bloc/participant_event.dart';
import '../bloc/participant_state.dart';
import '../widgets/registration_status_badge.dart';

class RegistrationScreen extends StatefulWidget {
  final String eventId;
  final EventDetails event;

  const RegistrationScreen({
    Key? key,
    required this.eventId,
    required this.event,
  }) : super(key: key);

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final NotificationService _notificationService = getIt<NotificationService>();
  String? _participantId;
  bool _isRegistered = false;
  
  @override
  void initState() {
    super.initState();
    // Load participants for this event
    context.read<ParticipantBloc>().add(
      LoadEventParticipants(eventId: widget.eventId),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Event Registration'),
      ),
      body: BlocConsumer<ParticipantBloc, ParticipantState>(
        listener: (context, state) {
          if (state.registrationSuccess) {
            _showSuccessSnackBar('Successfully registered for the event!');
            _addRegistrationNotification();
            setState(() {
              _isRegistered = true;
              _participantId = state.currentParticipant?.id;
            });
          } else if (state.cancellationSuccess) {
            _showSuccessSnackBar('Registration cancelled successfully');
            setState(() {
              _isRegistered = false;
              _participantId = null;
            });
          } else if (state.hasError) {
            _showErrorSnackBar(state.errorMessage ?? 'An error occurred');
          }
        },
        builder: (context, state) {
          // Check if user is already registered
          final authState = context.read<AuthBloc>().state;
          if (authState is Authenticated && state.participants != null) {
            final userId = authState.user.id;
            _isRegistered = state.isUserRegisteredForEvent(widget.eventId, userId);
            _participantId = state.getParticipantIdForEvent(widget.eventId, userId);
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Event details section
                _buildEventDetailsCard(),
                
                const SizedBox(height: 24),
                
                // Registration status section
                _buildRegistrationStatusSection(state),
                
                const SizedBox(height: 24),
                
                // Registration action button
                _buildRegistrationActionButton(state),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildEventDetailsCard() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.event.title,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 16),
                const SizedBox(width: 8),
                Text(
                  _formatDate(widget.event.startDate),
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    widget.event.location,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (widget.event.capacity != null)
              Row(
                children: [
                  const Icon(Icons.people, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    'Capacity: ${widget.event.capacity}',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildRegistrationStatusSection(ParticipantState state) {
    if (state.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    
    if (_isRegistered) {
      return Card(
        color: Colors.green.shade50,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.green),
                  const SizedBox(width: 8),
                  Text(
                    'You are registered for this event',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.green.shade800,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              if (state.currentParticipant != null)
                RegistrationStatusBadge(status: state.currentParticipant!.status),
              const SizedBox(height: 16),
              Text(
                'Registration details:',
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 8),
              Text(
                'Date: ${_formatDate(DateTime.now())}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      );
    } else {
      return Card(
        color: Colors.blue.shade50,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.info, color: Colors.blue),
                  const SizedBox(width: 8),
                  Text(
                    'Registration Information',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.blue.shade800,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                'Register for this event to receive updates and secure your spot.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              if (widget.event.capacity != null) ...[
                const SizedBox(height: 8),
                Text(
                  'Limited capacity: ${widget.event.capacity} spots available',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ],
          ),
        ),
      );
    }
  }

  Widget _buildRegistrationActionButton(ParticipantState state) {
    if (_isRegistered) {
      return ElevatedButton.icon(
        onPressed: state.isCancelling
            ? null
            : () => _showCancelConfirmation(),
        icon: const Icon(Icons.cancel),
        label: state.isCancelling
            ? const Text('Cancelling...')
            : const Text('Cancel Registration'),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.red,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 50),
        ),
      );
    } else {
      return ElevatedButton.icon(
        onPressed: state.isRegistering
            ? null
            : () => _registerForEvent(),
        icon: const Icon(Icons.event_available),
        label: state.isRegistering
            ? const Text('Registering...')
            : const Text('Register for Event'),
        style: ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).primaryColor,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 50),
        ),
      );
    }
  }

  void _registerForEvent() {
    context.read<ParticipantBloc>().add(
      RegisterForEvent(eventId: widget.eventId),
    );
  }

  void _cancelRegistration() {
    if (_participantId != null) {
      context.read<ParticipantBloc>().add(
        CancelRegistration(participantId: _participantId!),
      );
    }
  }

  void _showCancelConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Registration'),
        content: const Text('Are you sure you want to cancel your registration for this event?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _cancelRegistration();
            },
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );
  }

  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppTheme.errorColor,
      ),
    );
  }

  void _addRegistrationNotification() {
    final notification = NotificationModel.create(
      title: 'Event Registration',
      message: 'You have successfully registered for ${widget.event.title}',
      type: NotificationType.system,
      actionRoute: '/event-details',
      actionData: {'eventId': widget.eventId},
    );
    _notificationService.addNotification(notification);
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} at ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
