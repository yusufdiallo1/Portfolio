import { z } from "zod";

export const referralSubmitSchema = z.object({
  referrerName: z.string().trim().min(1, "Name is required"),
  referrerEmail: z.string().trim().email("Valid email required"),
  referredName: z.string().trim().min(1, "Friend's name is required"),
  referredEmail: z.string().trim().email("Valid friend email required"),
  message: z.string().trim().optional(),
});

export type ReferralSubmitInput = z.infer<typeof referralSubmitSchema>;
