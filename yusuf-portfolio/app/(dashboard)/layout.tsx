import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { hasAdminCredentials } from "@/lib/admin-credentials";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get("x-pathname") ?? "";

  /**
   * If middleware didn't attach x-pathname (shouldn't happen with a broad matcher),
   * skip auth redirects — otherwise `"" !== "/login"` forces redirect("/login") forever.
   */
  if (!pathname) {
    return <>{children}</>;
  }

  const session = await getSession();
  const hasAdmin = await hasAdminCredentials();

  if (session) {
    if (pathname === "/login" || pathname === "/setup") {
      redirect("/dashboard");
    }
  } else {
    if (!hasAdmin) {
      if (pathname !== "/setup") {
        redirect("/setup");
      }
    } else {
      if (pathname === "/setup") {
        redirect("/login");
      }
      if (pathname !== "/login" && pathname !== "/setup") {
        redirect("/login");
      }
    }
  }

  return <>{children}</>;
}
