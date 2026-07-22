import { redirect } from "next/navigation";

import { RegisterPageClient } from "./RegisterPageClient";
import { PUBLIC_SIGNUP_ENABLED } from "@/lib/auth/public-signup";

export default function RegisterPage() {
  if (!PUBLIC_SIGNUP_ENABLED) {
    redirect("/login");
  }

  return <RegisterPageClient />;
}
