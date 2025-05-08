const updateUserRoleRequestDto = (data) => {
  return {
    role: data.role
  };
};

const updateSystemConfigRequestDto = (data) => {
  const configData = {};
  
  if (data.maintenanceMode !== undefined) {
    configData.maintenanceMode = data.maintenanceMode;
  }
  
  if (data.maxLoginAttempts !== undefined) {
    configData.maxLoginAttempts = data.maxLoginAttempts;
  }
  
  if (data.sessionTimeoutMinutes !== undefined) {
    configData.sessionTimeoutMinutes = data.sessionTimeoutMinutes;
  }
  
  return configData;
};

module.exports = {
  updateUserRoleRequestDto,
  updateSystemConfigRequestDto
};