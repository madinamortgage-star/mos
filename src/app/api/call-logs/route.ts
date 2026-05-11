import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  prospectCardId: z.string().optional(),
  contactId: z.string().optional(),
  disposition: z.enum(["Connected", "Left voicemail", "No pickup", "Wrong number"]),
  notes: z.string().optional(),
  duration: z.number().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get("contactId");
  const prospectCardId = searchParams.get("prospectCardId");

  const logs = await prisma.callLog.findMany({
    where: {
      ...(contactId ? { contactId } : {}),
      ...(prospectCardId ? { prospectCardId } : {}),
    },
    orderBy: { calledAt: "desc" },
    take: 50,
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const log = await prisma.callLog.create({
    data: { ...parsed.data, userId: session.user.id },
  });
  return NextResponse.json(log, { status: 201 });
}
