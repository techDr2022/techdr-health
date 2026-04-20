import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HOME_FAQ } from "@/data/faq-home";
export function HomeFaq() {
  const leftFaq = HOME_FAQ.slice(0, 5);
  const rightFaq = HOME_FAQ.slice(5, 10);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-center font-heading text-3xl font-semibold text-[#0A1628] sm:text-4xl">
        Frequently asked questions
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
        Straight answers about teleconsultation India patients ask before their
        first video doctor visit.
      </p>
      <div className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-2">
        <Accordion type="single" collapsible className="rounded-2xl border bg-white px-4">
          {leftFaq.map((item, i) => (
            <AccordionItem key={item.question} value={`left-item-${i}`}>
              <AccordionTrigger className="text-left font-medium text-[#0A1628]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Accordion type="single" collapsible className="rounded-2xl border bg-white px-4">
          {rightFaq.map((item, i) => (
            <AccordionItem key={item.question} value={`right-item-${i}`}>
              <AccordionTrigger className="text-left font-medium text-[#0A1628]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
