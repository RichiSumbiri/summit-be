export const successResponse = (res, data, message = "", code = 200) => {
  return res.status(code).json({
    success: true,
    code: code,
    message: message,
    data: data ?? null,
  });
};

export const errorResponse = (res, error, message = "Error", code = 500) => {
  let parsedError = null;

  if (typeof error === "string") {
    parsedError = error;
  } else if (error?.message) {
    parsedError = error.message;
  } else if (error) {
    parsedError = error.toString();
  }

  return res.status(code).json({
    success: false,
    code,
    message,
    error: parsedError,
  });
};
