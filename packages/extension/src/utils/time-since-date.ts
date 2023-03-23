export function timeSince(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;

  if (interval >= 1) {
    return `${Math.floor(interval)} year${interval < 2 ? "" : "s"} ago`;
  }
  interval = seconds / 2592000;
  if (interval >= 1) {
    return `${Math.floor(interval)}  month${interval < 2 ? "" : "s"} ago`;
  }
  interval = seconds / 86400;
  if (interval >= 1) {
    return `${Math.floor(interval)}  day${interval < 2 ? "" : "s"} ago`;
  }
  interval = seconds / 3600;
  if (interval >= 1) {
    return `${Math.floor(interval)}  hour${interval < 2 ? "" : "s"} ago`;
  }
  interval = seconds / 60;
  if (interval >= 1) {
    return `${Math.floor(interval)}  min${interval < 2 ? "" : "s"} ago`;
  }
  return Math.abs(Math.ceil(seconds)) + " sec ago";
}
