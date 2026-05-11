import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  contactId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  amount: z.number().optional(),
  stage: z.enum(["lead", "app", "pre", "proc", "uw", "fund"]).default("lead"),
  status: z.enum(["hot", "warm", "cool", "stall", "ok"]).default("warm"),
  statusLabel: z.string().optional(),
  processor: z.string().optional(),
  lender: z.string().optional(),
  revenue: z.number().optional(),
  commission: z.number().optional(),
  notes: z.string().optional(),
  rate: z.string().optional(),
  product: z.string().optional(),
  ltv: z.string().optional(),
  dti: z.string().optional(),
  closingDate: z.string().optional(),
});

export async function GET() {
  const loans = await prisma.loan.findMany({
    orderBy: { createdAt: "desc" },
    include: { contact: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } } },
  });
  return NextResponse.json(loans);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const loan = await prisma.loan.create({
    data: { ...parsed.data, ownerId: session.user.id },
  });
  return NextResponse.json(loan, { status: 201 });
}
