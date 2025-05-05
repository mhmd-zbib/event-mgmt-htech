const authService = require('../services/auth.service');
const authRequestDto = require('../dto/auth-request.dto');
const authResponseDto = require('../dto/auth-response.dto');
const { formatMessageResponse } = require('../utils/response-formatter');

class AuthController {
  async register(req, res, next) {
    const registerDto = authRequestDto.createRegisterDto(req.validatedData || req.body);
    const result = await authService.register(registerDto);    
    
    const responseData = {
      message: 'User registered successfully',
      ...authResponseDto.createAuthResponseDto(result.user, result.token)
    };
    
    res.status(201).json(responseData);
  }

  async login(req, res, next) {
    const loginDto = authRequestDto.createLoginDto(req.validatedData || req.body);
    const result = await authService.login(loginDto);
    
    const responseData = {
      message: 'Login successful',
      ...authResponseDto.createAuthResponseDto(result.user, result.token)
    };
    
    res.status(200).json(responseData);
  }
  
  async refreshToken(req, res, next) {
    const { refreshToken } = req.validatedData || req.body;
    const result = await authService.refreshToken(refreshToken);
    
    const responseData = {
      message: 'Token refreshed successfully',
      ...authResponseDto.createAuthResponseDto(result.user, result.token)
    };
    
    res.status(200).json(responseData);
  }
}

module.exports = new AuthController();