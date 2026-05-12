import { NewLoanButton } from "@/components/pipeline/new-loan-button";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { PageHeader } from "@/components/page-header";
import { contactDisplayName } from "@/lib/contacts/format";
import { getContactsByIds } from "@/lib/db/contacts";
import { listLoans } from "@/lib/db/loans";
import { listPipelineStages, listPipelines } from "@/lib/db/pipelines";
import type { LoanRow, PipelineRow, PipelineStageRow } from "@/lib/db/types";
import { getUser } from "@/lib/auth";
import { getOrgContext } from "@/lib/org";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ pipeline?: string }>;
}) {
  const sp = await searchParams;
  const configured = isSupabaseConfigured();
  const [{ currentOrg }, user] = await Promise.all([getOrgContext(), getUser()]);

  let pipeline: PipelineRow | null = null;
  let stages: PipelineStageRow[] = [];
  let loans: LoanRow[] = [];
  const borrowerNames: Record<string, string> = {};
  let loadError: string | null = null;

  if (configured && currentOrg) {
    try {
      const pipelines = await listPipelines(currentOrg.id);
      pipeline =
        (sp.pipeline ? pipelines.find((p) => p.id === sp.pipeline) : undefined) ??
        pipelines.find((p) => p.is_default) ??
        pipelines[0] ??
        null;

      if (pipeline) {
        [stages, loans] = await Promise.all([
          listPipelineStages(currentOrg.id, pipeline.id),
          listLoans({ orgId: currentOrg.id, pipelineId: pipeline.id }),
        ]);

        const contactIds = [
          ...new Set(loans.map((l) => l.contact_id).filter((id): id is string => Boolean(id))),
        ];
        const contacts = await getContactsByIds(currentOrg.id, contactIds);
        for (const [id, contact] of contacts) borrowerNames[id] = contactDisplayName(contact);
      }
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Failed to load the pipeline.";
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        crumb="Pipeline · board"
        title={pipeline?.name ?? "Loan Pipeline"}
        right={<NewLoanButton disabled={!configured || !pipeline} />}
      />

      {!configured && (
        <div className="border-b border-stroke bg-beige-100 px-8 py-2 text-xs text-brown-700">
          Placeholder mode — add Supabase keys to <code className="font-mono">.env.local</code>, apply the
          migrations, and (optionally) run <code className="font-mono">supabase/seed.sql</code> to see a live board.
        </div>
      )}

      <div className="min-h-0 flex-1">
        {loadError ? (
          <div className="m-8 rounded-lg border border-red-400/40 bg-red-50 p-4 text-sm text-red-600">
            Couldn’t load the pipeline: {loadError}
          </div>
        ) : (
          <PipelineBoard
            stages={stages}
            loans={loans}
            borrowerNames={borrowerNames}
            currentUserId={user?.id ?? null}
            placeholderMode={!configured}
          />
        )}
      </div>
    </div>
  );
}
