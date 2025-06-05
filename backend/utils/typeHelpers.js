const ensureString = (value) => {
  if (value === undefined || value === null) return '';
  return String(value);
};

const ensureNumber = (value) => {
  if (value === undefined || value === null) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

module.exports = { ensureString, ensureNumber };