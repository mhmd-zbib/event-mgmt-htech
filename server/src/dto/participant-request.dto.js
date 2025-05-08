const createParticipantRequestDto = (data) => {
  return {
    userId: data.userId,
    eventId: data.eventId,
    status: data.status || 'registered',
    notes: data.notes
  };
};

const updateParticipantRequestDto = (data) => {
  const participantData = {};
  
  if (data.status !== undefined) {
    participantData.status = data.status;
  }
  
  if (data.notes !== undefined) {
    participantData.notes = data.notes;
  }
  
  return participantData;
};

const bulkParticipantRequestDto = (data) => {
  return {
    eventId: data.eventId,
    userIds: Array.isArray(data.userIds) ? data.userIds : [],
    status: data.status || 'registered'
  };
};

module.exports = {
  createParticipantRequestDto,
  updateParticipantRequestDto,
  bulkParticipantRequestDto
};