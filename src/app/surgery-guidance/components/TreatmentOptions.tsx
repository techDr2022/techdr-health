const plans = [
  { name: "Budget", detail: "Value-driven hospitals with essential inclusions." },
  { name: "Value", detail: "Balanced package with experienced surgeons." },
  { name: "Premium", detail: "Top-tier hospitals with advanced room and care options." },
];

export function TreatmentOptions() {
  return (
    <section className="bg-white px-6 py-20 md:px-[5%]" aria-labelledby="treatment-options-heading">
      <div className="mx-auto max-w-7xl">
        <h2 id="treatment-options-heading" className="font-display text-3xl text-[#0b1f3a]">Treatment package options</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-xl border border-gray-200 p-6 shadow-sm transition-transform hover:-translate-y-1">
              <h3 className="text-2xl font-bold text-[#0d7a6e]">{plan.name}</h3>
              <p className="mt-3 text-[#556577]">{plan.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
