import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../events/domain/models/event.dart';
import '../../../events/presentation/bloc/events_bloc.dart';
import '../../../events/presentation/bloc/events_event.dart';
import '../../../events/presentation/bloc/events_state.dart';
import '../../../events/presentation/widgets/event_card.dart';
import '../../../events/presentation/screens/event_details_screen.dart';

class MyEventsScreen extends StatefulWidget {
  const MyEventsScreen({super.key});

  @override
  State<MyEventsScreen> createState() => _MyEventsScreenState();
}

class _MyEventsScreenState extends State<MyEventsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    
    // Load user's events
    // In a real app, you would have a dedicated API endpoint for this
    // For now, we'll just use the existing events
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
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Events'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Registered'),
            Tab(text: 'Past Events'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Registered Events Tab
          _buildRegisteredEventsTab(),
          
          // Past Events Tab
          _buildPastEventsTab(),
        ],
      ),
    );
  }

  Widget _buildRegisteredEventsTab() {
    return BlocBuilder<EventsBloc, EventsState>(
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
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.event_busy,
                  size: 64,
                  color: Colors.grey,
                ),
                SizedBox(height: 16),
                Text(
                  'You haven\'t registered for any events yet',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          );
        } else {
          // Filter events to show only those the user is registered for
          // In a real app, this would come from the API
          final registeredEvents = state.events!.data.where((event) {
            // Simulate some events being registered
            return event.id.hashCode % 3 == 0;
          }).toList();
          
          if (registeredEvents.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.event_busy,
                    size: 64,
                    color: Colors.grey,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'You haven\'t registered for any events yet',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            );
          }
          
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: registeredEvents.length,
            itemBuilder: (context, index) {
              final event = registeredEvents[index];
              return EventCard(
                event: event,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => EventDetailsScreen(eventId: event.id),
                    ),
                  );
                },
              );
            },
          );
        }
      },
    );
  }

  Widget _buildPastEventsTab() {
    return BlocBuilder<EventsBloc, EventsState>(
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
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.history,
                  size: 64,
                  color: Colors.grey,
                ),
                SizedBox(height: 16),
                Text(
                  'No past events found',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          );
        } else {
          // Filter events to show only past events the user attended
          // In a real app, this would come from the API
          final pastEvents = state.events!.data.where((event) {
            // Simulate some events being in the past
            return event.id.hashCode % 2 == 0;
          }).toList();
          
          if (pastEvents.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.history,
                    size: 64,
                    color: Colors.grey,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'No past events found',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            );
          }
          
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: pastEvents.length,
            itemBuilder: (context, index) {
              final event = pastEvents[index];
              return EventCard(
                event: event,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => EventDetailsScreen(eventId: event.id),
                    ),
                  );
                },
              );
            },
          );
        }
      },
    );
  }
}
