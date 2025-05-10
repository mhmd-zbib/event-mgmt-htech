import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/config/dependency_injection.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/favorites_service.dart';
import '../../../events/domain/models/event_requests.dart';
import '../../../events/presentation/bloc/events_bloc.dart';
import '../../../events/presentation/bloc/events_event.dart';
import '../../../events/presentation/bloc/events_state.dart';
import '../../../events/presentation/widgets/event_card.dart';
import '../../../events/presentation/screens/event_details_screen.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  final FavoritesService _favoritesService = getIt<FavoritesService>();
  List<String> _favoriteIds = [];
  
  @override
  void initState() {
    super.initState();
    _loadFavorites();
    
    // Load all events
    context.read<EventsBloc>().add(
      LoadEvents(
        const EventFilterParams(
          page: 1,
          size: 50, // Load more to ensure we get all favorites
          sortBy: 'startDate',
          sortOrder: 'ASC',
        ),
      ),
    );
  }
  
  void _loadFavorites() {
    setState(() {
      _favoriteIds = _favoritesService.getFavoriteIds();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Favorite Events'),
        actions: [
          if (_favoriteIds.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete),
              onPressed: () => _showClearConfirmation(),
            ),
        ],
      ),
      body: BlocBuilder<EventsBloc, EventsState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state.hasError) {
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
                      context.read<EventsBloc>().add(
                        LoadEvents(
                          const EventFilterParams(
                            page: 1,
                            size: 50,
                            sortBy: 'startDate',
                            sortOrder: 'ASC',
                          ),
                        ),
                      );
                    },
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          } else if (_favoriteIds.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.favorite_border,
                    size: 64,
                    color: Colors.grey,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'No favorite events yet',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Add events to your favorites to see them here',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          } else if (state.events == null || state.events!.data.isEmpty) {
            return const Center(
              child: Text('No events available'),
            );
          } else {
            // Filter events to show only favorites
            final favoriteEvents = state.events!.data.where(
              (event) => _favoriteIds.contains(event.id)
            ).toList();
            
            if (favoriteEvents.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.favorite_border,
                      size: 64,
                      color: Colors.grey,
                    ),
                    SizedBox(height: 16),
                    Text(
                      'No favorite events found',
                      style: TextStyle(
                        fontSize: 18,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              );
            }
            
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: favoriteEvents.length,
              itemBuilder: (context, index) {
                final event = favoriteEvents[index];
                return Dismissible(
                  key: Key(event.id),
                  direction: DismissDirection.endToStart,
                  background: Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    color: AppTheme.errorColor,
                    child: const Icon(
                      Icons.delete,
                      color: Colors.white,
                    ),
                  ),
                  onDismissed: (direction) {
                    _favoritesService.removeFavorite(event.id);
                    _loadFavorites();
                    
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('Event removed from favorites'),
                        action: SnackBarAction(
                          label: 'Undo',
                          onPressed: () {
                            _favoritesService.addFavorite(event.id);
                            _loadFavorites();
                          },
                        ),
                      ),
                    );
                  },
                  child: EventCard(
                    event: event,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => EventDetailsScreen(eventId: event.id),
                        ),
                      ).then((_) => _loadFavorites());
                    },
                  ),
                );
              },
            );
          }
        },
      ),
    );
  }
  
  void _showClearConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Favorites'),
        content: const Text('Are you sure you want to clear all your favorite events?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              _favoritesService.clearFavorites();
              _loadFavorites();
              Navigator.pop(context);
              
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('All favorites cleared'),
                ),
              );
            },
            child: const Text('Clear All'),
          ),
        ],
      ),
    );
  }
}
