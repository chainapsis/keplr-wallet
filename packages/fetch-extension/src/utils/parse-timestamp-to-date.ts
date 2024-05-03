export const parseTimestampToDate = (timestamp: string): string => {
  const date = new Date(parseInt(timestamp) / 1000000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  return `${day}/${month}/${year}`;
};

export function formatTimestamp(timestamp: string): string {
  const [datePart, timePart] = timestamp.split(", ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  const date = new Date(2000 + year, month - 1, day, hours, minutes);
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    month: "short",
    day: "numeric",
    hour12: false,
  };
  const formattedDate: string = new Intl.DateTimeFormat(
    "en-US",
    options
  ).format(date);
  return formattedDate;
}
