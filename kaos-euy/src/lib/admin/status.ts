export type StatusGroup = 'NEW' | 'IN_PROGRESS' | 'DONE';

export const ORDER_STATUSES = [
  'PENDING_CONFIRMATION',
  'PENDING_PAYMENT',
  'CONFIRMED',
  'IN_PRODUCTION',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
] as const;

export const CUSTOM_REQUEST_STATUSES = [
  'pending',
  'reviewing',
  'quoted',
  'accepted',
  'rejected',
  'completed',
] as const;

export const ORDER_STATUS_GROUPS: Record<StatusGroup, string[]> = {
  NEW: ['PENDING_CONFIRMATION', 'PENDING_PAYMENT'],
  IN_PROGRESS: ['CONFIRMED', 'IN_PRODUCTION', 'SHIPPED'],
  DONE: ['COMPLETED', 'CANCELLED'],
};

export const CUSTOM_REQUEST_STATUS_GROUPS: Record<StatusGroup, string[]> = {
  NEW: ['pending'],
  IN_PROGRESS: ['reviewing', 'quoted', 'accepted'],
  DONE: ['completed', 'rejected'],
};

export function mapOrderStatusToGroup(status: string): StatusGroup {
  if (ORDER_STATUS_GROUPS.NEW.includes(status)) return 'NEW';
  if (ORDER_STATUS_GROUPS.IN_PROGRESS.includes(status)) return 'IN_PROGRESS';
  return 'DONE';
}

export function mapCustomStatusToGroup(status: string): StatusGroup {
  if (CUSTOM_REQUEST_STATUS_GROUPS.NEW.includes(status)) return 'NEW';
  if (CUSTOM_REQUEST_STATUS_GROUPS.IN_PROGRESS.includes(status)) return 'IN_PROGRESS';
  return 'DONE';
}

export function resolveOrderStatusInput(input: string): string | null {
  if (input in ORDER_STATUS_GROUPS) {
    const group = input as StatusGroup;
    return group === 'NEW'
      ? 'PENDING_CONFIRMATION'
      : group === 'IN_PROGRESS'
      ? 'IN_PRODUCTION'
      : 'COMPLETED';
  }

  if (ORDER_STATUSES.includes(input as (typeof ORDER_STATUSES)[number])) {
    return input;
  }

  return null;
}

export function resolveCustomStatusInput(input: string): string | null {
  if (input in CUSTOM_REQUEST_STATUS_GROUPS) {
    const group = input as StatusGroup;
    return group === 'NEW'
      ? 'pending'
      : group === 'IN_PROGRESS'
      ? 'reviewing'
      : 'completed';
  }

  if (CUSTOM_REQUEST_STATUSES.includes(input as (typeof CUSTOM_REQUEST_STATUSES)[number])) {
    return input;
  }

  return null;
}

export function resolveOrderStatusFilter(input: string | null): string[] | null {
  if (!input || input === 'ALL') return null;
  if (input in ORDER_STATUS_GROUPS) {
    return ORDER_STATUS_GROUPS[input as StatusGroup];
  }
  if (ORDER_STATUSES.includes(input as (typeof ORDER_STATUSES)[number])) {
    return [input];
  }
  return null;
}

export function resolveCustomStatusFilter(input: string | null): string[] | null {
  if (!input || input === 'ALL') return null;
  if (input in CUSTOM_REQUEST_STATUS_GROUPS) {
    return CUSTOM_REQUEST_STATUS_GROUPS[input as StatusGroup];
  }
  if (CUSTOM_REQUEST_STATUSES.includes(input as (typeof CUSTOM_REQUEST_STATUSES)[number])) {
    return [input];
  }
  return null;
}

