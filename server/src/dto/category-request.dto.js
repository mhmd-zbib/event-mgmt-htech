const createCategoryRequestDto = (data) => {
  return {
    name: data.name,
    description: data.description
  };
};

const updateCategoryRequestDto = (data) => {
  const categoryData = {};
  
  if (data.name !== undefined) {
    categoryData.name = data.name;
  }
  
  if (data.description !== undefined) {
    categoryData.description = data.description;
  }
  
  return categoryData;
};

module.exports = {
  createCategoryRequestDto,
  updateCategoryRequestDto
};