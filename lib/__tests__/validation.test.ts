import { describe, it, expect } from "vitest";
import {
  searchParamsSchema,
  reportParamsSchema,
  leadSchema,
} from "@/lib/validation";

describe("searchParamsSchema", () => {
  it("accepts valid input", () => {
    const result = searchParamsSchema.safeParse({
      icp: "restaurantes",
      service: "chatbot AI",
      state: "Lisboa",
      city: "Sintra",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty city (defaults to empty string)", () => {
    const result = searchParamsSchema.safeParse({
      icp: "restaurantes",
      service: "chatbot AI",
      state: "Lisboa",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.city).toBe("");
    }
  });

  it("rejects missing icp", () => {
    const result = searchParamsSchema.safeParse({
      service: "chatbot AI",
      state: "Lisboa",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing service", () => {
    const result = searchParamsSchema.safeParse({
      icp: "restaurantes",
      state: "Lisboa",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing state", () => {
    const result = searchParamsSchema.safeParse({
      icp: "restaurantes",
      service: "chatbot AI",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty icp", () => {
    const result = searchParamsSchema.safeParse({
      icp: "",
      service: "chatbot AI",
      state: "Lisboa",
    });
    expect(result.success).toBe(false);
  });
});

describe("reportParamsSchema", () => {
  const validLead = {
    name: "Restaurante Lisboa",
    address: "Rua Augusta 1",
  };

  it("accepts valid input", () => {
    const result = reportParamsSchema.safeParse({
      leadId: "lead-123",
      lead: validLead,
      service: "chatbot AI",
    });
    expect(result.success).toBe(true);
  });

  it("accepts lead with optional fields", () => {
    const result = reportParamsSchema.safeParse({
      leadId: "lead-456",
      lead: {
        ...validLead,
        rating: 4.5,
        userRatingCount: 120,
        websiteUri: "https://example.com",
        nationalPhoneNumber: "+351 123 456 789",
        types: ["restaurant", "food"],
        reviews: [{ rating: 5, text: { text: "Great!" } }],
      },
      service: "chatbot AI",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing leadId", () => {
    const result = reportParamsSchema.safeParse({
      lead: validLead,
      service: "chatbot AI",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty leadId", () => {
    const result = reportParamsSchema.safeParse({
      leadId: "",
      lead: validLead,
      service: "chatbot AI",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing lead", () => {
    const result = reportParamsSchema.safeParse({
      leadId: "lead-123",
      service: "chatbot AI",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing service", () => {
    const result = reportParamsSchema.safeParse({
      leadId: "lead-123",
      lead: validLead,
    });
    expect(result.success).toBe(false);
  });
});

describe("leadSchema", () => {
  it("accepts valid lead with all fields", () => {
    const result = leadSchema.safeParse({
      id: "abc-123",
      name: "Restaurante Lisboa",
      address: "Rua Augusta 1",
      city: "Lisboa",
      state: "Lisboa",
      rating: 4.5,
      userRatingCount: 120,
      primaryType: "restaurant",
      digitalPainScore: 75,
      aiSummary: "Bom lead para AI",
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults for optional fields", () => {
    const result = leadSchema.safeParse({
      id: "abc-123",
      name: "Test",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.address).toBe("");
      expect(result.data.city).toBe("");
      expect(result.data.rating).toBeNull();
      expect(result.data.digitalPainScore).toBe(0);
      expect(result.data.aiSummary).toBe("");
    }
  });

  it("rejects missing id", () => {
    const result = leadSchema.safeParse({
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = leadSchema.safeParse({
      id: "abc-123",
    });
    expect(result.success).toBe(false);
  });
});
