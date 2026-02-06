export class ApiError extends Error {
  status: number | undefined;
  code: string | undefined;

  constructor(
    message: string,
    opts?: { status?: number; code?: string; cause?: unknown }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = opts?.status;
    this.code = opts?.code;
    if (opts?.cause) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).cause = opts.cause;
    }
  }
}

export function isForbiddenError(err: unknown) {
  if (err instanceof ApiError) {
    return err.status === 403 || err.code === '42501';
  }
  return false;
}

