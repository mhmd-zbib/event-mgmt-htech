import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/config/dependency_injection.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/theme_service.dart';
import 'core/widgets/main_bottom_navigation.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/auth/presentation/bloc/auth_event.dart';
import 'features/auth/presentation/bloc/auth_state.dart';
import 'features/auth/presentation/screens/login_screen.dart';
import 'features/events/presentation/bloc/events_bloc.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await setupDependencies();
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late ThemeMode _themeMode;
  
  @override
  void initState() {
    super.initState();
    _themeMode = getIt<ThemeService>().getThemeMode();
  }
  
  void _updateThemeMode(ThemeMode mode) {
    setState(() {
      _themeMode = mode;
      AppTheme.isDarkMode = mode == ThemeMode.dark;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>(
          create: (_) => getIt<AuthBloc>()..add(const AppStarted()),
        ),
        BlocProvider<EventsBloc>(
          create: (_) => getIt<EventsBloc>(),
        ),
      ],
      child: MaterialApp(
        title: 'Event Master',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: _themeMode,
        home: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            if (state.status == AuthStatus.initial || state.status == AuthStatus.loading) {
              return const Scaffold(
                body: Center(
                  child: CircularProgressIndicator(),
                ),
              );
            } else if (state.status == AuthStatus.authenticated) {
              return MainNavigationScreen(onThemeChanged: _updateThemeMode);
            } else {
              return const LoginScreen();
            }
          },
        ),
      ),
    );
  }
}
