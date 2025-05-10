import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';
import '../../../profile/presentation/screens/profile_screen.dart';
import '../../domain/models/event_requests.dart';
import '../bloc/events_bloc.dart';
import '../bloc/events_event.dart';
import '../bloc/events_state.dart';
import '../widgets/event_card.dart';
import 'event_details_screen.dart';
import 'search_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final ScrollController _scrollController = ScrollController();
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    
    // Load featured events
    context.read<EventsBloc>().add(const LoadFeaturedEvents());
    
    // Load upcoming events
    context.read<EventsBloc>().add(const LoadUpcomingEvents(limit: 10));
    
    // Load all events with pagination
    context.read<EventsBloc>().add(
      LoadEvents(
        const EventFilterParams(
          page: 1,
          size: 10,
          sortBy: 'startDate',
          sortOrder: 'ASC',
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Event Master'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SearchScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ProfileScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              context.read<AuthBloc>().add(const LogoutRequested());
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Featured'),
            Tab(text: 'Upcoming'),
            Tab(text: 'All Events'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Featured Events Tab
          _buildFeaturedEventsTab(),
          
          // Upcoming Events Tab
          _buildUpcomingEventsTab(),
          
          // All Events Tab
          _buildAllEventsTab(),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Navigate to create event screen
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildEventsList(BuildContext context, String type) {
    return BlocBuilder<EventsBloc, EventsState>(
      builder: (context, state) {
        if (state.isLoading && state.events == null) {
          return const Center(child: CircularProgressIndicator());
        } else if (state.error != null && state.events == null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Error loading events: ${state.error}',
                  style: TextStyle(color: AppTheme.errorColor),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    _loadEvents(context, type);
                  },
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        } else if (state.events == null || state.events!.data.isEmpty) {
          return RefreshIndicator(
            onRefresh: () async {
              _loadEvents(context, type);
            },
            child: ListView(
              children: const [
                SizedBox(height: 150),
                Center(
                  child: Column(
                    children: [
                      Icon(Icons.event_busy, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('No events found', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
              ],
            ),
          );
        } else {
          return RefreshIndicator(
            onRefresh: () async {
              _loadEvents(context, type);
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: state.events!.data.length,
              itemBuilder: (context, index) {
                final event = state.events!.data[index];
                return EventCard(
                  event: event,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => EventDetailsScreen(eventId: event.id),
                      ),
                    ).then((_) {
                      // Refresh the list when returning from event details
                      _loadEvents(context, type);
                    });
                  },
                );
              },
            ),
          );
        }
      },
    );
  }

  Widget _buildUpcomingEventsTab() {
    return BlocBuilder<EventsBloc, EventsState>(
      builder: (context, state) {
        if (state.status == EventsStatus.loading && state.upcomingEvents == null) {
          return const Center(child: CircularProgressIndicator());
        } else if (state.status == EventsStatus.error && state.upcomingEvents == null) {
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
                    context.read<EventsBloc>().add(const LoadUpcomingEvents(limit: 10));
                  },
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        } else if (state.upcomingEvents == null || state.upcomingEvents!.isEmpty) {
          return RefreshIndicator(
            onRefresh: () async {
              context.read<EventsBloc>().add(const LoadUpcomingEvents(limit: 10));
            },
            child: ListView(
              children: const [
                SizedBox(height: 150),
                Center(
                  child: Column(
                    children: [
                      Icon(Icons.event_busy, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('No upcoming events available', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
              ],
            ),
          );
        } else {
          return RefreshIndicator(
            onRefresh: () async {
              context.read<EventsBloc>().add(const LoadUpcomingEvents(limit: 10));
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: state.upcomingEvents!.length,
              itemBuilder: (context, index) {
                final event = state.upcomingEvents![index];
                return EventCard(
                  event: event,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => EventDetailsScreen(eventId: event.id),
                      ),
                    ).then((_) {
                      // Refresh the list when returning from event details
                      context.read<EventsBloc>().add(const LoadUpcomingEvents(limit: 10));
                    });
                  },
                );
              },
            ),
          );
        }
      },
    );
  }

  Widget _buildAllEventsTab() {
    return BlocBuilder<EventsBloc, EventsState>(
      builder: (context, state) {
        if (state.status == EventsStatus.loading && state.events == null) {
          return const Center(child: CircularProgressIndicator());
        } else if (state.status == EventsStatus.error && state.events == null) {
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
                          size: 10,
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
        } else if (state.events == null || state.events!.data.isEmpty) {
          return RefreshIndicator(
            onRefresh: () async {
              context.read<EventsBloc>().add(
                LoadEvents(
                  const EventFilterParams(
                    page: 1,
                    size: 10,
                    sortBy: 'startDate',
                    sortOrder: 'ASC',
                  ),
                ),
              );
            },
            child: ListView(
              children: const [
                SizedBox(height: 150),
                Center(
                  child: Column(
                    children: [
                      Icon(Icons.event_busy, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('No events available', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
              ],
            ),
          );
        } else {
          return RefreshIndicator(
            onRefresh: () async {
              context.read<EventsBloc>().add(
                LoadEvents(
                  const EventFilterParams(
                    page: 1,
                    size: 10,
                    sortBy: 'startDate',
                    sortOrder: 'ASC',
                  ),
                ),
              );
            },
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: state.events!.data.length + 1, // +1 for pagination loader
              itemBuilder: (context, index) {
                if (index < state.events!.data.length) {
                  final event = state.events!.data[index];
                  return EventCard(
                    event: event,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => EventDetailsScreen(eventId: event.id),
                        ),
                      ).then((_) {
                        // No need to refresh here as we don't want to lose pagination
                        // Only refresh if we need to update the UI
                      });
                    },
                  );
                } else {
                  // Load more if we're at the end and there are more pages
                  if (state.events!.pagination.page < state.events!.pagination.pages) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Center(
                        child: ElevatedButton(
                          onPressed: () {
                            context.read<EventsBloc>().add(
                              LoadEvents(
                                EventFilterParams(
                                  page: state.events!.pagination.page + 1,
                                  size: 10,
                                  sortBy: 'startDate',
                                  sortOrder: 'ASC',
                                ),
                              ),
                            );
                          },
                          child: const Text('Load More'),
                        ),
                      ),
                    );
                  } else {
                    return const SizedBox.shrink();
                  }
                }
              },
            ),
          );
        }
      },
    );
  }
}
