import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "request_failed"
  ) {
    super(message);
  }
}

export function safeErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }

  return NextResponse.json({ error: "Request could not be completed.", code: "internal_error" }, { status: 500 });
}

export function assertFound<T>(value: T | null | undefined, message = "Resource not found.") {
  if (!value) throw new ApiError(404, message, "not_found");
  return value;
}
