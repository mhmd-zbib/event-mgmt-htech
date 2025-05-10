import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../features/events/domain/models/event.dart';

class FavoriteEvent {
  final String id;
  final String title;
  final String? imageUrl;
  final DateTime startDate;
  final String location;
  
  FavoriteEvent({
    required this.id,
    required this.title,
    this.imageUrl,
    required this.startDate,
    required this.location,
  });
  
  factory FavoriteEvent.fromEventSummary(EventSummary event) {
    return FavoriteEvent(
      id: event.id,
      title: event.title,
      imageUrl: event.imageUrl,
      startDate: event.startDate,
      location: event.location,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'imageUrl': imageUrl,
      'startDate': startDate.toIso8601String(),
      'location': location,
    };
  }
  
  factory FavoriteEvent.fromJson(Map<String, dynamic> json) {
    return FavoriteEvent(
      id: json['id'],
      title: json['title'],
      imageUrl: json['imageUrl'],
      startDate: DateTime.parse(json['startDate']),
      location: json['location'],
    );
  }
}

class FavoritesService {
  final SharedPreferences _prefs;
  static const String _favoritesKey = 'favorite_events';
  static const String _favoriteDetailsKey = 'favorite_events_details';
  
  FavoritesService(this._prefs);
  
  // Get all favorite events
  List<String> getFavoriteIds() {
    return _prefs.getStringList(_favoritesKey) ?? [];
  }
  
  // Get all favorite events with details
  List<FavoriteEvent> getFavorites() {
    final detailsJson = _prefs.getString(_favoriteDetailsKey);
    if (detailsJson == null) return [];
    
    try {
      final List<dynamic> detailsList = jsonDecode(detailsJson);
      return detailsList
          .map((json) => FavoriteEvent.fromJson(json))
          .toList();
    } catch (e) {
      // If there's an error parsing, return empty list
      return [];
    }
  }
  
  // Check if an event is a favorite
  bool isFavorite(String eventId) {
    final favorites = getFavoriteIds();
    return favorites.contains(eventId);
  }
  
  // Add an event to favorites
  Future<bool> addFavorite(String eventId, {EventSummary? event}) async {
    final favorites = getFavoriteIds();
    var result = true;
    
    if (!favorites.contains(eventId)) {
      favorites.add(eventId);
      result = await _prefs.setStringList(_favoritesKey, favorites);
      
      // If event details are provided, save them
      if (event != null) {
        await _saveFavoriteDetails(FavoriteEvent.fromEventSummary(event));
      }
    }
    return result;
  }
  
  // Save favorite event details
  Future<bool> _saveFavoriteDetails(FavoriteEvent event) async {
    final favorites = getFavorites();
    
    // Remove existing event with same ID if it exists
    favorites.removeWhere((e) => e.id == event.id);
    
    // Add the new event
    favorites.add(event);
    
    // Save to preferences
    final jsonList = favorites.map((e) => e.toJson()).toList();
    return await _prefs.setString(_favoriteDetailsKey, jsonEncode(jsonList));
  }
  
  // Remove an event from favorites
  Future<bool> removeFavorite(String eventId) async {
    final favorites = getFavoriteIds();
    var result = true;
    
    if (favorites.contains(eventId)) {
      favorites.remove(eventId);
      result = await _prefs.setStringList(_favoritesKey, favorites);
      
      // Also remove from details
      final detailsList = getFavorites();
      detailsList.removeWhere((event) => event.id == eventId);
      final jsonList = detailsList.map((e) => e.toJson()).toList();
      await _prefs.setString(_favoriteDetailsKey, jsonEncode(jsonList));
    }
    return result;
  }
  
  // Toggle favorite status
  Future<bool> toggleFavorite(String eventId, {EventSummary? event}) async {
    if (isFavorite(eventId)) {
      return await removeFavorite(eventId);
    } else {
      return await addFavorite(eventId, event: event);
    }
  }
  
  // Clear all favorites
  Future<bool> clearFavorites() async {
    return await _prefs.setStringList(_favoritesKey, []);
  }
}
