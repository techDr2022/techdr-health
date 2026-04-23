import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-emerald-100 bg-white text-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image src="/techdrhealth-logo.png" alt="techDrHealth" width={180} height={48} className="h-10 w-auto" />
            <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-slate-600">
              Fast, secure teleconsultation with verified specialists across India. Consult in minutes from anywhere.
            </p>
          </div>

          <div>
            <p className="font-display text-[16px] font-[700] text-slate-900">Patients</p>
            <ul className="mt-4 space-y-2 font-body text-sm text-slate-600">
              <li>
                <Link href="/consult" className="hover:text-emerald-700">
                  Book Consultation
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-emerald-700">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link href="/specialties" className="hover:text-emerald-700">
                  Browse Specialities
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-[16px] font-[700] text-slate-900">Doctors</p>
            <ul className="mt-4 space-y-2 font-body text-sm text-slate-600">
              <li>
                <Link href="/join" className="hover:text-emerald-700">
                  Join as Doctor
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-700">
                  Doctor Dashboard
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-700">
                  Doctor FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-[16px] font-[700] text-slate-900">Company</p>
            <ul className="mt-4 space-y-2 font-body text-sm text-slate-600">
              <li>
                <Link href="/about" className="hover:text-emerald-700">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-emerald-700">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-700">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-emerald-300/70 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-5 text-white shadow-lg shadow-emerald-900/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-white/40 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                Medical Tourism
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-emerald-50">
                We support medical tourism patients traveling to India for quality and affordable treatment with
                trusted doctors, hospitals, and personalized care coordination.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              Get Assistance
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
          <p className="font-display text-sm font-[700] uppercase tracking-[0.12em] text-emerald-800">Contact Info</p>
          <div className="mt-3 space-y-2 font-body text-sm text-slate-700">
            <p>
              1st floor, Sri Lalitha Devi Nilayam, 16-11-16, N/118, West Prasanth Nagar, Malakpet Extension, New
              Malakpet, Hyderabad, Telangana 500036
            </p>
            <p>Phone: 90322 92171</p>
            <p>Email: techdrtelehealth@gmail.com</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-emerald-100 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} techDr Tele Health. All rights reserved.</p>
          <div className="flex flex-wrap gap-2.5">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">🔒 Secure</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">✅ Verified</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">🇮🇳 Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
