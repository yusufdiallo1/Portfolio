import { createPublicSupabaseClient } from "@/lib/supabase";

export type PricingTier = {
  id: string;
  name: string;
  price: string;
  billingPeriod: string;
  description: string;
  features: string[];
  highlighted: boolean;
};

const FALLBACK: PricingTier[] = [
  {
    id: "fallback-starter",
    name: "Starter",
    price: "$499",
    billingPeriod: "project",
    description: "Landing Page or Simple App",
    features: [
      "1 page / single feature",
      "Fully responsive",
      "3-day delivery",
      "1 revision round",
      "Deployed to Vercel",
    ],
    highlighted: false,
  },
  {
    id: "fallback-pro",
    name: "Pro",
    price: "$1,299",
    billingPeriod: "project",
    description: "Full Web Application",
    features: [
      "Up to 5 pages",
      "Supabase database + auth",
      "API integrations",
      "Custom dashboard",
      "7-day delivery",
      "3 revision rounds",
    ],
    highlighted: true,
  },
  {
    id: "fallback-elite",
    name: "Elite",
    price: "$2,499",
    billingPeriod: "project",
    description: "Full Stack SaaS Platform",
    features: [
      "Complete platform build",
      "AI feature integration",
      "Payments (Stripe)",
      "Analytics dashboard",
      "14-day delivery",
      "Unlimited revisions",
    ],
    highlighted: false,
  },
];

function mapRow(row: Record<string, unknown>): PricingTier | null {
  const name = row.name;
  const price = row.price;
  if (typeof name !== "string" || typeof price !== "string") return null;
  const id = typeof row.id === "string" ? row.id : name;
  const billingPeriod =
    typeof row.billing_period === "string" && row.billing_period.length
      ? row.billing_period
      : "project";
  const description =
    typeof row.description === "string" ? row.description : "";
  const features = Array.isArray(row.features)
    ? (row.features as unknown[]).map(String)
    : [];
  const highlighted = Boolean(row.highlighted);

  return {
    id,
    name,
    price,
    billingPeriod,
    description,
    features,
    highlighted,
  };
}

export async function fetchPortfolioPricing(): Promise<PricingTier[]> {
  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return FALLBACK;
    const { data, error } = await supabase
      .from("pricing")
      .select("id, name, price, billing_period, description, features, highlighted, sort_order")
      .order("sort_order", { ascending: true, nullsFirst: false });

    if (error) return FALLBACK;
    if (!data?.length) return FALLBACK;

    const mapped = data
      .map((row) => mapRow(row as Record<string, unknown>))
      .filter((p): p is PricingTier => Boolean(p));

    return mapped.length ? mapped : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
