const createEventRequestDto = (data) => {
  return {
    title: data.title,
    description: data.description,
    location: data.location,
    startDate: data.startDate,
    endDate: data.endDate,
    categoryId: data.categoryId,
    tagIds: data.tagIds || []
  };
};

const updateEventRequestDto = (data) => {
  const eventData = {};
  
  if (data.title !== undefined) {
    eventData.title = data.title;
  }
  
  if (data.description !== undefined) {
    eventData.description = data.description;
  }
  
  if (data.location !== undefined) {
    eventData.location = data.location;
  }
  
  if (data.startDate !== undefined) {
    eventData.startDate = data.startDate;
  }
  
  if (data.endDate !== undefined) {
    eventData.endDate = data.endDate;
  }
  
  if (data.categoryId !== undefined) {
    eventData.categoryId = data.categoryId;
  }
  
  if (data.tagIds !== undefined) {
    eventData.tagIds = data.tagIds;
  }
  
  return eventData;
};

module.exports = {
  createEventRequestDto,
  updateEventRequestDto
};