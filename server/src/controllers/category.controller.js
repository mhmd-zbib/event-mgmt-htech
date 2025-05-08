const categoryService = require('../services/category.service');
const eventResponseDto = require('../dto/event-response.dto');
const categoryResponseDto = require('../dto/category-response.dto');
const categoryRequestDto = require('../dto/category-request.dto');
const { formatMessageResponse } = require('../utils/response-formatter');

class CategoryController {
  async getAllCategories(req, res, next) {
    const result = await categoryService.getAllCategories(req.query);
    
    const responseData = categoryResponseDto.createCategoryListResponseDto(
      result.categories,
      result.pagination,
      result.sort
    );
    
    res.status(200).json(responseData);
  }

  async getCategoryById(req, res, next) {
    const { id } = req.params;
    
    const category = await categoryService.getCategoryById(id);
    
    const responseData = categoryResponseDto.createCategoryDetailResponseDto(category);
    
    res.status(200).json(responseData);
  }

  async createCategory(req, res, next) {
    const categoryData = req.validatedData || req.body;
    const adminId = req.user.id;
    
    const formattedData = categoryRequestDto.createCategoryRequestDto(categoryData);
    const category = await categoryService.createCategory(formattedData, adminId);
    
    const responseData = categoryResponseDto.createCategoryDetailResponseDto(category);
    
    res.status(201).json(responseData);
  }

  async updateCategory(req, res, next) {
    const { id } = req.params;
    const categoryData = req.validatedData || req.body;
    const adminId = req.user.id;
    
    const formattedData = categoryRequestDto.updateCategoryRequestDto(categoryData);
    const category = await categoryService.updateCategory(id, formattedData, adminId);
    
    const responseData = categoryResponseDto.createCategoryDetailResponseDto(category);
    
    res.status(200).json(responseData);
  }

  async deleteCategory(req, res, next) {
    const { id } = req.params;
    const adminId = req.user.id;
    
    await categoryService.deleteCategory(id, adminId);
    
    const responseData = formatMessageResponse('Category deleted successfully');
    
    res.status(200).json(responseData);
  }

  async getEventsByCategory(req, res, next) {
    const { id } = req.params;
    
    const result = await categoryService.getEventsByCategoryId(id, req.query);
    
    const responseData = eventResponseDto.createEventListResponseDto(
      result.events,
      result.pagination,
      result.sort
    );
    
    res.status(200).json(responseData);
  }
}

module.exports = new CategoryController();