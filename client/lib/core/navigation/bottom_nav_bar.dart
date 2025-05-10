import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/auth/presentation/bloc/auth_state.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/events/presentation/screens/home_screen.dart';
import '../../features/events/presentation/screens/search_screen.dart';
import '../../features/participants/presentation/screens/user_registrations_screen.dart';
import '../../features/profile/presentation/screens/favorites_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../config/dependency_injection.dart';
import '../utils/notification_service.dart';

class AppBottomNavBar extends StatefulWidget {
  const AppBottomNavBar({Key? key}) : super(key: key);

  @override
  State<AppBottomNavBar> createState() => _AppBottomNavBarState();
}

class _AppBottomNavBarState extends State<AppBottomNavBar> {
  int _selectedIndex = 0;
  final NotificationService _notificationService = getIt<NotificationService>();
  int _unreadNotifications = 0;

  final List<Widget> _authenticatedScreens = [
    const HomeScreen(),
    const SearchScreen(),
    const FavoritesScreen(),
    const UserRegistrationsScreen(),
    const ProfileScreen(),
  ];

  final List<Widget> _unauthenticatedScreens = [
    const HomeScreen(),
    const SearchScreen(),
    const LoginScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _updateUnreadCount();
  }

  void _updateUnreadCount() {
    setState(() {
      _unreadNotifications = _notificationService.getUnreadCount();
    });
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        final isAuthenticated = state is Authenticated;
        
        return Scaffold(
          body: IndexedStack(
            index: _selectedIndex,
            children: isAuthenticated
                ? _authenticatedScreens
                : _unauthenticatedScreens,
          ),
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: _selectedIndex,
            onTap: (index) {
              // If user is not authenticated and tries to access protected screens
              if (!isAuthenticated && index > 1) {
                setState(() {
                  _selectedIndex = 2; // Go to login screen
                });
              } else {
                setState(() {
                  _selectedIndex = index;
                  // Update unread count when navigating to profile
                  if (index == 4) {
                    _updateUnreadCount();
                  }
                });
              }
            },
            type: BottomNavigationBarType.fixed,
            items: [
              const BottomNavigationBarItem(
                icon: Icon(Icons.home),
                label: 'Home',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.search),
                label: 'Search',
              ),
              if (isAuthenticated) ...[
                const BottomNavigationBarItem(
                  icon: Icon(Icons.favorite),
                  label: 'Favorites',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.event_available),
                  label: 'My Events',
                ),
                BottomNavigationBarItem(
                  icon: Stack(
                    children: [
                      const Icon(Icons.person),
                      if (_unreadNotifications > 0)
                        Positioned(
                          right: 0,
                          top: 0,
                          child: Container(
                            padding: const EdgeInsets.all(1),
                            decoration: BoxDecoration(
                              color: Colors.red,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            constraints: const BoxConstraints(
                              minWidth: 12,
                              minHeight: 12,
                            ),
                            child: Text(
                              _unreadNotifications > 9 ? '9+' : _unreadNotifications.toString(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 8,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                    ],
                  ),
                  label: 'Profile',
                ),
              ] else
                const BottomNavigationBarItem(
                  icon: Icon(Icons.login),
                  label: 'Login',
                ),
            ],
          ),
        );
      },
    );
  }
}
