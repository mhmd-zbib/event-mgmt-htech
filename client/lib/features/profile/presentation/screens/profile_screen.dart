import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/config/dependency_injection.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/notification_service.dart';
import '../../../auth/domain/models/user.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import 'edit_profile_screen.dart';
import 'my_events_screen.dart';
import 'notifications_screen.dart';
import 'favorites_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const NotificationsScreen(),
                    ),
                  );
                },
              ),
              if (getIt<NotificationService>().getUnreadCount() > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 16,
                      minHeight: 16,
                    ),
                    child: Text(
                      '${getIt<NotificationService>().getUnreadCount()}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const EditProfileScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state.user == null) {
            return const Center(
              child: Text('User information not available'),
            );
          } else {
            final user = state.user!;
            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Profile Image
                  CircleAvatar(
                    radius: 60,
                    backgroundColor: AppTheme.primaryColor.withOpacity(0.2),
                    backgroundImage: user.imageUrl != null
                        ? NetworkImage(user.imageUrl!)
                        : null,
                    child: user.imageUrl == null
                        ? Text(
                            _getInitials(user),
                            style: const TextStyle(
                              fontSize: 40,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryColor,
                            ),
                          )
                        : null,
                  ),
                  const SizedBox(height: 16),
                  
                  // User Name
                  Text(
                    '${user.firstName} ${user.lastName}',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  
                  // Email
                  Text(
                    user.email,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppTheme.textSecondaryColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  
                  // Verification Status
                  Chip(
                    label: Text(
                      user.isVerified ? 'Verified' : 'Not Verified',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                      ),
                    ),
                    backgroundColor: user.isVerified
                        ? Colors.green
                        : Colors.orange,
                  ),
                  const SizedBox(height: 32),
                  
                  // Profile Information
                  const _ProfileSection(
                    title: 'Account Information',
                    children: [
                      _ProfileItem(
                        icon: Icons.person,
                        title: 'My Events',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const MyEventsScreen(),
                            ),
                          );
                        },
                      ),
                      _ProfileItem(
                        icon: Icons.calendar_today,
                        title: 'My Registrations',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const MyEventsScreen(),
                            ),
                          );
                        },
                      ),
                      _ProfileItem(
                        icon: Icons.favorite,
                        title: 'Favorite Events',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const FavoritesScreen(),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  const _ProfileSection(
                    title: 'Settings',
                    children: [
                      _ProfileItem(
                        icon: Icons.notifications,
                        title: 'Notifications',
                        onTap: null,
                      ),
                      _ProfileItem(
                        icon: Icons.security,
                        title: 'Privacy & Security',
                        onTap: null,
                      ),
                      _ProfileItem(
                        icon: Icons.help,
                        title: 'Help & Support',
                        onTap: null,
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  
                  // Logout Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        context.read<AuthBloc>().add(const LogoutRequested());
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.errorColor,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Logout'),
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

  String _getInitials(User user) {
    return '${user.firstName[0]}${user.lastName[0]}';
  }
}

class _ProfileSection extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _ProfileSection({
    required this.title,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            title,
            style: Theme.of(context).textTheme.titleLarge,
          ),
        ),
        Card(
          margin: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }
}

class _ProfileItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback? onTap;

  const _ProfileItem({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.primaryColor),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
