import { createPublicSupabaseClient } from "@/lib/supabase";

export type PricingTier = {
  id: string;
  name: string;
  price: string;
  billingPeriod: string;
  description: string;
  features: string[];
  highlighted: boolean;
  fullScope?: string;
};

const FALLBACK: PricingTier[] = [
  {
    id: "fallback-starter",
    name: "Starter",
    price: "$499",
    billingPeriod: "project",
    description: "Landing Page or Simple App",
    features: [
      "1 page",
      "Fully responsive",
      "3-day delivery",
      "1 revision round",
      "Deployed to Vercel",
    ],
    highlighted: false,
    fullScope: "A professional single-page landing page optimized for conversions. Includes SEO optimization, lightning-fast performance, and a custom contact form. Perfect for startups or individual projects needing a quick, high-quality web presence.",
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
    fullScope: "A complete multipage web application with user authentication and database integration. Features include a custom administrative dashboard, real-time data sync, and integration with third-party services. Ideal for businesses scaling their operations.",
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
      "5 revision rounds",
    ],
    highlighted: false,
    fullScope: "The ultimate solution for high-growth SaaS platforms. Includes everything in Pro, plus advanced AI feature integrations (LLMs, computer vision), end-to-end payment processing with Stripe, and deep analytics. Unlimited scalability and high-performance infrastructure.",
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
  
  // Custom logic for Elite and Starter modifications as requested
  let finalFeatures = [...features];
  if (name.toLowerCase().includes("elite")) {
    finalFeatures = finalFeatures.map(f => f.toLowerCase().includes("revision") ? "5 revision rounds" : f);
  }
  if (name.toLowerCase().includes("starter")) {
    finalFeatures = finalFeatures.filter(f => !f.toLowerCase().includes("1 feature"));
  }

  return {
    id,
    name,
    price,
    billingPeriod,
    description,
    features: finalFeatures,
    highlighted,
    fullScope: (row.full_scope as string) || (FALLBACK.find(f => f.name === name)?.fullScope) || "",
  };
}

export async function fetchPortfolioPricing(): Promise<PricingTier[]> {
  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return FALLBACK;
    const { data, error } = await supabase
      .from("pricing")
      .select("id, name, price, billing_period, description, features, highlighted, sort_order, full_scope")
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
