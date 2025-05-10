import 'dart:async';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';
import '../errors/api_error.dart';

class ApiClient {
  final Dio _dio;
  final SharedPreferences _prefs;

  // Lock to prevent multiple token refresh requests
  final _tokenRefreshLock = Completer<void>();
  bool _isRefreshing = false;

  ApiClient(this._dio, this._prefs) {
    _dio.options.baseUrl = ApiConstants.baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 15);
    _dio.options.receiveTimeout = const Duration(seconds: 15);
    _dio.options.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add interceptors
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Add auth token to requests if available
          final token = _prefs.getString('auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          return handler.next(response);
        },
        onError: (DioException e, handler) async {
          // Check if error is due to token expiration
          if (e.response?.statusCode == 401 && !_isRefreshing) {
            // Get refresh token
            final refreshToken = _prefs.getString('refresh_token');
            
            if (refreshToken != null) {
              try {
                _isRefreshing = true;
                _tokenRefreshLock = Completer<void>();
                
                // Create a new Dio instance to avoid interceptors loop
                final tokenDio = Dio();
                tokenDio.options.baseUrl = _dio.options.baseUrl;
                
                // Request new tokens
                final response = await tokenDio.post(
                  ApiConstants.refreshToken,
                  data: {'refreshToken': refreshToken},
                );
                
                // Save new tokens
                final accessToken = response.data['accessToken'];
                final newRefreshToken = response.data['refreshToken'];
                
                await _prefs.setString('auth_token', accessToken);
                await _prefs.setString('refresh_token', newRefreshToken);
                
                // Update the original request with new token and retry
                e.requestOptions.headers['Authorization'] = 'Bearer $accessToken';
                
                // Complete the lock
                _isRefreshing = false;
                _tokenRefreshLock.complete();
                
                // Retry the original request
                final clonedRequest = await _dio.request(
                  e.requestOptions.path,
                  options: Options(
                    method: e.requestOptions.method,
                    headers: e.requestOptions.headers,
                  ),
                  data: e.requestOptions.data,
                  queryParameters: e.requestOptions.queryParameters,
                );
                
                return handler.resolve(clonedRequest);
              } catch (refreshError) {
                // If refresh fails, clear auth data and proceed with error
                _prefs.remove('auth_token');
                _prefs.remove('refresh_token');
                _prefs.remove('user');
                
                _isRefreshing = false;
                if (!_tokenRefreshLock.isCompleted) {
                  _tokenRefreshLock.complete();
                }
                
                return handler.next(_handleError(e));
              }
            }
          } else if (e.response?.statusCode == 401 && _isRefreshing) {
            // Wait for token refresh to complete and retry
            await _tokenRefreshLock.future;
            
            // Get new token
            final newToken = _prefs.getString('auth_token');
            if (newToken != null) {
              e.requestOptions.headers['Authorization'] = 'Bearer $newToken';
              
              // Retry the original request
              final clonedRequest = await _dio.request(
                e.requestOptions.path,
                options: Options(
                  method: e.requestOptions.method,
                  headers: e.requestOptions.headers,
                ),
                data: e.requestOptions.data,
                queryParameters: e.requestOptions.queryParameters,
              );
              
              return handler.resolve(clonedRequest);
            }
          }
          
          return handler.next(_handleError(e));
        },
      ),
    );
  }

  DioException _handleError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return DioException(
          requestOptions: error.requestOptions,
          error: ApiError(
            message: 'Connection timeout. Please check your internet connection.',
            statusCode: error.response?.statusCode,
          ),
          type: error.type,
        );
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        String message = 'Something went wrong. Please try again later.';
        
        if (statusCode == 401) {
          message = 'Unauthorized. Please login again.';
          // Handle token expiration
          _prefs.remove('auth_token');
          _prefs.remove('refresh_token');
        } else if (statusCode == 403) {
          message = 'You do not have permission to access this resource.';
        } else if (statusCode == 404) {
          message = 'Resource not found.';
        } else if (statusCode == 400) {
          message = error.response?.data['message'] ?? 'Invalid request.';
        } else if (statusCode == 500) {
          message = 'Server error. Please try again later.';
        }
        
        return DioException(
          requestOptions: error.requestOptions,
          error: ApiError(
            message: message,
            statusCode: statusCode,
            data: error.response?.data,
          ),
          type: error.type,
          response: error.response,
        );
      case DioExceptionType.cancel:
        return DioException(
          requestOptions: error.requestOptions,
          error: ApiError(
            message: 'Request was cancelled',
            statusCode: error.response?.statusCode,
          ),
          type: error.type,
        );
      case DioExceptionType.unknown:
        if (error.error.toString().contains('SocketException')) {
          return DioException(
            requestOptions: error.requestOptions,
            error: ApiError(
              message: 'No internet connection. Please check your network.',
              statusCode: error.response?.statusCode,
            ),
            type: error.type,
          );
        }
        return DioException(
          requestOptions: error.requestOptions,
          error: ApiError(
            message: 'An unexpected error occurred. Please try again later.',
            statusCode: error.response?.statusCode,
          ),
          type: error.type,
        );
      default:
        return DioException(
          requestOptions: error.requestOptions,
          error: ApiError(
            message: 'Something went wrong. Please try again later.',
            statusCode: error.response?.statusCode,
          ),
          type: error.type,
        );
    }
  }

  // Generic GET method
  Future<dynamic> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onReceiveProgress,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onReceiveProgress: onReceiveProgress,
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  // Generic POST method
  Future<dynamic> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
        onReceiveProgress: onReceiveProgress,
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  // Generic PUT method
  Future<dynamic> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    try {
      final response = await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
        onReceiveProgress: onReceiveProgress,
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  // Generic DELETE method
  Future<dynamic> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }
}
