import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardReviewsPage() {
  const doctor = await prisma.doctorProfile.findFirst({ include: { reviews: true } });
  if (!doctor) return <div className="mx-auto max-w-3xl px-4 py-10">No doctor account found.</div>;
  const avgRating =
    doctor.reviews.length > 0
      ? doctor.reviews.reduce((sum, review) => sum + review.rating, 0) / doctor.reviews.length
      : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold">Patient Reviews</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            Rating {avgRating ? avgRating.toFixed(1) : "N/A"} ({doctor.reviews.length} reviews)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {doctor.reviews.length ? (
            doctor.reviews.map((review) => (
              <div key={review.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Patient</p>
                  <p className="text-sm text-muted-foreground">{review.rating}/5</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No reviews available yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
