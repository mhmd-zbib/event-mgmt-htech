import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';
import 'user.dart';

part 'auth_models.g.dart';

@JsonSerializable()
class RegisterRequest extends Equatable {
  final String email;
  final String password;
  final String firstName;
  final String lastName;

  const RegisterRequest({
    required this.email,
    required this.password,
    required this.firstName,
    required this.lastName,
  });

  factory RegisterRequest.fromJson(Map<String, dynamic> json) => _$RegisterRequestFromJson(json);
  
  Map<String, dynamic> toJson() => _$RegisterRequestToJson(this);

  @override
  List<Object> get props => [email, password, firstName, lastName];
}

@JsonSerializable()
class LoginRequest extends Equatable {
  final String email;
  final String password;

  const LoginRequest({
    required this.email,
    required this.password,
  });

  factory LoginRequest.fromJson(Map<String, dynamic> json) => _$LoginRequestFromJson(json);
  
  Map<String, dynamic> toJson() => _$LoginRequestToJson(this);

  @override
  List<Object> get props => [email, password];
}

@JsonSerializable()
class AuthResponse extends Equatable {
  final User user;
  final String accessToken;
  final String refreshToken;
  final String tokenType;
  final int expiresIn;

  const AuthResponse({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
    required this.tokenType,
    required this.expiresIn,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) => _$AuthResponseFromJson(json);
  
  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);

  @override
  List<Object> get props => [user, accessToken, refreshToken, tokenType, expiresIn];
}

@JsonSerializable()
class TokenResponse extends Equatable {
  final String accessToken;
  final String refreshToken;
  final String tokenType;
  final int expiresIn;

  const TokenResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.tokenType,
    required this.expiresIn,
  });

  factory TokenResponse.fromJson(Map<String, dynamic> json) => _$TokenResponseFromJson(json);
  
  Map<String, dynamic> toJson() => _$TokenResponseToJson(this);

  @override
  List<Object> get props => [accessToken, refreshToken, tokenType, expiresIn];
}

@JsonSerializable()
class ForgotPasswordRequest extends Equatable {
  final String email;

  const ForgotPasswordRequest({
    required this.email,
  });

  factory ForgotPasswordRequest.fromJson(Map<String, dynamic> json) => _$ForgotPasswordRequestFromJson(json);
  
  Map<String, dynamic> toJson() => _$ForgotPasswordRequestToJson(this);

  @override
  List<Object> get props => [email];
}

@JsonSerializable()
class ResetPasswordRequest extends Equatable {
  final String token;
  final String password;

  const ResetPasswordRequest({
    required this.token,
    required this.password,
  });

  factory ResetPasswordRequest.fromJson(Map<String, dynamic> json) => _$ResetPasswordRequestFromJson(json);
  
  Map<String, dynamic> toJson() => _$ResetPasswordRequestToJson(this);

  @override
  List<Object> get props => [token, password];
}
