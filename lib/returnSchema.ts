import { z } from "zod";

export const returnRequestSchema = z.object({
  type: z.enum(["RETURN", "EXCHANGE"]),
  reason: z.string().trim().min(10, "Tell us a bit more about why").max(500),
});

export type ReturnRequestInput = z.infer<typeof returnRequestSchema>;
