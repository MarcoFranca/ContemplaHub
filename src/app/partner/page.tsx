// src/app/partner/page.tsx
import { redirect } from "next/navigation";

export default function PartnerIndexPage() {
    redirect("/partner/contracts");
}