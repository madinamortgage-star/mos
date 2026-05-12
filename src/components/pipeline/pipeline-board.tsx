"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { formatCompactMoney } from "@/lib/loans/format";
import type { LoanRow, PipelineStageRow } from "@/lib/db/types";
import { LoanDrawer } from "./loan-drawer";
import { PipelineColumn, type BoardColumn } from "./pipeline-column";

type Filter = "all" | "mine" | "hot";

const UNASSIGNED = "__unassigned__";

export function PipelineBoard({
  stages,
  loans,
  borrowerNames,
  currentUserId,
  placeholderMode,
}: {
  stages: PipelineStageRow[];
  loans: LoanRow[];
  borrowerNames: Record<string, string>;
  currentUserId: string | null;
  placeholderMode: boolean;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openLoanId, setOpenLoanId] = useState<string | null>(null);

  const filteredLoans = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return loans.filter((loan) => {
      if (filter === "mine" && (!currentUserId || loan.owner_id !== currentUserId)) return false;
      if (filter === "hot" && loan.temperature !== "hot") return false;
      if (needle) {
        const borrower = loan.contact_id ? borrowerNames[loan.contact_id] ?? "" : "";
        const hay = `${borrower} ${loan.loan_number ?? ""} ${loan.lender ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [loans, q, filter, currentUserId, borrowerNames]);

  const columns = useMemo<BoardColumn[]>(() => {
    const byStage = new Map<string, LoanRow[]>();
    for (const loan of filteredLoans) {
      const key = loan.stage_id ?? UNASSIGNED;
      const arr = byStage.get(key);
      if (arr) arr.push(loan);
      else byStage.set(key, [loan]);
    }
    const cols: BoardColumn[] = stages.map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color,
      loans: byStage.get(s.id) ?? [],
    }));
    const unassigned = byStage.get(UNASSIGNED) ?? [];
    if (unassigned.length > 0) {
      cols.push({ id: UNASSIGNED, name: "Unassigned", color: "var(--brown-500)", loans: unassigned });
    }
    return cols;
  }, [stages, filteredLoans]);

  const totalVolume = filteredLoans.reduce((sum, l) => sum + (l.amount ?? 0), 0);
  const openLoan = filteredLoans.find((l) => l.id === openLoanId) ?? loans.find((l) => l.id === openLoanId) ?? null;

  if (stages.length === 0) {
    return (
      <EmptyState
        title={placeholderMode ? "No pipeline to show yet" : "No pipeline configured"}
        description={
          placeholderMode
            ? "Add your Supabase keys, apply the migrations, and (optionally) run supabase/seed.sql to get a starter loan pipeline. Until then this board runs in placeholder mode."
            : "This organization has no pipeline yet. Run supabase/seed.sql for a starter, or create a pipeline + stages in the database."
        }
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-stroke px-8 py-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search loan #, lender, borrower…"
          className="w-64 rounded-md border border-stroke bg-white px-3 py-1.5 text-sm outline-none focus:border-stroke-strong"
        />
        {(
          [
            ["all", "All"],
            ["mine", "My deals"],
            ["hot", "Hot"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-2.5 py-1 text-xs ${
              filter === value ? "bg-navy-900 text-beige-100" : "text-brown-700 hover:bg-beige-200"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto text-xs text-brown-500">
          {filteredLoans.length} loan{filteredLoans.length === 1 ? "" : "s"} ·{" "}
          <span className="font-mono text-brown-700">{formatCompactMoney(totalVolume)}</span> volume
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="flex h-full gap-4">
          {columns.map((col) => (
            <PipelineColumn
              key={col.id}
              column={col}
              borrowerNames={borrowerNames}
              onOpenLoan={(l) => setOpenLoanId(l.id)}
            />
          ))}
        </div>
      </div>

      <LoanDrawer
        loan={openLoan}
        borrowerName={openLoan?.contact_id ? borrowerNames[openLoan.contact_id] : undefined}
        onClose={() => setOpenLoanId(null)}
      />
    </div>
  );
}
