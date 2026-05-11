import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  contactId: z.string().optional(),
  loanId: z.string().optional(),
  kind: z.enum(["sms", "email", "note"]),
  body: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const message = await prisma.message.create({
    data: { ...parsed.data, direction: "outbound" },
  });

  // Log activity
  if (parsed.data.contactId) {
    await prisma.activityLog.create({
      data: {
        contactId: parsed.data.contactId,
        loanId: parsed.data.loanId,
        kind: parsed.data.kind,
        title: parsed.data.kind === "note" ? "Note added" : `${parsed.data.kind.toUpperCase()} sent`,
        subtitle: parsed.data.body.slice(0, 80),
      },
    });
  }

  return NextResponse.json(message, { status: 201 });
}
