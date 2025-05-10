import '../models/auth_models.dart';
import '../models/user.dart';

abstract class AuthRepository {
  Future<AuthResponse> login(LoginRequest request);
  Future<void> logout();
  Future<AuthResponse> register(RegisterRequest request);
  Future<TokenResponse> refreshToken(String refreshToken);
  Future<void> forgotPassword(String email);
  Future<void> resetPassword(ResetPasswordRequest request);
  Future<User> getUserProfile();
  Future<bool> isLoggedIn();
  Future<void> saveAuthData(AuthResponse authResponse);
  Future<void> clearAuthData();
  String? getAccessToken();
}
