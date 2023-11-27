import {FormatRelativeTimeOptions, IntlShape} from 'react-intl';

export function formatRelativeTime(time: string): {
  unit: 'minute' | 'hour' | 'day';
  value: number;
} {
  const remaining = new Date(time).getTime() - Date.now();
  if (remaining <= 0) {
    return {
      unit: 'minute',
      value: 1,
    };
  }

  const remainingSeconds = remaining / 1000;
  const remainingMinutes = remainingSeconds / 60;
  if (remainingMinutes < 1) {
    return {
      unit: 'minute',
      value: 1,
    };
  }

  const remainingHours = remainingMinutes / 60;
  const remainingDays = remainingHours / 24;

  if (remainingDays >= 1) {
    return {
      unit: 'day',
      value: Math.ceil(remainingDays),
    };
  }

  if (remainingHours >= 1) {
    return {
      unit: 'hour',
      value: Math.ceil(remainingHours),
    };
  }

  return {
    unit: 'minute',
    value: Math.ceil(remainingMinutes),
  };
}

export function formatRelativeTimeString(
  intl: IntlShape,
  dateStr: string,
  opts?: FormatRelativeTimeOptions,
): string {
  const {unit, value} = formatRelativeTime(dateStr);
  const result = intl.formatRelativeTime(value, unit, opts);
  return result.includes('in') ? result.replace('in ', '') + ' left' : result;
}
