export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    // hour: "numeric",
    // minute: "numeric",
    // second: "numeric",
    month: "short",
    day: "numeric",
    year: "numeric",
    // hour12: false,
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}
