import 'package:flutter/material.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/events/presentation/screens/event_details_screen.dart';
import '../../features/events/presentation/screens/search_screen.dart';
import '../../features/participants/presentation/screens/user_registrations_screen.dart';
import '../../features/profile/presentation/screens/favorites_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../config/dependency_injection.dart';
import '../utils/notification_service.dart';
import 'bottom_nav_bar.dart';

class AppRouter {
  static const String home = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String eventDetails = '/event-details';
  static const String search = '/search';
  static const String favorites = '/favorites';
  static const String registrations = '/registrations';
  static const String profile = '/profile';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    final args = settings.arguments;

    switch (settings.name) {
      case home:
        return MaterialPageRoute(
          builder: (_) => const AppBottomNavBar(),
        );
      
      case login:
        return MaterialPageRoute(
          builder: (_) => const LoginScreen(),
        );
      
      case register:
        return MaterialPageRoute(
          builder: (_) => const RegisterScreen(),
        );
      
      case eventDetails:
        if (args is String) {
          return MaterialPageRoute(
            builder: (_) => EventDetailsScreen(eventId: args),
          );
        }
        return _errorRoute();
      
      case search:
        return MaterialPageRoute(
          builder: (_) => const SearchScreen(),
        );
      
      case favorites:
        return MaterialPageRoute(
          builder: (_) => const FavoritesScreen(),
        );
      
      case registrations:
        return MaterialPageRoute(
          builder: (_) => const UserRegistrationsScreen(),
        );
      
      case profile:
        return MaterialPageRoute(
          builder: (_) => const ProfileScreen(),
        );
      
      default:
        return _errorRoute();
    }
  }

  static Route<dynamic> _errorRoute() {
    return MaterialPageRoute(
      builder: (_) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('Error'),
          ),
          body: const Center(
            child: Text('Page not found!'),
          ),
        );
      },
    );
  }

  // Handle deep links and notifications
  static void handleNotificationNavigation(BuildContext context, Map<String, dynamic>? actionData) {
    if (actionData == null) return;

    if (actionData.containsKey('eventId')) {
      Navigator.pushNamed(
        context,
        eventDetails,
        arguments: actionData['eventId'],
      );
    }
  }

  // Mark notification as read when navigating to its target
  static void markNotificationAsRead(String notificationId) {
    final notificationService = getIt<NotificationService>();
    notificationService.markAsRead(notificationId);
  }
}
