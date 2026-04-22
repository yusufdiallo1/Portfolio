import { redirect } from "next/navigation";

/**
 * /hire has no dedicated page — the hire form lives at /#hire.
 * This server component handles the redirect instantly.
 */
export default function HireShortcutPage() {
  redirect("/#hire");
}
