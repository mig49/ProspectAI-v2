import { z } from "zod";

export const searchParamsSchema = z.object({
  icp: z.string().min(1).max(2000),
  service: z.string().min(1).max(2000),
  state: z.string().min(1).max(100),
  city: z.string().max(100).default(""),
});

export const reportParamsSchema = z.object({
  leadId: z.string().min(1),
  lead: z.object({
    name: z.string(),
    address: z.string(),
    rating: z.number().nullable().optional(),
    userRatingCount: z.number().nullable().optional(),
    websiteUri: z.string().nullable().optional(),
    nationalPhoneNumber: z.string().nullable().optional(),
    types: z.array(z.string()).optional(),
    reviews: z.array(z.any()).optional(),
  }),
  service: z.string().min(1),
});

export const leadSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string().default(""),
  city: z.string().default(""),
  state: z.string().default(""),
  rating: z.number().nullable().default(null),
  userRatingCount: z.number().nullable().default(0),
  primaryType: z.string().default(""),
  nationalPhoneNumber: z.string().nullable().optional(),
  websiteUri: z.string().nullable().optional(),
  googleMapsUri: z.string().nullable().optional(),
  digitalPainScore: z.number().default(0),
  aiSummary: z.string().default(""),
});

export const leadsArraySchema = z.array(leadSchema);
