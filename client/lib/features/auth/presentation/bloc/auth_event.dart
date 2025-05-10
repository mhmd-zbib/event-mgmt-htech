import 'package:equatable/equatable.dart';
import '../../domain/models/auth_models.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AppStarted extends AuthEvent {
  const AppStarted();
}

class LoginRequested extends AuthEvent {
  final LoginRequest loginRequest;

  const LoginRequested(this.loginRequest);

  @override
  List<Object> get props => [loginRequest];
}

class RegisterRequested extends AuthEvent {
  final RegisterRequest registerRequest;

  const RegisterRequested(this.registerRequest);

  @override
  List<Object> get props => [registerRequest];
}

class LogoutRequested extends AuthEvent {
  const LogoutRequested();
}

class ForgotPasswordRequested extends AuthEvent {
  final String email;

  const ForgotPasswordRequested(this.email);

  @override
  List<Object> get props => [email];
}

class ResetPasswordRequested extends AuthEvent {
  final ResetPasswordRequest resetPasswordRequest;

  const ResetPasswordRequested(this.resetPasswordRequest);

  @override
  List<Object> get props => [resetPasswordRequest];
}

class GetUserProfileRequested extends AuthEvent {
  const GetUserProfileRequested();
}

class RefreshTokenRequested extends AuthEvent {
  final String refreshToken;

  const RefreshTokenRequested(this.refreshToken);

  @override
  List<Object> get props => [refreshToken];
}
