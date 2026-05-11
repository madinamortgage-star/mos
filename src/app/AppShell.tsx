"use client";

import { useState, useCallback } from "react";
import { Sidebar, type Page } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Toasts, type ToastItem } from "@/components/ui/Toast";
import { Icon } from "@/components/icons/Icons";
import { ContactModal } from "@/components/modals/ContactModal";
import { NewContactModal } from "@/components/modals/NewContactModal";
import { NewLoanModal } from "@/components/modals/NewLoanModal";
import { NewPartnerModal } from "@/components/modals/NewPartnerModal";

// Lazy-imported page components (each handles its own data fetching)
import dynamic from "next/dynamic";

const Dashboard     = dynamic(() => import("@/components/pages/DashboardPage").then(m => ({ default: m.DashboardPage })), { ssr: false });
const Prospecting   = dynamic(() => import("@/components/pages/ProspectingPage").then(m => ({ default: m.ProspectingPage })), { ssr: false });
const PipelinePage  = dynamic(() => import("@/components/pages/PipelinePage").then(m => ({ default: m.PipelinePage })), { ssr: false });
const BoardPage     = dynamic(() => import("@/components/pages/BoardPage").then(m => ({ default: m.BoardPage })), { ssr: false });
const PartnersPage  = dynamic(() => import("@/components/pages/PartnersPage").then(m => ({ default: m.PartnersPage })), { ssr: false });
const ContactsPage  = dynamic(() => import("@/components/pages/ContactsPage").then(m => ({ default: m.ContactsPage })), { ssr: false });

interface Props {
  user: { name?: string | null; email?: string | null; nmls?: string };
  initialCounts: Record<string, number>;
}

type Modal = "new-contact" | "new-loan" | "new-partner" | null;

export function AppShell({ user, initialCounts }: Props) {
  const [page, setPage] = useState<Page>("home");
  const [counts, setCounts] = useState(initialCounts);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [modal, setModal] = useState<Modal>(null);
  const [contactDetail, setContactDetail] = useState<Parameters<typeof ContactModal>[0]["contact"] | null>(null);

  const pushToast = useCallback((text: string, xp?: string) => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { id, text, xp }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 2800);
  }, []);

  function openContact(loanId: string) {
    fetch(`/api/loans/${loanId}`)
      .then(r => r.json())
      .then(loan => {
        setContactDetail({
          id: loan.contact?.id ?? loan.id,
          name: `${loan.firstName} ${loan.lastName}`,
          tag: loan.stage ? `${loan.stage[0].toUpperCase() + loan.stage.slice(1)}` : undefined,
          phone: loan.contact?.phone ?? undefined,
          email: loan.contact?.email ?? undefined,
          source: undefined,
          stage: loan.stage,
          loan: { id: loan.id, amount: loan.amount, rate: loan.rate, product: loan.product, ltv: loan.ltv, dti: loan.dti, closingDate: loan.closingDate },
          messages: loan.messages ?? [],
          timeline: loan.activityLogs ?? [],
        });
      });
  }

  const header = {
    home:        { crumb: "Today",                    title: "Dashboard" },
    prospecting: { crumb: "Daily Call System",        title: "Prospecting" },
    pipeline:    { crumb: "Board",                    title: "Loan Pipeline" },
    active:      { crumb: "Active Workspace",         title: "Active Leads" },
    preapproved: { crumb: "Monday-style board",       title: "Pre-Approved Loans" },
    past:        { crumb: "Retention & reactivation", title: "Past Clients" },
    partners:    { crumb: "Workspace",                title: "Partners" },
    contacts:    { crumb: "Workspace",                title: "Contacts" },
  }[page] ?? { crumb: "", title: "" };

  return (
    <div className="app">
      <Sidebar
        active={page}
        onNav={setPage}
        counts={counts}
        user={user}
        nmls={user.nmls}
        onQuickAdd={() => setModal("new-contact")}
      />

      <main className="main">
        {page === "home" && (
          <Dashboard onGoTo={(p: Page) => setPage(p)} />
        )}

        {page === "prospecting" && (
          <>
            <PageHeader
              {...header}
              right={
                <>
                  <button className="pill-btn"><Icon name="clock" size={13} /> History</button>
                  <button className="pill-btn primary"><Icon name="phone" size={13} /> Dial next</button>
                </>
              }
            />
            <Prospecting onToast={pushToast} />
          </>
        )}

        {page === "pipeline" && (
          <>
            <PageHeader
              {...header}
              right={
                <>
                  <button className="pill-btn"><Icon name="doc" size={13} /> Export</button>
                  <button className="pill-btn primary" onClick={() => setModal("new-loan")}>
                    <Icon name="plus" size={13} /> New Loan
                  </button>
                </>
              }
            />
            <PipelinePage onOpenContact={openContact} />
          </>
        )}

        {page === "preapproved" && (
          <>
            <PageHeader
              {...header}
              right={
                <>
                  <button className="pill-btn"><Icon name="doc" size={13} /> Export</button>
                  <button className="pill-btn primary" onClick={() => setModal("new-loan")}>
                    <Icon name="plus" size={13} /> New Pre-Approval
                  </button>
                </>
              }
            />
            <BoardPage boardType="preapproved" onOpenContact={openContact} />
          </>
        )}

        {page === "active" && (
          <>
            <PageHeader
              {...header}
              right={
                <>
                  <button className="pill-btn"><Icon name="doc" size={13} /> Export</button>
                  <button className="pill-btn primary" onClick={() => setModal("new-loan")}>
                    <Icon name="plus" size={13} /> New Lead
                  </button>
                </>
              }
            />
            <BoardPage boardType="active" onOpenContact={openContact} />
          </>
        )}

        {page === "past" && (
          <>
            <PageHeader
              {...header}
              right={
                <>
                  <button className="pill-btn"><Icon name="mail" size={13} /> Bulk email</button>
                  <button className="pill-btn primary"><Icon name="sparkle" size={13} /> Rate Alert Scan</button>
                </>
              }
            />
            <BoardPage boardType="past" onOpenContact={openContact} />
          </>
        )}

        {page === "partners" && (
          <>
            <PageHeader
              {...header}
              right={
                <button className="pill-btn primary" onClick={() => setModal("new-partner")}>
                  <Icon name="plus" size={13} /> New Partner
                </button>
              }
            />
            <PartnersPage onToast={pushToast} />
          </>
        )}

        {page === "contacts" && (
          <>
            <PageHeader
              {...header}
              right={
                <>
                  <button className="pill-btn"><Icon name="doc" size={13} /> Import</button>
                  <button className="pill-btn"><Icon name="doc" size={13} /> Export</button>
                  <button className="pill-btn primary" onClick={() => setModal("new-contact")}>
                    <Icon name="plus" size={13} /> New Contact
                  </button>
                </>
              }
            />
            <ContactsPage onToast={pushToast} />
          </>
        )}
      </main>

      {/* Modals */}
      {modal === "new-contact" && (
        <NewContactModal
          onClose={() => setModal(null)}
          onSaved={contact => {
            pushToast(`Contact ${contact.firstName} ${contact.lastName} added`);
            setCounts(c => ({ ...c, contacts: c.contacts + 1 }));
          }}
        />
      )}
      {modal === "new-loan" && (
        <NewLoanModal
          onClose={() => setModal(null)}
          onSaved={() => {
            pushToast("Loan added to pipeline");
            setCounts(c => ({ ...c, pipeline: c.pipeline + 1 }));
          }}
        />
      )}
      {modal === "new-partner" && (
        <NewPartnerModal
          onClose={() => setModal(null)}
          onSaved={() => {
            pushToast("Partner added");
            setCounts(c => ({ ...c, partners: c.partners + 1 }));
          }}
        />
      )}
      {contactDetail && (
        <ContactModal contact={contactDetail} onClose={() => setContactDetail(null)} />
      )}

      <Toasts items={toasts} />
    </div>
  );
}
