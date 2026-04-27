const partners = ["NABH Corporate Hospital", "Multi-specialty Care Center", "Advanced Cardiac Institute", "Orthopedic Excellence Hospital"];

export function HospitalPartners() {
  return (
    <section className="px-6 py-20 md:px-[5%]" aria-labelledby="hospital-partners-heading">
      <div className="mx-auto max-w-7xl">
        <h2 id="hospital-partners-heading" className="font-display text-3xl text-[#0b1f3a]">Hospital partners</h2>
        <p className="mt-3 max-w-3xl text-[#556577]">We work with NABH accredited hospitals and vetted specialists across major surgery departments.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {partners.map((name) => (
            <article key={name} className="rounded-xl border border-gray-200 bg-[#faf7f2] p-5 shadow-sm">
              <h3 className="font-semibold text-[#1a2a3a]">{name}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
