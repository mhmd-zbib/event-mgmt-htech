const userService = require('../services/user.service');
const userRequestDto = require('../dto/user-request.dto');
const userResponseDto = require('../dto/user-response.dto');

class UserController {
  async getProfile(req, res, next) {
    try {
      // Create response DTO using user from request (set by auth middleware)
      const responseDto = userResponseDto.createUserProfileResponseDto(
        'Profile retrieved successfully',
        req.user
      );
      
      // Send successful response
      res.status(200).json(responseDto);
    } catch (err) {
      // Just pass the error to the global error handler
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      // Create DTO from validated data
      const updateProfileDto = userRequestDto.createUpdateProfileDto(req.validatedData || req.body);
      
      // Update user via service
      const updatedUser = await userService.updateUser(req.user.id, updateProfileDto);
      
      // Create response DTO
      const responseDto = userResponseDto.createUserProfileResponseDto(
        'Profile updated successfully',
        updatedUser
      );
      
      // Send successful response
      res.status(200).json(responseDto);
    } catch (err) {
      // Just pass the error to the global error handler
      next(err);
    }
  }
}

module.exports = new UserController();