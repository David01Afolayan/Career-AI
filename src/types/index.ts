export type UserRole = "STUDENT" | "ADMIN" | "MENTOR";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface CareerProfile {
  id: number;
  title: string;
  category: string;
  description: string;
  requiredSkills: string[];
  salaryRange?: string;
}

export interface SkillTrack {
  id: number;
  name: string;
  level: number;
  category: string;
}
