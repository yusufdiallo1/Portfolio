import type { Json } from "./json";

export type { Json };

export interface AdminCredentials {
  id: string;
  admin_id: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface AdminCredentialsInsert {
  admin_id: string;
  password_hash: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  tags: string[] | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProjectInsert {
  title: string;
  description?: string | null;
  url?: string | null;
  image_url?: string | null;
  tags?: string[] | null;
  featured?: boolean;
  sort_order?: number;
}

export interface ProjectUpdate extends Partial<ProjectInsert> {}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  billing_period: string;
  description: string | null;
  features: string[] | null;
  highlighted: boolean;
  sort_order: number;
}

export interface PricingPlanInsert {
  name: string;
  price: string;
  billing_period?: string;
  description?: string | null;
  features?: string[] | null;
  highlighted?: boolean;
  sort_order?: number;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  author_avatar: string | null;
  content: string;
  rating: number;
  approved: boolean;
  created_at: string;
}

export interface TestimonialInsert {
  author_name: string;
  author_role?: string | null;
  author_avatar?: string | null;
  content: string;
  rating?: number;
  approved?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ContactInsert {
  name: string;
  email: string;
  message: string;
}

export interface HireRequest {
  id: string;
  name: string;
  email: string;
  project_type: string | null;
  budget: string | null;
  timeline: string | null;
  description: string;
  tech_stack: string[] | null;
  status: string;
  created_at: string;
}

export interface HireRequestInsert {
  name: string;
  email: string;
  project_type?: string | null;
  budget?: string | null;
  timeline?: string | null;
  description: string;
  tech_stack?: string[] | null;
  status?: string;
}

export interface PageSection {
  id: string;
  section_key: string;
  visible: boolean;
  sort_order: number;
  custom_title: string | null;
}

export interface PageSectionInsert {
  section_key: string;
  visible?: boolean;
  sort_order?: number;
  custom_title?: string | null;
}

export interface PageSectionUpdate {
  visible?: boolean;
  sort_order?: number;
  custom_title?: string | null;
}

export interface AnalyticsEventRow {
  id: string;
  event: string;
  metadata: Json | null;
  ip_hash: string | null;
  created_at: string;
}

export interface AnalyticsEventInsert {
  event: string;
  metadata?: Json | null;
  ip_hash?: string | null;
}
