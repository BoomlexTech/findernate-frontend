// app/chats/page.tsx
import MessagePanel from "@/components/MessagePanel";

export default function page() {
  return (
    <div className="flex">
      {/* LeftSidebar is assumed already rendered in layout */}
      <MessagePanel />
    </div>
  );
}
