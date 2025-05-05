const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const { UnauthorizedError, NotFoundError } = require('../errors/HttpErrors');

/**
 * Authentication middleware
 * Verifies the JWT token and attaches the user to the request
 */
module.exports = async (req, res, next) => {
  try {
    // Check if Authorization header exists and has the correct format
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Extract and verify the token
    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);
    
    // Get the user from the database
    const user = await userService.getUserById(decoded.id);
    
    // Check if user exists
    if (!user) {
      return next(new NotFoundError('User no longer exists'));
    }
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    // JWT verification errors will be caught here
    next(new UnauthorizedError('Invalid or expired token'));
  }
};