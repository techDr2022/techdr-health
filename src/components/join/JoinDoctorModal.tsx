"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { DoctorJoinModalForm } from "@/components/join/DoctorJoinModalForm";
import { cn } from "@/lib/utils";

type JoinDoctorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function JoinDoctorModal({ open, onOpenChange }: JoinDoctorModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm",
            "transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0"
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center p-4 outline-none sm:p-6",
            "transition duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0"
          )}
        >
          {open ? (
            <div className="flex h-[min(88vh,720px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <DialogPrimitive.Title className="sr-only">Join as Doctor</DialogPrimitive.Title>
              <DoctorJoinModalForm
                key="doctor-join-modal"
                onClose={() => onOpenChange(false)}
                onSuccess={() => onOpenChange(false)}
              />
            </div>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
