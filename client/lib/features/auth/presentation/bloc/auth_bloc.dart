import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/auth_repository.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepository;

  AuthBloc(this._authRepository) : super(AuthState.initial()) {
    on<AppStarted>(_onAppStarted);
    on<LoginRequested>(_onLoginRequested);
    on<RegisterRequested>(_onRegisterRequested);
    on<LogoutRequested>(_onLogoutRequested);
    on<ForgotPasswordRequested>(_onForgotPasswordRequested);
    on<ResetPasswordRequested>(_onResetPasswordRequested);
    on<GetUserProfileRequested>(_onGetUserProfileRequested);
    on<RefreshTokenRequested>(_onRefreshTokenRequested);
  }

  Future<void> _onAppStarted(AppStarted event, Emitter<AuthState> emit) async {
    emit(AuthState.loading());
    try {
      final isLoggedIn = await _authRepository.isLoggedIn();
      if (isLoggedIn) {
        try {
          final user = await _authRepository.getUserProfile();
          emit(AuthState.authenticated(user));
        } catch (e) {
          // If getting user profile fails, we should log out
          await _authRepository.clearAuthData();
          emit(AuthState.unauthenticated());
        }
      } else {
        emit(AuthState.unauthenticated());
      }
    } catch (e) {
      emit(AuthState.unauthenticated());
    }
  }

  Future<void> _onLoginRequested(LoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthState.loading());
    try {
      final authResponse = await _authRepository.login(event.loginRequest);
      emit(AuthState.authenticated(authResponse.user));
    } catch (e) {
      emit(AuthState.error(e.toString()));
    }
  }

  Future<void> _onRegisterRequested(RegisterRequested event, Emitter<AuthState> emit) async {
    emit(AuthState.loading());
    try {
      final authResponse = await _authRepository.register(event.registerRequest);
      emit(AuthState.authenticated(authResponse.user));
    } catch (e) {
      emit(AuthState.error(e.toString()));
    }
  }

  Future<void> _onLogoutRequested(LogoutRequested event, Emitter<AuthState> emit) async {
    emit(AuthState.loading());
    try {
      await _authRepository.logout();
      emit(AuthState.unauthenticated());
    } catch (e) {
      emit(AuthState.error(e.toString()));
    }
  }

  Future<void> _onForgotPasswordRequested(
      ForgotPasswordRequested event, Emitter<AuthState> emit) async {
    emit(AuthState.loading());
    try {
      await _authRepository.forgotPassword(event.email);
      emit(state.copyWith(status: AuthStatus.unauthenticated));
    } catch (e) {
      emit(AuthState.error(e.toString()));
    }
  }

  Future<void> _onResetPasswordRequested(
      ResetPasswordRequested event, Emitter<AuthState> emit) async {
    emit(AuthState.loading());
    try {
      await _authRepository.resetPassword(event.resetPasswordRequest);
      emit(state.copyWith(status: AuthStatus.unauthenticated));
    } catch (e) {
      emit(AuthState.error(e.toString()));
    }
  }

  Future<void> _onGetUserProfileRequested(
      GetUserProfileRequested event, Emitter<AuthState> emit) async {
    if (state.status != AuthStatus.authenticated) return;
    
    try {
      final user = await _authRepository.getUserProfile();
      emit(state.copyWith(user: user));
    } catch (e) {
      // If there's an error getting the profile, we don't change the authentication state
      // Just keep the current user data
    }
  }

  Future<void> _onRefreshTokenRequested(
      RefreshTokenRequested event, Emitter<AuthState> emit) async {
    try {
      final tokenResponse = await _authRepository.refreshToken(event.refreshToken);
      // We don't change the state here as this is usually done in the background
    } catch (e) {
      // If token refresh fails, we should log out
      await _authRepository.clearAuthData();
      emit(AuthState.unauthenticated());
    }
  }
}
