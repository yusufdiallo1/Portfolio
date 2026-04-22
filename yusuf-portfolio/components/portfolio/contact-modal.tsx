"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AccentButton } from "@/components/ui/accent-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { contactFormSchema, type ContactFormValues } from "@/lib/contact-schema";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type ContactModalContextValue = {
  open: () => void;
  close: () => void;
};

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error("useContactModal must be used within ContactModalProvider");
  }
  return ctx;
}

function ContactModalDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", message: "" },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (open) {
      void track("contact_open", { source: "modal" });
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  async function onSubmit(values: ContactFormValues) {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error ?? "Could not send message.");
        return;
      }
      toast.success("Message sent. I'll be in touch.");
      onOpenChange(false);
      reset();
    } catch {
      toast.error("Network error. Try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[var(--liquid-border)] p-0 sm:max-w-[480px]">
        <div className="border-b border-[var(--glass-border)]/60 bg-black/35 px-6 pb-4 pt-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal tracking-[-0.02em] text-white">
              Say Hello
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-[var(--text-muted)]">
              {"// get in touch"}
            </DialogDescription>
          </DialogHeader>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 bg-gradient-to-b from-black/25 to-black/55 px-6 pb-6 pt-2"
        >
          <div className="space-y-1.5">
            <label htmlFor="contact-name" className="sr-only">
              Name
            </label>
            <input
              id="contact-name"
              autoComplete="name"
              placeholder="Name"
              className={cn(
                "w-full rounded-lg border border-[var(--glass-border)] bg-black/70 px-3 py-2.5 font-label text-sm text-white outline-none transition-[border-color,box-shadow]",
                "placeholder:text-[var(--text-muted)] focus:border-[var(--react)] focus:ring-1 focus:ring-[var(--react)]"
              )}
              {...register("name")}
            />
            {errors.name && (
              <p className="font-mono text-xs text-[var(--rust)]">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="contact-email" className="sr-only">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              className={cn(
                "w-full rounded-lg border border-[var(--glass-border)] bg-black/70 px-3 py-2.5 font-label text-sm text-white outline-none transition-[border-color,box-shadow]",
                "placeholder:text-[var(--text-muted)] focus:border-[var(--go)] focus:ring-1 focus:ring-[var(--go)]"
              )}
              {...register("email")}
            />
            {errors.email && (
              <p className="font-mono text-xs text-[var(--rust)]">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="contact-message" className="sr-only">
              Message
            </label>
            <textarea
              id="contact-message"
              rows={5}
              placeholder="Your message"
              className={cn(
                "min-h-[7.5rem] w-full resize-y rounded-lg border border-[var(--glass-border)] bg-black/70 px-3 py-2.5 font-label text-sm text-white outline-none transition-[border-color,box-shadow]",
                "placeholder:text-[var(--text-muted)] focus:border-[var(--js)] focus:ring-1 focus:ring-[var(--js)]"
              )}
              {...register("message")}
            />
            {errors.message && (
              <p className="font-mono text-xs text-[var(--rust)]">{errors.message.message}</p>
            )}
          </div>
          <AccentButton
            type="submit"
            variant="filled"
            className="w-full font-mono"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Sending…
              </span>
            ) : (
              "Send Message →"
            )}
          </AccentButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Marker for root-level assembly; the actual dialog is mounted by ContactModalProvider.
 * Lets you write `<ContactModal />` next to `<AIChat />` for a clear layout tree.
 */
export function ContactModal() {
  return null;
}

export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open: openModal, close: closeModal }),
    [openModal, closeModal]
  );

  return (
    <ContactModalContext.Provider value={value}>
      {children}
      <ContactModalDialog open={open} onOpenChange={setOpen} />
    </ContactModalContext.Provider>
  );
}
