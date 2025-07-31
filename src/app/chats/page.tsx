// app/chats/page.tsx
import { Suspense } from "react";
import MessagePanel from "@/components/MessagePanel";

export default function page() {
  return (
    <div className="flex">
      {/* LeftSidebar is assumed already rendered in layout */}
      <Suspense fallback={<div></div>}>
        <MessagePanel />
      </Suspense>
    </div>
  );
}
