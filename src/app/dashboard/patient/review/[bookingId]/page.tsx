import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FeedbackForm } from "@/components/patient/FeedbackForm";

export const dynamic = "force-dynamic";

type Props = {
  params: { bookingId: string };
};

export default async function PatientFeedbackPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "PATIENT") redirect("/dashboard");

  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: {
      doctor: { select: { displayName: true, specialty: true } },
      review: true,
    },
  });

  if (!booking || booking.patientId !== session.user.id) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Consultation Feedback</h1>
        <p className="mt-1 text-sm text-slate-600">
          Help us improve care quality and visibility by rating your experience with{" "}
          {booking.doctor.displayName} ({booking.doctor.specialty}).
        </p>
      </div>

      {booking.status !== "COMPLETED" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Feedback opens after the consultation is completed.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <FeedbackForm
            bookingId={booking.id}
            initialRating={booking.review?.rating}
            initialComment={booking.review?.comment ?? ""}
          />
        </div>
      )}
    </div>
  );
}
