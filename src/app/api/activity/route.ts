import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  contactId: z.string().optional(),
  loanId: z.string().optional(),
  partnerId: z.string().optional(),
  kind: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const log = await prisma.activityLog.create({ data: parsed.data });
  return NextResponse.json(log, { status: 201 });
}
