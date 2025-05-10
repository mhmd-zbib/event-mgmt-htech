import 'package:equatable/equatable.dart';
import '../../domain/models/user.dart';

enum AuthStatus {
  initial,
  authenticated,
  unauthenticated,
  loading,
  error,
}

class AuthState extends Equatable {
  final AuthStatus status;
  final User? user;
  final String? errorMessage;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.errorMessage,
  });

  bool get isAuthenticated => status == AuthStatus.authenticated;
  bool get isLoading => status == AuthStatus.loading;
  bool get hasError => status == AuthStatus.error;

  AuthState copyWith({
    AuthStatus? status,
    User? user,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  factory AuthState.initial() => const AuthState(status: AuthStatus.initial);
  
  factory AuthState.loading() => const AuthState(status: AuthStatus.loading);
  
  factory AuthState.authenticated(User user) => AuthState(
    status: AuthStatus.authenticated,
    user: user,
  );
  
  factory AuthState.unauthenticated() => const AuthState(
    status: AuthStatus.unauthenticated,
  );
  
  factory AuthState.error(String message) => AuthState(
    status: AuthStatus.error,
    errorMessage: message,
  );

  @override
  List<Object?> get props => [status, user, errorMessage];
}
