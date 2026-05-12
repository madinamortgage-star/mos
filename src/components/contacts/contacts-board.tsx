"use client";

import { useState } from "react";
import type { ContactRow } from "@/lib/db/types";
import { EmptyState } from "@/components/empty-state";
import { ContactDrawer } from "./contact-drawer";
import { ContactsTable } from "./contacts-table";

/**
 * Owns the "which contact is open in the drawer" state and composes the table
 * with the drawer. The data itself is loaded server-side and passed in.
 */
export function ContactsBoard({
  contacts,
  placeholderMode,
}: {
  contacts: ContactRow[];
  placeholderMode: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openContact = contacts.find((c) => c.id === openId) ?? null;

  if (contacts.length === 0) {
    return (
      <EmptyState
        title={placeholderMode ? "No contacts to show yet" : "No contacts found"}
        description={
          placeholderMode
            ? "Add your Supabase keys and apply the migrations to load real contacts. Until then this page runs in placeholder mode."
            : "Adjust your search or filters, or add a new contact to get started."
        }
      />
    );
  }

  return (
    <>
      <ContactsTable rows={contacts} onOpen={(c) => setOpenId(c.id)} />
      <ContactDrawer contact={openContact} onClose={() => setOpenId(null)} />
    </>
  );
}
