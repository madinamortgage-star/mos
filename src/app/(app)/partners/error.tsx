"use client";

import { BoardErrorState } from "@/components/board/board-error";

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <BoardErrorState {...props} title="Partners" />;
}
