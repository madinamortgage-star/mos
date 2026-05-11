import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  stage: z.enum(["lead", "app", "pre", "proc", "uw", "fund"]).optional(),
  status: z.enum(["hot", "warm", "cool", "stall", "ok"]).optional(),
  statusLabel: z.string().optional(),
  notes: z.string().optional(),
  processor: z.string().optional(),
  lender: z.string().optional(),
  amount: z.number().optional(),
  revenue: z.number().optional(),
  commission: z.number().optional(),
  rate: z.string().optional(),
  product: z.string().optional(),
  closingDate: z.string().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      contact: true,
      messages: { orderBy: { sentAt: "asc" } },
      activityLogs: { orderBy: { occurredAt: "desc" }, take: 20 },
    },
  });
  if (!loan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(loan);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const loan = await prisma.loan.update({ where: { id }, data: parsed.data });
  return NextResponse.json(loan);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.loan.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
