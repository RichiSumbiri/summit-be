const generateCustomId = async (model, fieldName, prefix, whereCondition = {}) => {
  const lastRecord = await model.findOne({
    where: whereCondition,
    order: [[fieldName, "DESC"]],
    paranoid: false,
  });

  let nextId = prefix + "0000001";

  if (lastRecord) {
    const lastId = lastRecord[fieldName];
    const numericPart = parseInt(lastId.slice(prefix.length));
    const newNumber = numericPart + 1;
    const padded = newNumber.toString().padStart(7, "0");
    nextId = prefix + padded;
  }

  return nextId;
};

export default generateCustomId;

export const generateSequentialId = async (model, columnName, whereCondition = {}) => {
  const lastRecord = await model.findOne({
    where: whereCondition,
    order: [[columnName, "DESC"]],
    paranoid: false,
  });

  let nextId = 1;

  if (lastRecord) {
    const lastId = parseInt(lastRecord[columnName], 10);
    if (!isNaN(lastId)) {
      nextId = lastId + 1;
    }
  }

  return nextId;
};
