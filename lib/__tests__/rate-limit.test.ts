import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const id = `test-${Date.now()}-allow`;
    const result = rateLimit(id, 10, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
    expect(result.limit).toBe(10);
    expect(result.reset).toBeInstanceOf(Date);
  });

  it("blocks requests exceeding limit", () => {
    const id = `test-${Date.now()}-block`;
    for (let i = 0; i < 10; i++) {
      rateLimit(id, 10, 60000);
    }
    const result = rateLimit(id, 10, 60000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("decrements remaining correctly", () => {
    const id = `test-${Date.now()}-decrement`;
    for (let i = 0; i < 5; i++) {
      rateLimit(id, 10, 60000);
    }
    const result = rateLimit(id, 10, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("resets after window expires", () => {
    const id = `test-${Date.now()}-reset`;
    // Use 1ms window so it expires immediately
    rateLimit(id, 1, 1);
    // Small delay to ensure window expires
    const start = Date.now();
    while (Date.now() - start < 5) {} // busy wait 5ms
    const result = rateLimit(id, 1, 1);
    expect(result.success).toBe(true);
  });

  it("tracks different identifiers independently", () => {
    const ts = Date.now();
    const id1 = `user-a-${ts}`;
    const id2 = `user-b-${ts}`;

    // Exhaust id1
    for (let i = 0; i < 3; i++) rateLimit(id1, 3, 60000);
    expect(rateLimit(id1, 3, 60000).success).toBe(false);

    // id2 should still work
    expect(rateLimit(id2, 3, 60000).success).toBe(true);
  });
});
