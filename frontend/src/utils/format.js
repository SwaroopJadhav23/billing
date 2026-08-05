export const currency = (value = 0) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(value);

export const dateTime = (value) => value ? new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(new Date(value)) : '-';

export const roleLabel = (role = '') => role.split('_').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' ');
