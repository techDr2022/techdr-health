// AI-POWERED
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, Send, X, Stethoscope, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  suggestBooking?: boolean;
  suggestedSpecialty?: string;
};

const STORAGE_KEY = "techdr-health-chat";

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed.slice(-30) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
  } catch {
    // ignore quota errors
  }
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HealthChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    if (messages.length > 0) saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages, loading]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);
    setFallback(false);

    try {
      const response = await fetch("/api/ai/health-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        suggestBooking?: boolean;
        suggestedSpecialty?: string;
        error?: string;
        fallback?: boolean;
      };

      if (!response.ok || data.fallback) {
        setFallback(true);
        setError(data.error ?? "AI assistant is temporarily unavailable.");
        setLoading(false);
        return;
      }

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.reply ?? "How can I help you today?",
          timestamp: Date.now(),
          suggestBooking: data.suggestBooking,
          suggestedSpecialty: data.suggestedSpecialty,
        },
      ]);
    } catch {
      setFallback(true);
      setError("Unable to reach the assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 sm:bottom-6 sm:right-6"
          aria-label="Open health assistant chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end bg-black/20 sm:inset-auto sm:bottom-6 sm:right-6 sm:bg-transparent"
          role="dialog"
          aria-label="Health assistant chat"
        >
          <div className="flex h-full w-full flex-col bg-white shadow-2xl sm:h-[min(560px,calc(100vh-3rem))] sm:w-[400px] sm:rounded-2xl sm:border sm:border-slate-200">
            <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <p className="font-semibold text-slate-900">HealthGuide</p>
                <p className="text-xs text-muted-foreground">Navigation & triage · not a diagnosis tool</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Hi! I can help you understand symptoms and find the right specialist. What brings you here today?
                </p>
              ) : null}

              {messages.map((message, index) => (
                <div
                  key={`${message.timestamp}-${index}`}
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3 py-2 text-sm",
                    message.role === "user"
                      ? "ml-auto bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      message.role === "user" ? "text-emerald-100" : "text-slate-400"
                    )}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                  {message.role === "assistant" && message.suggestBooking ? (
                    <div className="mt-2 rounded-xl border border-emerald-200 bg-white p-2.5 text-slate-800">
                      <p className="text-xs font-medium">
                        {message.suggestedSpecialty
                          ? `Consult a ${message.suggestedSpecialty} specialist`
                          : "Book a consultation"}
                      </p>
                      <Link
                        href={
                          message.suggestedSpecialty
                            ? `/book?specialty=${encodeURIComponent(message.suggestedSpecialty.toLowerCase().replace(/\s+/g, "-"))}`
                            : "/book"
                        }
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
                      >
                        Book a Consultation →
                      </Link>
                    </div>
                  ) : null}
                </div>
              ))}

              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  HealthGuide is typing...
                </div>
              ) : null}

              {error ? (
                <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  {error}
                  {fallback ? (
                    <Link href="/book" className="mt-1 block font-semibold text-emerald-700 hover:underline">
                      Browse doctors manually →
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>

            <footer className="border-t border-slate-100 p-3">
              <Link
                href="/book"
                className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
              >
                <Stethoscope className="h-3.5 w-3.5" />
                Talk to a real doctor
              </Link>
              <div className="flex gap-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your concern..."
                  rows={2}
                  className="min-h-[44px] resize-none rounded-xl text-sm"
                  aria-label="Chat message"
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={() => void sendMessage()}
                  disabled={loading || !input.trim()}
                  className="h-11 w-11 shrink-0 rounded-xl"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
