import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(5).max(30),
  password: z.string().min(7).max(20)
});

export const LoginSchema = z.object({
  email: z.string().min(5).max(30),
  password: z.string().min(7).max(20)
});
