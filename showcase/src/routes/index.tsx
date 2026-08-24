import {
  Add01Icon,
  Home01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Perch,
  Rail,
  RailBranch,
  RailFlock,
  RailItem,
  RailNest,
  RailNestItem,
} from "@mycodemedia/oriole";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: ChatDemo,
});

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

const seedMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    text: "Hi! I'm the Oriole demo assistant. Ask me anything — replies here are canned, there's no backend behind this page.",
  },
  {
    id: 2,
    role: "user",
    text: "What is this page for?",
  },
  {
    id: 3,
    role: "assistant",
    text: "It's a living demo of the chatbot app UI. Each placeholder element gets replaced with an Oriole component as the library grows.",
  },
];

const cannedReply =
  "Got it — this is a canned reply. Wire up real responses in the app, not here.";

const nests = [
  { id: "oriole", label: "Oriole HQ" },
  { id: "support", label: "Support Desk" },
  { id: "sandbox", label: "Sandbox" },
];

const conversations = [
  "Onboarding questions",
  "Billing dispute #4821",
  "Feature request triage",
  "Password reset flow",
];

function ChatDemo() {
  const [nest, setNest] = useState("oriole");
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [draft, setDraft] = useState("");
  const nextId = useRef(seedMessages.length + 1);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
    }
  }, [messages.length]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: "user", text },
      { id: nextId.current++, role: "assistant", text: cannedReply },
    ]);
    setDraft("");
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] items-start gap-2">
      <Rail className="h-full">
        <RailNest
          label={nests.find((n) => n.id === nest)?.label ?? "Oriole HQ"}
          selectedId={nest}
          onSelect={(id) => setNest(String(id))}
        >
          {nests.map((n) => (
            <RailNestItem key={n.id} id={n.id}>
              {n.label}
            </RailNestItem>
          ))}
        </RailNest>
        <RailFlock>
          <RailItem
            icon={<HugeiconsIcon icon={Add01Icon} size={16} />}
            shortcut="⌘N"
          >
            New chat
          </RailItem>
          <RailItem icon={<HugeiconsIcon icon={Home01Icon} size={16} />}>
            Home
          </RailItem>
        </RailFlock>
        <RailBranch title="Chats" searchable>
          {conversations.map((conversation) => (
            <RailItem key={conversation}>{conversation}</RailItem>
          ))}
        </RailBranch>
      </Rail>

      <Perch className="flex h-full min-w-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div ref={threadRef} className="flex-1 overflow-y-auto p-4">
            <ul className="mx-auto max-w-2xl space-y-4">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* slot: message bubble component */}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.text}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <footer className="border-t border-border p-4">
            <form
              className="mx-auto flex max-w-2xl items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
            >
              {/* slot: TextField / TextArea */}
              <textarea
                aria-label="Message"
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
                placeholder="Message the assistant…"
                className="min-h-10 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {/* slot: Button */}
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                disabled={!draft.trim()}
              >
                Send
              </button>
            </form>
          </footer>
        </div>
      </Perch>
    </div>
  );
}
