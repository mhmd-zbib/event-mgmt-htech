import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/api_constants.dart';
import '../../domain/models/auth_models.dart';
import '../../domain/models/user.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final ApiClient _apiClient;
  final SharedPreferences _prefs;

  AuthRepositoryImpl(this._apiClient, this._prefs);

  @override
  Future<AuthResponse> login(LoginRequest request) async {
    final response = await _apiClient.post(
      ApiConstants.login,
      data: request.toJson(),
    );
    final authResponse = AuthResponse.fromJson(response);
    await saveAuthData(authResponse);
    return authResponse;
  }

  @override
  Future<void> logout() async {
    try {
      await _apiClient.post(ApiConstants.logout);
    } catch (e) {
      // Even if the API call fails, we still want to clear local data
    } finally {
      await clearAuthData();
    }
  }

  @override
  Future<AuthResponse> register(RegisterRequest request) async {
    final response = await _apiClient.post(
      ApiConstants.register,
      data: request.toJson(),
    );
    final authResponse = AuthResponse.fromJson(response);
    await saveAuthData(authResponse);
    return authResponse;
  }

  @override
  Future<TokenResponse> refreshToken(String refreshToken) async {
    final response = await _apiClient.post(
      ApiConstants.refreshToken,
      data: {'refreshToken': refreshToken},
    );
    final tokenResponse = TokenResponse.fromJson(response);
    
    // Update stored tokens
    await _prefs.setString('auth_token', tokenResponse.accessToken);
    await _prefs.setString('refresh_token', tokenResponse.refreshToken);
    
    return tokenResponse;
  }

  @override
  Future<void> forgotPassword(String email) async {
    await _apiClient.post(
      ApiConstants.forgotPassword,
      data: {'email': email},
    );
  }

  @override
  Future<void> resetPassword(ResetPasswordRequest request) async {
    await _apiClient.post(
      ApiConstants.resetPassword,
      data: request.toJson(),
    );
  }

  @override
  Future<User> getUserProfile() async {
    final response = await _apiClient.get(ApiConstants.userProfile);
    return User.fromJson(response['user']);
  }

  @override
  Future<bool> isLoggedIn() async {
    final token = _prefs.getString('auth_token');
    final refreshToken = _prefs.getString('refresh_token');
    final userJson = _prefs.getString('user');
    
    return token != null && refreshToken != null && userJson != null;
  }

  @override
  Future<void> saveAuthData(AuthResponse authResponse) async {
    await _prefs.setString('auth_token', authResponse.accessToken);
    await _prefs.setString('refresh_token', authResponse.refreshToken);
    await _prefs.setString('user', jsonEncode(authResponse.user.toJson()));
    await _prefs.setInt('token_expiry', DateTime.now().millisecondsSinceEpoch + (authResponse.expiresIn * 1000));
  }

  @override
  Future<void> clearAuthData() async {
    await _prefs.remove('auth_token');
    await _prefs.remove('refresh_token');
    await _prefs.remove('user');
    await _prefs.remove('token_expiry');
  }
  
  @override
  String? getAccessToken() {
    return _prefs.getString('auth_token');
  }
}
