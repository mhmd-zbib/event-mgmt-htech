const authService = require('../services/auth.service');
const authRequestDto = require('../dto/auth-request.dto');
const authResponseDto = require('../dto/auth-response.dto');

class AuthController {
  async register(req, res, next) {
    try {
      // Create DTO from validated data
      const registerDto = authRequestDto.createRegisterDto(req.validatedData || req.body);
      
      // Register user via service
      const result = await authService.register(registerDto);
      
      // Create response DTO
      const responseDto = authResponseDto.createAuthResponseDto(
        'User registered successfully',
        result.user,
        result.token
      );
      
      // Send successful response
      res.status(201).json(responseDto);
    } catch (err) {
      // Just pass the error to the global error handler
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      // Create DTO from validated data
      const loginDto = authRequestDto.createLoginDto(req.validatedData || req.body);
      
      // Login user via service
      const result = await authService.login(loginDto);
      
      // Create response DTO
      const responseDto = authResponseDto.createAuthResponseDto(
        'Login successful',
        result.user,
        result.token
      );
      
      // Send successful response
      res.status(200).json(responseDto);
    } catch (err) {
      // Just pass the error to the global error handler
      next(err);
    }
  }
}

module.exports = new AuthController();