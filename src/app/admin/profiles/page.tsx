import { prisma } from "@/lib/prisma";
import { ensureAdminAccess } from "@/lib/admin-access";
import { ProfileManagementTable } from "@/components/admin/ProfileManagementTable";

export const dynamic = "force-dynamic";

export default async function AdminProfilesPage() {
  const session = await ensureAdminAccess();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    take: 500,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Manage Profiles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit user details, role, account status, and delete/deactivate profiles.
        </p>
      </div>
      <ProfileManagementTable
        users={users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString() }))}
        currentAdminId={session.user.id}
      />
    </div>
  );
}
