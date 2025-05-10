class ApiConstants {
  // Base URL
  static const String baseUrl = 'http://localhost:3000/api';
  
  // Auth endpoints
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh-token';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  
  // Events endpoints
  static const String events = '/events';
  static const String eventById = '/events/'; // Append ID
  static const String featuredEvents = '/events/featured';
  static const String upcomingEvents = '/events/upcoming';
  static const String eventTags = '/events/'; // Append ID + '/tags'
  static const String eventParticipants = '/events/'; // Append ID + '/participants'
  
  // Categories endpoints
  static const String categories = '/categories';
  static const String categoryById = '/categories/'; // Append ID
  
  // Tags endpoints
  static const String tags = '/tags';
  static const String tagById = '/tags/'; // Append ID
  
  // User endpoints
  static const String users = '/users';
  static const String userById = '/users/'; // Append ID
  static const String userProfile = '/users/profile';
  static const String userEvents = '/users/events';
  
  // Participants endpoints
  static const String participants = '/participants';
  static const String participantById = '/participants/'; // Append ID
}
