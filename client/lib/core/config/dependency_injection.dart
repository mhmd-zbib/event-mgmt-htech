import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../utils/notification_service.dart';
import '../utils/favorites_service.dart';
import '../utils/theme_service.dart';
import '../api/api_client.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/events/data/repositories/event_repository_impl.dart';
import '../../features/events/domain/repositories/event_repository.dart';
import '../../features/events/presentation/bloc/events_bloc.dart';
import '../../features/categories/data/repositories/category_repository_impl.dart';
import '../../features/categories/domain/repositories/category_repository.dart';
import '../../features/tags/data/repositories/tag_repository_impl.dart';
import '../../features/tags/domain/repositories/tag_repository.dart';
import '../../features/participants/data/repositories/participant_repository_impl.dart';
import '../../features/participants/domain/repositories/participant_repository.dart';

final getIt = GetIt.instance;

Future<void> setupDependencies() async {
  // External dependencies
  final sharedPreferences = await SharedPreferences.getInstance();
  getIt.registerSingleton<SharedPreferences>(sharedPreferences);
  getIt.registerSingleton<Dio>(Dio());

  // Core
  getIt.registerSingleton<ApiClient>(ApiClient(getIt<Dio>(), getIt<SharedPreferences>()));
  getIt.registerLazySingleton(() => NotificationService(getIt<SharedPreferences>()));
  getIt.registerLazySingleton(() => FavoritesService(getIt<SharedPreferences>()));
  getIt.registerLazySingleton(() => ThemeService(getIt<SharedPreferences>()));

  // Repositories
  getIt.registerSingleton<AuthRepository>(
    AuthRepositoryImpl(getIt<ApiClient>(), getIt<SharedPreferences>()),
  );
  
  getIt.registerSingleton<EventRepository>(
    EventRepositoryImpl(getIt<ApiClient>()),
  );
  
  getIt.registerSingleton<CategoryRepository>(
    CategoryRepositoryImpl(getIt<ApiClient>()),
  );
  
  getIt.registerSingleton<TagRepository>(
    TagRepositoryImpl(getIt<ApiClient>()),
  );
  
  getIt.registerSingleton<ParticipantRepository>(
    ParticipantRepositoryImpl(getIt<ApiClient>()),
  );
  
  // BLoCs
  getIt.registerFactory<AuthBloc>(
    () => AuthBloc(getIt<AuthRepository>()),
  );
  
  getIt.registerFactory<EventsBloc>(
    () => EventsBloc(getIt<EventRepository>()),
  );
}
