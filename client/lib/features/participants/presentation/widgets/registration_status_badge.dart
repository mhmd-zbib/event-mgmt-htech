import 'package:flutter/material.dart';
import '../../domain/models/participant.dart';

class RegistrationStatusBadge extends StatelessWidget {
  final ParticipantStatus status;

  const RegistrationStatusBadge({
    Key? key,
    required this.status,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: _getStatusColor(),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        _getStatusText(),
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Color _getStatusColor() {
    switch (status) {
      case ParticipantStatus.registered:
        return Colors.blue;
      case ParticipantStatus.attended:
        return Colors.green;
      case ParticipantStatus.cancelled:
        return Colors.red;
      case ParticipantStatus.waitlisted:
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText() {
    switch (status) {
      case ParticipantStatus.registered:
        return 'Registered';
      case ParticipantStatus.attended:
        return 'Attended';
      case ParticipantStatus.cancelled:
        return 'Cancelled';
      case ParticipantStatus.waitlisted:
        return 'Waitlisted';
      default:
        return 'Unknown';
    }
  }
}
