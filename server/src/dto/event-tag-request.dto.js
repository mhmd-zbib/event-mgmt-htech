const createEventTagRequestDto = (eventId, tagId) => {
  return {
    eventId,
    tagId
  };
};

const createBulkEventTagsRequestDto = (eventId, tagIds) => {
  if (!Array.isArray(tagIds)) {
    tagIds = [tagIds].filter(Boolean);
  }
  
  return tagIds.map(tagId => ({
    eventId,
    tagId
  }));
};

module.exports = {
  createEventTagRequestDto,
  createBulkEventTagsRequestDto
};