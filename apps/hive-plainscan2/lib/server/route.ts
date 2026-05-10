import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { safeErrorResponse } from "./errors";

export async function handleRoute<T>(handler: () => Promise<T>) {
  try {
    const result = await handler();
    if (result instanceof Response) return result;
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request.", code: "validation_failed" }, { status: 400 });
    }
    return safeErrorResponse(error);
  }
}
