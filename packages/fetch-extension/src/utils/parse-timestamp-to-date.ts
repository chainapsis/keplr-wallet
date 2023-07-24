export const parseTimestampToDate = (timestamp: string): string => {
  const date = new Date(parseInt(timestamp) / 1000000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  return `${day}/${month}/${year}`;
};
