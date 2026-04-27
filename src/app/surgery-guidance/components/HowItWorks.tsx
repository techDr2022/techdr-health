const steps = [
  "Share reports and current diagnosis",
  "Discuss options with our care coordinator",
  "Get surgeon and hospital shortlists",
  "Compare 2-3 package estimates",
  "Choose confidently with full support",
];

export function HowItWorks() {
  return (
    <section className="px-6 py-20 md:px-[5%]" aria-labelledby="how-it-works-heading">
      <div className="mx-auto max-w-7xl">
        <h2 id="how-it-works-heading" className="font-display text-3xl text-[#0b1f3a]">How it works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, idx) => (
            <article key={step} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1">
              <h3 className="text-lg font-semibold text-[#0d7a6e]">Step {idx + 1}</h3>
              <p className="mt-2 text-[#556577]">{step}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
