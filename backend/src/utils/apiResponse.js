export const successResponse = (res, data, message = "Success") => {
  res.json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message, status = 400) => {
  res.status(status).json({
    success: false,
    message
  });
};