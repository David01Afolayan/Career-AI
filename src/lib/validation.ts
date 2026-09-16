import { z } from "zod";

export const registrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
  matricNumber: z.string().trim().max(50).optional().or(z.literal("")),
  department: z.string().trim().max(100).optional().or(z.literal("")),
  level: z.coerce.number().int().refine((value) => [100, 200, 300, 400].includes(value)).optional(),
});

const nullableText = (max: number) =>
  z.preprocess(
    (value) => value === "" || value === undefined ? null : value,
    z.string().trim().max(max).nullable()
  );

const nullableNumber = (min: number, max: number, integer = false) =>
  z.preprocess(
    (value) => value === "" || value === undefined || value === null ? null : value,
    (integer ? z.coerce.number().int() : z.coerce.number()).min(min).max(max).nullable()
  );

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  department: z.string().trim().min(2).max(100),
  matricNumber: nullableText(50),
  level: z.preprocess(
    (value) => value === "" || value === undefined || value === null ? null : value,
    z.coerce.number().int().refine((level) => [100, 200, 300, 400].includes(level)).nullable()
  ),
  cgpa: nullableNumber(0, 5),
  interests: nullableText(500),
  experience: nullableText(2000),
  projects: nullableNumber(0, 1000, true),
  certifications: nullableNumber(0, 1000, true),
});

export const assessmentSubmitSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().min(1).max(100),
    selectedAnswer: z.number().int().min(0).max(5),
  })).min(1).max(100),
});
