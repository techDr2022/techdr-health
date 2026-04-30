"use client";

import { useEffect, useRef, useState } from "react";
import PusherClient from "pusher-js";
import { Send } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "doctor" | "patient";
  text: string;
  time: string;
}

export function ChatPanel({ bookingId, role }: { bookingId: string; role: "doctor" | "patient" }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchHistory() {
      const response = await fetch(`/api/video/chat?bookingId=${bookingId}`);
      if (!response.ok) return;
      const data = (await response.json()) as { messages?: Message[] };
      setMessages(data.messages || []);
    }
    void fetchHistory();
  }, [bookingId]);

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster) return;

    const pusher = new PusherClient(pusherKey, {
      cluster: pusherCluster,
    });
    const channel = pusher.subscribe(`chat-${bookingId}`);
    channel.bind("message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`chat-${bookingId}`);
    };
  }, [bookingId]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    setIsSending(true);
    try {
      await fetch("/api/video/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, message: text, sender: role }),
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-white/[0.06] px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">Secure Chat</p>
        <p className="text-[11px] text-white/35">Use for quick notes during consultation.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/25 text-[12px]">Text chat - type a message below.</p>
          </div>
        ) : null}
        {messages.map((message) => (
          <div key={message.id} className={cn("flex", message.sender === role ? "justify-end" : "justify-start")}>
            <div className="max-w-[85%]">
              <div
                className={cn(
                  "px-3 py-2 rounded-2xl text-[12px] leading-relaxed",
                  message.sender === role
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white/[0.08] text-white/80 rounded-bl-sm"
                )}
              >
                {message.text}
              </div>
              <div className={cn("text-[10px] text-white/25 mt-1", message.sender === role ? "text-right" : "text-left")}>
                {format(new Date(message.time), "hh:mm a")}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-white/[0.06] flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendMessage();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 text-white text-[12px] outline-none focus:border-blue-400 transition-colors placeholder:text-white/20"
        />
        <button
          onClick={() => void sendMessage()}
          disabled={isSending}
          aria-label="Send message"
          className="w-9 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-all flex-none disabled:opacity-60"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
