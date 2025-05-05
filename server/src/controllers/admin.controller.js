const userService = require('../services/user.service');
const userResponseDto = require('../dto/user-response.dto');
const { formatPaginatedResponse, formatItemResponse, formatMessageResponse } = require('../utils/response-formatter');

class AdminController {
  async getAllUsers(req, res, next) {
    const result = await userService.getAllUsers(req.query);
    
    const responseData = formatPaginatedResponse(
      result.users,
      result.pagination,
      result.sort,
      userResponseDto.mapUserForList
    );
    
    res.status(200).json(responseData);
  }

  async getUserById(req, res, next) {
    const { id } = req.params;
    
    const user = await userService.getUserById(id);
    
    const responseData = formatItemResponse(user, 'user');
    
    res.status(200).json(responseData);
  }

  async updateUserRole(req, res, next) {
    const { id } = req.params;
    const { role } = req.body;
    
    const user = await userService.updateUserRole(id, role);
    
    const responseData = formatItemResponse(user, 'user');
    
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