import 'package:flutter/material.dart';
import '../config/dependency_injection.dart';
import '../theme/app_theme.dart';
import '../utils/notification_service.dart';
import '../utils/theme_service.dart';
import '../../features/events/presentation/screens/home_screen.dart';
import '../../features/events/presentation/screens/search_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';

class MainBottomNavigation extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const MainBottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final notificationService = getIt<NotificationService>();
    final unreadCount = notificationService.getUnreadCount();

    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: onTap,
      selectedItemColor: AppTheme.primaryColor,
      unselectedItemColor: Colors.grey,
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
        BottomNavigationBarItem(
          icon: Stack(
            clipBehavior: Clip.none,
            children: [
              const Icon(Icons.person),
              if (unreadCount > 0)
                Positioned(
                  right: -6,
                  top: -3,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 14,
                      minHeight: 14,
                    ),
                    child: Text(
                      unreadCount > 9 ? '9+' : '$unreadCount',
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
      ],
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  final Function(ThemeMode)? onThemeChanged;
  const MainNavigationScreen({super.key, this.onThemeChanged});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  late ThemeService _themeService;
  int _currentIndex = 0;
  final List<Widget> _screens = [
    const HomeScreen(),
    const SearchScreen(),
    const ProfileScreen(),
  ];

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  void initState() {
    super.initState();
    _themeService = getIt<ThemeService>();
  }
  
  void _toggleTheme() async {
    final newMode = await _themeService.toggleTheme();
    if (widget.onThemeChanged != null) {
      widget.onThemeChanged!(newMode);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: MainBottomNavigation(
        currentIndex: _currentIndex,
        onTap: _onTabTapped,
      ),
      floatingActionButton: FloatingActionButton(
        mini: true,
        onPressed: _toggleTheme,
        tooltip: 'Toggle theme',
        child: Icon(isDark ? Icons.light_mode : Icons.dark_mode),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }
}
