import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RateLimitRecord = { count: number; resetTime: number };

const requests = new Map<string, RateLimitRecord>();

export function rateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const record = requests.get(identifier);

  if (!record || now > record.resetTime) {
    requests.set(identifier, { count: 1, resetTime: now + windowMs });
    return {
      success: true,
      remaining: limit - 1,
      reset: new Date(now + windowMs),
      limit,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: new Date(record.resetTime),
      limit,
    };
  }

  record.count++;
  return {
    success: true,
    remaining: limit - record.count,
    reset: new Date(record.resetTime),
    limit,
  };
}

export async function getRateLimitIdentifier(request: NextRequest): Promise<string> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return `user:${user.id}`;
  } catch {
    // fallback to IP
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `ip:${ip}`;
}

export function rateLimitHeaders(result: { limit: number; remaining: number; reset: Date }) {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toISOString(),
  };
}
