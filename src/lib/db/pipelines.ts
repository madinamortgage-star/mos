/**
 * Pipelines / pipeline stages data layer.
 *
 * SERVER-ONLY — uses the Supabase server client. See note in `contacts.ts`.
 * Placeholder-aware: returns empty/null when Supabase isn't configured.
 *
 * TODO(Phase 3): create/reorder pipelines & stages, mark won/lost stages, and a
 * helper that seeds a default "Loan Pipeline" for a new org.
 */

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { PipelineRow, PipelineStageRow, PipelineWithStages, Uuid } from "./types";

export async function listPipelines(orgId: Uuid): Promise<PipelineRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("pipelines")
    .select("*")
    .eq("org_id", orgId)
    .order("position", { ascending: true });

  if (error || !data) return [];
  return data as PipelineRow[];
}

export async function getDefaultPipeline(orgId: Uuid): Promise<PipelineRow | null> {
  const pipelines = await listPipelines(orgId);
  if (pipelines.length === 0) return null;
  return pipelines.find((p) => p.is_default) ?? pipelines[0];
}

export async function listPipelineStages(
  orgId: Uuid,
  pipelineId: Uuid,
): Promise<PipelineStageRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("pipeline_stages")
    .select("*")
    .eq("org_id", orgId)
    .eq("pipeline_id", pipelineId)
    .order("position", { ascending: true });

  if (error || !data) return [];
  return data as PipelineStageRow[];
}

export async function getPipelineWithStages(
  orgId: Uuid,
  pipelineId: Uuid,
): Promise<PipelineWithStages | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: pipeline, error } = await supabase
    .from("pipelines")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", pipelineId)
    .maybeSingle();

  if (error || !pipeline) return null;

  const stages = await listPipelineStages(orgId, pipelineId);
  return { pipeline: pipeline as PipelineRow, stages };
}
