"use client";

import { type FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim() || !phone.trim() || message.trim().length < 10) {
      setError("Please provide name, phone, and a brief case summary.");
      return;
    }
    setSuccess("Thanks! Our care team will contact you shortly.");
    setName("");
    setPhone("");
    setMessage("");
  };

  return (
    <section className="bg-white px-6 py-20 md:px-[5%]" aria-labelledby="contact-form-heading">
      <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 p-8 shadow-sm">
        <h2 id="contact-form-heading" className="font-display text-3xl text-[#0b1f3a]">Get free surgery guidance</h2>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input aria-label="Patient name" placeholder="Patient name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input aria-label="Phone number" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Textarea aria-label="Case summary" placeholder="Share diagnosis, surgery advised, and preferred timeline" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-700">{success}</p> : null}
          <button type="submit" aria-label="Submit surgery guidance form" className="rounded-full bg-[#c9983a] px-8 py-3 font-bold text-[#0b1f3a] hover:bg-yellow-400">
            Submit Request
          </button>
        </form>
      </div>
    </section>
  );
}
