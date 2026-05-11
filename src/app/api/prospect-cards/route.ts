import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  name: z.string(),
  company: z.string().optional(),
  phone: z.string().optional(),
  tag: z.string().optional(),
  tagLabel: z.string().optional(),
  context: z.string().optional(),
  action: z.string().optional(),
  priority: z.enum(["high", "med", "low"]).default("med"),
  section: z.enum(["must", "high", "suggest"]).default("suggest"),
});

export async function GET() {
  const cards = await prisma.prospectCard.findMany({
    orderBy: [{ bucket: "asc" }, { priority: "asc" }],
  });
  return NextResponse.json(cards);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const card = await prisma.prospectCard.create({ data: parsed.data });
  return NextResponse.json(card, { status: 201 });
}
