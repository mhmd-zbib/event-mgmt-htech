const createTagRequestDto = (data) => {
  return {
    name: data.name,
    description: data.description
  };
};

const updateTagRequestDto = (data) => {
  const tagData = {};
  
  if (data.name !== undefined) {
    tagData.name = data.name;
  }
  
  if (data.description !== undefined) {
    tagData.description = data.description;
  }
  
  return tagData;
};

module.exports = {
  createTagRequestDto,
  updateTagRequestDto
};