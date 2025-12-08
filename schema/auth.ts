import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(5).max(30),
  password: z.string().min(7).max(20),
});

export const LoginSchema = z.object({
  email: z.string().min(5).max(30),
  password: z.string().min(7).max(20),
});

export const PostSchema = z.object({
  content: z
    .string()
    .min(1, "Post cannot be empty")
    .max(280, "cannot be longer than 280 words"),
});
