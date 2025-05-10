import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../../../core/config/dependency_injection.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/favorites_service.dart';
import '../../../categories/domain/models/category.dart';
import '../../../categories/domain/repositories/category_repository.dart';
import '../../../tags/domain/models/tag.dart';
import '../../../tags/domain/repositories/tag_repository.dart';
import '../../domain/models/event_requests.dart';
import '../bloc/events_bloc.dart';
import '../bloc/events_event.dart';
import '../bloc/events_state.dart';
import '../widgets/event_card.dart';
import 'event_details_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchController = TextEditingController();
  final _dateFormat = DateFormat('yyyy-MM-dd');
  
  Category? _selectedCategory;
  List<Tag> _selectedTags = [];
  DateTime? _startDate;
  DateTime? _endDate;
  String? _selectedSortBy = 'startDate';
  String? _selectedSortOrder = 'ASC';
  
  List<Category> _categories = [];
  List<Tag> _availableTags = [];
  bool _isLoading = true;
  final FavoritesService _favoritesService = getIt<FavoritesService>();
  
  @override
  void initState() {
    super.initState();
    _loadFilters();
    // Initial search with empty parameters
    _performSearch();
  }
  
  Future<void> _loadFilters() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // Load categories
      final categoryRepository = getIt<CategoryRepository>();
      final categories = await categoryRepository.getCategories();
      
      // Load tags
      final tagRepository = getIt<TagRepository>();
      final tags = await tagRepository.getTags();
      
      setState(() {
        _categories = categories;
        _availableTags = tags;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      // Show error snackbar
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading filters: $e')),
        );
      }
    }
  }
  
  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
  
  void _performSearch() {
    final params = EventFilterParams(
      search: _searchController.text.isNotEmpty ? _searchController.text : null,
      categoryId: _selectedCategory?.id,
      tagIds: _selectedTags.isNotEmpty ? _selectedTags.map((tag) => tag.id).toList() : null,
      startDate: _startDate,
      endDate: _endDate,
      sortBy: _selectedSortBy,
      sortOrder: _selectedSortOrder,
      page: 1,
      size: 10,
    );
    
    context.read<EventsBloc>().add(LoadEvents(params));
  }
  
  Future<void> _selectDate(BuildContext context, bool isStartDate) async {
    final initialDate = isStartDate ? _startDate ?? DateTime.now() : _endDate ?? DateTime.now();
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: isStartDate ? DateTime.now() : (_startDate ?? DateTime.now()),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    
    if (picked != null) {
      setState(() {
        if (isStartDate) {
          _startDate = picked;
          // If end date is before start date, update it
          if (_endDate != null && _endDate!.isBefore(_startDate!)) {
            _endDate = _startDate;
          }
        } else {
          _endDate = picked;
        }
      });
      _performSearch();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Events'),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search events...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    _performSearch();
                  },
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onSubmitted: (_) => _performSearch(),
            ),
          ),
          
          // Filters
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                // Category Filter
                FilterChip(
                  label: Text(_selectedCategory != null ? _selectedCategory!.name : 'All Categories'),
                  selected: _selectedCategory != null,
                  onSelected: (selected) {
                    if (selected) {
                      _showCategoryDialog();
                    } else {
                      setState(() {
                        _selectedCategory = null;
                      });
                      _performSearch();
                    }
                  },
                ),
                
                const SizedBox(width: 8),
                
                // Tags Filter
                FilterChip(
                  label: Text(_selectedTags.isNotEmpty ? '${_selectedTags.length} Tags' : 'Tags'),
                  selected: _selectedTags.isNotEmpty,
                  onSelected: (selected) {
                    if (selected || _selectedTags.isNotEmpty) {
                      _showTagsDialog();
                    }
                  },
                ),
                const SizedBox(width: 8),
                
                // Date Range Filter
                FilterChip(
                  label: Text(_startDate != null ? 'From: ${_dateFormat.format(_startDate!)}' : 'Start Date'),
                  selected: _startDate != null,
                  onSelected: (selected) {
                    if (selected) {
                      _selectDate(context, true);
                    } else {
                      setState(() {
                        _startDate = null;
                      });
                      _performSearch();
                    }
                  },
                ),
                const SizedBox(width: 8),
                
                FilterChip(
                  label: Text(_endDate != null ? 'To: ${_dateFormat.format(_endDate!)}' : 'End Date'),
                  selected: _endDate != null,
                  onSelected: (selected) {
                    if (selected) {
                      _selectDate(context, false);
                    } else {
                      setState(() {
                        _endDate = null;
                      });
                      _performSearch();
                    }
                  },
                ),
                const SizedBox(width: 8),
                
                // Sort By Filter
                PopupMenuButton<String>(
                  child: Chip(
                    label: Text('Sort: ${_getSortByText(_selectedSortBy)}'),
                  ),
                  onSelected: (value) {
                    setState(() {
                      _selectedSortBy = value;
                    });
                    _performSearch();
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'startDate',
                      child: Text('Date'),
                    ),
                    const PopupMenuItem(
                      value: 'title',
                      child: Text('Title'),
                    ),
                    const PopupMenuItem(
                      value: 'location',
                      child: Text('Location'),
                    ),
                  ],
                ),
                const SizedBox(width: 8),
                
                // Sort Order Filter
                IconButton(
                  icon: Icon(
                    _selectedSortOrder == 'ASC' ? Icons.arrow_upward : Icons.arrow_downward,
                    color: AppTheme.primaryColor,
                  ),
                  onPressed: () {
                    setState(() {
                      _selectedSortOrder = _selectedSortOrder == 'ASC' ? 'DESC' : 'ASC';
                    });
                    _performSearch();
                  },
                ),
              ],
            ),
          ),
          
          const Divider(),
          
          // Search Results
          Expanded(
            child: BlocBuilder<EventsBloc, EventsState>(
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
                          onPressed: _performSearch,
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
                          Icons.search_off,
                          size: 64,
                          color: Colors.grey,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'No events found matching your criteria',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  );
                } else {
                  return ListView.builder(
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
                            );
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
                                  final params = EventFilterParams(
                                    search: _searchController.text.isNotEmpty ? _searchController.text : null,
                                    categoryId: _selectedCategory,
                                    startDate: _startDate,
                                    endDate: _endDate,
                                    sortBy: _selectedSortBy,
                                    sortOrder: _selectedSortOrder,
                                    page: state.events!.pagination.page + 1,
                                    size: 10,
                                  );
                                  
                                  context.read<EventsBloc>().add(LoadEvents(params));
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
                  );
                }
              },
            ),
          ),
        ],
      ),
    );
  }
  
  String _getSortByText(String? sortBy) {
    switch (sortBy) {
      case 'startDate':
        return 'Date';
      case 'title':
        return 'Title';
      case 'location':
        return 'Location';
      default:
        return 'Date';
    }
  }
  
  void _showCategoryDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Select Category'),
          content: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : SizedBox(
                  width: double.maxFinite,
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: _categories.length,
                    itemBuilder: (context, index) {
                      final category = _categories[index];
                      return ListTile(
                        title: Text(category.name),
                        selected: _selectedCategory?.id == category.id,
                        onTap: () {
                          setState(() {
                            _selectedCategory = category;
                          });
                          Navigator.pop(context);
                          _performSearch();
                        },
                      );
                    },
                  ),
                ),
          actions: [
            TextButton(
              onPressed: () {
                setState(() {
                  _selectedCategory = null;
                });
                Navigator.pop(context);
                _performSearch();
              },
              child: const Text('Clear'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Cancel'),
            ),
          ],
        );
      },
    );
  }
  
  void _showTagsDialog() {
    // Create a temporary list to track selected tags
    List<Tag> tempSelectedTags = List.from(_selectedTags);
    
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Select Tags'),
              content: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : SizedBox(
                      width: double.maxFinite,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (tempSelectedTags.isNotEmpty) ...[  
                            const Text('Selected Tags:', style: TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: tempSelectedTags.map((tag) {
                                return Chip(
                                  label: Text(tag.name),
                                  deleteIcon: const Icon(Icons.close, size: 18),
                                  onDeleted: () {
                                    setState(() {
                                      tempSelectedTags.remove(tag);
                                    });
                                  },
                                );
                              }).toList(),
                            ),
                            const Divider(),
                          ],
                          const Text('Available Tags:', style: TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Expanded(
                            child: ListView.builder(
                              shrinkWrap: true,
                              itemCount: _availableTags.length,
                              itemBuilder: (context, index) {
                                final tag = _availableTags[index];
                                final isSelected = tempSelectedTags.any((t) => t.id == tag.id);
                                return CheckboxListTile(
                                  title: Text(tag.name),
                                  value: isSelected,
                                  onChanged: (bool? value) {
                                    setState(() {
                                      if (value == true) {
                                        if (!isSelected) {
                                          tempSelectedTags.add(tag);
                                        }
                                      } else {
                                        tempSelectedTags.removeWhere((t) => t.id == tag.id);
                                      }
                                    });
                                  },
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
              actions: [
                TextButton(
                  onPressed: () {
                    setState(() {
                      tempSelectedTags.clear();
                    });
                  },
                  child: const Text('Clear All'),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () {
                    this.setState(() {
                      _selectedTags = List.from(tempSelectedTags);
                    });
                    Navigator.pop(context);
                    _performSearch();
                  },
                  child: const Text('Apply'),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
