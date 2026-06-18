"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(20),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "" },
  });

  function onSubmit(data: FormValues) {
    console.info("contact_submit", data);
    alert(
      "Thanks - our team routes enterprise & patient inquiries within one business day.",
    );
    form.reset();
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...form.register("name")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register("email")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} {...form.register("message")} />
      </div>
      <Button type="submit" size="lg" className="w-full">
        Send message
      </Button>
    </form>
  );
}

export function ContactHeroImage() {
  return (
    <div className="relative h-52 overflow-hidden rounded-2xl border border-emerald-100 shadow-sm sm:h-60">
      <Image
        src="/images/placeholders/care-hero.svg"
        alt="Patient support specialist"
        fill
        className="object-cover"
        sizes="(max-width:1024px) 100vw, 50vw"
      />
    </div>
  );
}
