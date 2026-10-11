import { Suspense } from "react";
import type { Metadata } from "next";
import { LoadingBlock } from "@/components/admin/primitives";
import { ContactList } from "./contact-list";

export const metadata: Metadata = { title: "Liên hệ khách hàng" };

export default function ContactsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ContactList />
    </Suspense>
  );
}
