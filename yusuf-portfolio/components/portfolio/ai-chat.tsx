"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { AccentButton } from "@/components/ui/accent-button";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

const STARTER_PROMPTS = [
  "What can you build?",
  "How fast?",
  "What is ClaudeCode?",
  "Pricing?",
  "Start a project",
] as const;

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2 pl-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-[var(--react)]"
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.18,
          }}
        />
      ))}
    </div>
  );
}

function parseDataLine(line: string, onDelta: (text: string) => void): boolean {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return false;
  const data = trimmed.slice(5).trim();
  if (data === "[DONE]") return true;
  try {
    const json = JSON.parse(data) as {
      choices?: { delta?: { content?: string } }[];
    };
    const delta = json.choices?.[0]?.delta?.content;
    if (typeof delta === "string" && delta.length > 0) {
      onDelta(delta);
    }
  } catch {
    /* ignore malformed chunk */
  }
  return false;
}

async function parseSSEStream(
  body: ReadableStream<Uint8Array>,
  onDelta: (text: string) => void
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (parseDataLine(line, onDelta)) return;
    }
  }

  if (buffer.trim()) {
    for (const line of buffer.split("\n")) {
      if (parseDataLine(line, onDelta)) return;
    }
  }
}

export function AIChat() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstMessageTracked = useRef(false);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streaming, scrollToBottom]);

  async function sendFromUser(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    if (!firstMessageTracked.current) {
      firstMessageTracked.current = true;
      void track("ai_chat_first_message", { source: "portfolio_widget" });
    }

    setError(null);
    const nextUser: ChatMessage = { role: "user", content: trimmed };
    setMessages((m) => [...m, nextUser, { role: "assistant", content: "" }]);
    setStreaming(true);

    const historyForApi: ChatMessage[] = [...messages, nextUser];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForApi }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not get a response.");
        setMessages((m) => {
          const next = [...m];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            next[next.length - 1] = {
              role: "assistant",
              content: data.error ?? "Something went wrong. Try again.",
            };
          }
          return next;
        });
        setStreaming(false);
        return;
      }

      if (!res.body) {
        setError("No response body.");
        setStreaming(false);
        return;
      }

      let accumulated = "";
      await parseSSEStream(res.body, (delta) => {
        accumulated += delta;
        setMessages((msgs) => {
          const copy = [...msgs];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            copy[copy.length - 1] = { role: "assistant", content: accumulated };
          }
          return copy;
        });
      });

      if (!accumulated.trim()) {
        setMessages((msgs) => {
          const copy = [...msgs];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant" && !last.content) {
            copy[copy.length - 1] = {
              role: "assistant",
              content: "No reply was returned. Check GROQ_API_KEY and try again.",
            };
          }
          return copy;
        });
      }
    } catch {
      setError("Network error.");
      setMessages((m) => {
        const next = [...m];
        const last = next[next.length - 1];
        if (last?.role === "assistant") {
          next[next.length - 1] = {
            role: "assistant",
            content: "Could not reach the chat service.",
          };
        }
        return next;
      });
    } finally {
      setStreaming(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendFromUser(text);
  }

  const showStarters = messages.length === 0;
  const lastAssistant = messages[messages.length - 1];
  const showTyping =
    streaming && lastAssistant?.role === "assistant" && lastAssistant.content.length === 0;

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[240] flex flex-col items-end gap-3",
        "bottom-6 right-6 max-sm:bottom-4 max-sm:right-4"
      )}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "pointer-events-auto flex flex-col overflow-hidden rounded-2xl border border-[var(--liquid-border)] shadow-2xl",
              "glass-strong",
              "h-[520px] w-[380px] max-w-[calc(100vw-2rem)]",
              "max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:h-[min(520px,85vh)] max-sm:max-h-[85vh] max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:border-x-0 max-sm:border-b-0"
            )}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--glass-border)] px-4 py-3">
              <div>
                <p className="font-label text-sm font-medium text-white">Yusuf&apos;s AI</p>
              </div>
              <button
                type="button"
                className="rounded-md p-1.5 text-[var(--text-muted)] transition-colors hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
            >
              {error && (
                <p className="font-label text-xs text-[var(--rust)]" role="alert">
                  {error}
                </p>
              )}

              {showStarters && (
                <div className="flex flex-wrap gap-2">
                  {STARTER_PROMPTS.map((label) => (
                    <button
                      key={label}
                      type="button"
                      disabled={streaming}
                      onClick={() => void sendFromUser(label)}
                      className={cn(
                        "rounded-full border border-[var(--glass-border)] bg-black/35 px-3 py-1.5 font-label text-[11px] text-[var(--text-secondary)]",
                        "transition-[border-color,background,color] hover:border-[var(--glass-border-hover)] hover:text-white",
                        "disabled:opacity-50"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex w-full",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[90%] rounded-xl border border-[var(--liquid-border)] bg-white/[0.08] px-3 py-2 font-label text-xs leading-relaxed text-white backdrop-blur-md">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-[92%] rounded-xl border border-[var(--glass-border)] border-l-[3px] border-l-[var(--react)] bg-black/45 px-3 py-2 font-label text-xs leading-relaxed text-white">
                      {msg.content ? (
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      ) : showTyping && i === messages.length - 1 ? (
                        <TypingIndicator />
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="shrink-0 border-t border-[var(--glass-border)] p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  placeholder="Ask about stack, pricing, or how to hire…"
                  disabled={streaming}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--glass-border)] bg-black/70 px-3 py-2 font-label text-xs text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--react)] focus:ring-1 focus:ring-[var(--react)] disabled:opacity-60"
                />
                <AccentButton
                  type="button"
                  variant="filled"
                  size="sm"
                  className="shrink-0 px-3 font-label"
                  onClick={() => void send()}
                  disabled={streaming || !input.trim()}
                  aria-label="Send"
                >
                  →
                </AccentButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "pointer-events-auto flex items-center gap-2.5 rounded-full border border-[var(--liquid-border)] px-4 py-2.5 font-label text-sm text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
              "bg-black/55 backdrop-blur-xl transition-[transform,box-shadow] hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(97,218,251,0.1)]",
              "liquid-pill"
            )}
            aria-label="Open AI chat"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--react)] opacity-60"
                aria-hidden
              />
              <span
                className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--react)]"
                aria-hidden
              />
            </span>
            <span>✦ Ask about Yusuf</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
