"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
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

export default function ContactPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "" },
  });

  function onSubmit(data: FormValues) {
    console.info("contact_submit", data);
    alert("Thanks — our team routes enterprise & patient inquiries within one business day (demo).");
    form.reset();
  }

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/30 to-white pt-20">
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <h1 className="font-heading text-4xl font-semibold text-[#0A1628] sm:text-5xl">
              Contact our care team
            </h1>
            <p className="mt-4 text-muted-foreground">
              Partnerships, hospital integrations, or patient support - route
              your note here and we will get back quickly.
            </p>
          </div>
          <div className="relative h-52 overflow-hidden rounded-2xl border border-emerald-100 shadow-sm sm:h-60">
            <Image
              src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1400&q=80"
              alt="Patient support specialist"
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          </div>
        </section>

        <section className="mx-auto max-w-xl px-4 pb-16 sm:px-6 lg:px-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
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
        </section>
      </main>
      <Footer />
    </>
  );
}
