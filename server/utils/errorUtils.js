const createError = (status, message, error) => {
  const err = new Error(message);
  err.status = status;
  err.originalError = error;
  return err;
};

module.exports = {
  createError
};
