const userService = require('../services/user.service');
const userRequestDto = require('../dto/user-request.dto');
const userResponseDto = require('../dto/user-response.dto');
const { formatItemResponse } = require('../utils/response-formatter');

class UserController {
  async getProfile(req, res, next) {
    const responseData = formatItemResponse(req.user, 'user');
    res.status(200).json(responseData);
  }

  async updateProfile(req, res, next) {
    const updateProfileDto = userRequestDto.createUpdateProfileDto(req.validatedData || req.body);
    
    const updatedUser = await userService.updateUser(req.user.id, updateProfileDto);
    
    const responseData = formatItemResponse(updatedUser, 'user');
    res.status(200).json(responseData);
  }
}

module.exports = new UserController();