export const getPagination = (page, limit) => {
  if (!page || !limit) return {};
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  return {
    limit: parsedLimit,
    offset: (parsedPage - 1) * parsedLimit,
  };
};

export const getRawPagination = (page, limit) => {
  if (!page || !limit) return "";
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  return ` LIMIT ${parsedLimit} OFFSET ${(parsedPage - 1) * parsedLimit} `;
};

export const dynamicCreateDeleteAction = async ({
  parentId,
  userId,
  payload,
  model,
  whereKeys,
  parentKey = "RM_LAB_STRIKE_ID",
}) => {
  const existing = await model.findAll({
    where: { [parentKey]: parentId },
    raw: true,
  });

  const payloadMap = new Map(
    payload.map((item) => [whereKeys.map((key) => item[key]).join("_"), item])
  );
  const existingMap = new Map(
    existing.map((item) => [whereKeys.map((key) => item[key]).join("_"), item])
  );

  // Create missing rows
  for (const [key, item] of payloadMap) {
    if (!existingMap.has(key)) {
      await model.create({
        ...item,
        [parentKey]: parentId,
        CREATED_BY: userId,
        UPDATED_BY: userId,
      });
    }
  }

  // Delete rows not in payload
  for (const [key, item] of existingMap) {
    if (!payloadMap.has(key)) {
      await model.update(
        {
          DELETED_BY: userId,
          DELETED_AT: new Date(),
        },
        {
          where: {
            [parentKey]: parentId,
            ...whereKeys.reduce((acc, k) => {
              acc[k] = item[k];
              return acc;
            }, {}),
          },
        }
      );
    }
  }
};
