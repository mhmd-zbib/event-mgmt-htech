const userService = require('../services/user.service');
const userResponseDto = require('../dto/user-response.dto');

class AdminController {
  async getAllUsers(req, res, next) {
    try {
      // Get all users from service
      const users = await userService.getAllUsers();
      
      // Create response DTO
      const responseDto = {
        message: 'Users retrieved successfully',
        count: users.length,
        users
      };
      
      // Send successful response
      res.status(200).json(responseDto);
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      
      // Get user by ID
      const user = await userService.getUserById(id);
      
      // Create response DTO
      const responseDto = userResponseDto.createUserProfileResponseDto(
        'User retrieved successfully',
        user
      );
      
      // Send successful response
      res.status(200).json(responseDto);
    } catch (err) {
      next(err);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      // Update user role
      const user = await userService.updateUserRole(id, role);
      
      // Create response DTO
      const responseDto = userResponseDto.createUserProfileResponseDto(
        'User role updated successfully',
        user
      );
      
      // Send successful response
      res.status(200).json(responseDto);
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      
      // Delete user
      await userService.deleteUser(id);
      
      // Send successful response
      res.status(200).json({
        message: 'User deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();