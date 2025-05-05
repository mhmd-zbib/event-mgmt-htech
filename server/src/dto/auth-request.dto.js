
exports.createRegisterDto = (validatedData) => {
  return {
    email: validatedData.email,
    password: validatedData.password,
    firstName: validatedData.firstName,
    lastName: validatedData.lastName
  };
};

exports.createLoginDto = (validatedData) => {
  return {
    email: validatedData.email,
    password: validatedData.password
  };
};