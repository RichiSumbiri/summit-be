export const getPagination = (page, limit) => {
  if (!page || !limit) return {};
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  return {
    limit: parsedLimit,
    offset: (parsedPage - 1) * parsedLimit,
  };
};
