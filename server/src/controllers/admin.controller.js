const userService = require('../services/user.service');
const userResponseDto = require('../dto/user-response.dto');
const adminRequestDto = require('../dto/admin-request.dto');
const { formatMessageResponse } = require('../utils/response-formatter');

class AdminController {
  async getAllUsers(req, res, next) {
    const result = await userService.getAllUsers(req.query);
    
    const responseData = userResponseDto.createUserListResponseDto(
      result.users,
      result.pagination,
      result.sort
    );
    
    res.status(200).json(responseData);
  }

  async getUserById(req, res, next) {
    const { id } = req.params;
    
    const user = await userService.getUserById(id);
    
    const responseData = userResponseDto.createUserProfileResponseDto(user);
    
    res.status(200).json(responseData);
  }

  async updateUserRole(req, res, next) {
    const { id } = req.params;
    const roleData = req.validatedData || req.body;
    
    const formattedData = adminRequestDto.updateUserRoleRequestDto(roleData);
    const user = await userService.updateUserRole(id, formattedData.role);
    
    const responseData = userResponseDto.createUserProfileResponseDto(user);
    
    res.status(200).json(responseData);
  }

  async deleteUser(req, res, next) {
    const { id } = req.params;
    
    await userService.deleteUser(id);
    
    const responseData = formatMessageResponse('User deleted successfully');
    
    res.status(200).json(responseData);
  }
}

module.exports = new AdminController();