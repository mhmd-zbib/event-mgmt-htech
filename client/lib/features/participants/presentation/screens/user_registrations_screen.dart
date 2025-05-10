import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/error_state.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../events/presentation/screens/event_details_screen.dart';
import '../../../events/presentation/widgets/event_card.dart';
import '../../domain/models/participant.dart';
import '../bloc/participant_bloc.dart';
import '../bloc/participant_event.dart';
import '../bloc/participant_state.dart';
import '../widgets/registration_status_badge.dart';

class UserRegistrationsScreen extends StatefulWidget {
  const UserRegistrationsScreen({Key? key}) : super(key: key);

  @override
  State<UserRegistrationsScreen> createState() => _UserRegistrationsScreenState();
}

class _UserRegistrationsScreenState extends State<UserRegistrationsScreen> {
  ParticipantStatus? _selectedStatus;
  
  @override
  void initState() {
    super.initState();
    _loadUserRegistrations();
  }

  void _loadUserRegistrations() {
    final authState = context.read<AuthBloc>().state;
    if (authState is Authenticated) {
      context.read<ParticipantBloc>().add(
        LoadUserRegistrations(
          userId: authState.user.id,
          status: _selectedStatus,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Registrations'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilterDialog(),
          ),
        ],
      ),
      body: BlocBuilder<ParticipantBloc, ParticipantState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state.hasError) {
            return ErrorState(
              message: state.errorMessage ?? 'An error occurred',
              onRetry: _loadUserRegistrations,
            );
          } else if (state.participants == null || state.participants!.data.isEmpty) {
            return const EmptyState(
              icon: Icons.event_busy,
              title: 'No Registrations',
              message: 'You haven\'t registered for any events yet.',
            );
          } else {
            return RefreshIndicator(
              onRefresh: () async => _loadUserRegistrations(),
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: state.participants!.data.length,
                itemBuilder: (context, index) {
                  final participant = state.participants!.data[index];
                  return _buildRegistrationCard(participant);
                },
              ),
            );
          }
        },
      ),
    );
  }

  Widget _buildRegistrationCard(Participant participant) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        children: [
          // Registration status header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(4),
                topRight: Radius.circular(4),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Registration Date: ${_formatDate(participant.registrationDate)}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                RegistrationStatusBadge(status: participant.status),
              ],
            ),
          ),
          
          // Event details
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  participant.event?.title ?? 'Event',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 16),
                    const SizedBox(width: 8),
                    Text(
                      participant.event?.startDate != null
                          ? _formatDate(participant.event!.startDate)
                          : 'Date not available',
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
                        participant.event?.location ?? 'Location not available',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Action buttons
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 0, 8, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () {
                    if (participant.event != null) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => EventDetailsScreen(
                            eventId: participant.event!.id,
                          ),
                        ),
                      );
                    }
                  },
                  child: const Text('View Event'),
                ),
                if (participant.status != ParticipantStatus.cancelled)
                  TextButton(
                    onPressed: () => _showCancelConfirmation(participant.id),
                    style: TextButton.styleFrom(
                      foregroundColor: AppTheme.errorColor,
                    ),
                    child: const Text('Cancel Registration'),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter Registrations'),
        content: StatefulBuilder(
          builder: (context, setState) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                RadioListTile<ParticipantStatus?>(
                  title: const Text('All'),
                  value: null,
                  groupValue: _selectedStatus,
                  onChanged: (value) {
                    setState(() => _selectedStatus = value);
                  },
                ),
                RadioListTile<ParticipantStatus?>(
                  title: const Text('Registered'),
                  value: ParticipantStatus.registered,
                  groupValue: _selectedStatus,
                  onChanged: (value) {
                    setState(() => _selectedStatus = value);
                  },
                ),
                RadioListTile<ParticipantStatus?>(
                  title: const Text('Attended'),
                  value: ParticipantStatus.attended,
                  groupValue: _selectedStatus,
                  onChanged: (value) {
                    setState(() => _selectedStatus = value);
                  },
                ),
                RadioListTile<ParticipantStatus?>(
                  title: const Text('Waitlisted'),
                  value: ParticipantStatus.waitlisted,
                  groupValue: _selectedStatus,
                  onChanged: (value) {
                    setState(() => _selectedStatus = value);
                  },
                ),
                RadioListTile<ParticipantStatus?>(
                  title: const Text('Cancelled'),
                  value: ParticipantStatus.cancelled,
                  groupValue: _selectedStatus,
                  onChanged: (value) {
                    setState(() => _selectedStatus = value);
                  },
                ),
              ],
            );
          },
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _loadUserRegistrations();
            },
            child: const Text('Apply'),
          ),
        ],
      ),
    );
  }

  void _showCancelConfirmation(String participantId) {
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
              context.read<ParticipantBloc>().add(
                CancelRegistration(participantId: participantId),
              );
            },
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
