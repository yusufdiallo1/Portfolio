import { createPublicSupabaseClient, createServiceClient } from "@/lib/supabase";

export type AvailabilityStatus = "available" | "busy" | "unavailable";

export type AvailabilityPublicConfig = {
  /** Banner should render (visibility flag is true). */
  showBanner: boolean;
  status: AvailabilityStatus;
  /** Custom message when status is `available`. */
  message: string;
  calendlyUrl: string;
};

const DEFAULTS: AvailabilityPublicConfig = {
  showBanner: true,
  status: "available",
  message: "Available for projects · Next slot: May 2026",
  calendlyUrl: "https://calendly.com/yusufcreates",
};

const KEYS = {
  visible: "availability_visible",
  status: "availability_status",
  message: "availability_message",
  calendly: "calendly_url",
} as const;

function parseBool(v: string | undefined, fallback: boolean): boolean {
  if (v === undefined) return fallback;
  return v === "true" || v === "1";
}

function parseStatus(v: string | undefined): AvailabilityStatus {
  if (v === "busy" || v === "unavailable") return v;
  return "available";
}

/**
 * Public read for portfolio (anon RLS). Safe defaults if table missing.
 */
export async function fetchAvailabilityConfig(): Promise<AvailabilityPublicConfig> {
  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return DEFAULTS;

    const { data, error } = await supabase.from("site_config").select("key, value");
    if (error || !data?.length) return DEFAULTS;

    const map = Object.fromEntries(data.map((r) => [r.key, r.value as string]));

    return {
      showBanner: parseBool(map[KEYS.visible], DEFAULTS.showBanner),
      status: parseStatus(map[KEYS.status]),
      message: map[KEYS.message]?.trim() || DEFAULTS.message,
      calendlyUrl: map[KEYS.calendly]?.trim() || DEFAULTS.calendlyUrl,
    };
  } catch {
    return DEFAULTS;
  }
}

export type SiteConfigRow = { key: string; value: string };

/**
 * Dashboard: load all site_config rows (service role).
 */
export async function fetchSiteConfigForDashboard(): Promise<Record<string, string>> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("site_config").select("key, value");
    if (error || !data) return {};
    return Object.fromEntries(data.map((r) => [r.key, r.value as string]));
  } catch {
    return {};
  }
}

export function mapRawToAvailabilityForm(raw: Record<string, string>) {
  return {
    availabilityVisible: parseBool(raw[KEYS.visible], true),
    availabilityStatus: parseStatus(raw[KEYS.status]),
    availabilityMessage: raw[KEYS.message] ?? DEFAULTS.message,
    calendlyUrl: raw[KEYS.calendly] ?? "",
  };
}

export { KEYS as SITE_CONFIG_KEYS };
