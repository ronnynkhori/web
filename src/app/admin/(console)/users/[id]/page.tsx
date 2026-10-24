import { notFound } from "next/navigation";
import { saveUser } from "@/app/admin/actions/admin";
import { DocForm } from "@/components/admin/doc-form";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireUser } from "@/lib/admin/auth";
import { getT } from "@/lib/admin/i18n/server";
import { loadItems } from "@/lib/admin/mutate";
import { roleLabels } from "@/lib/admin/roles";
import { userFields, userValues } from "@/lib/admin/settings-fields";
import type { UserDoc } from "@/lib/cms/types";

export default async function EditUserPage({ params }: PageProps<"/admin/users/[id]">) {
  await requireUser("users");
  const { id } = await params;
  const t = await getT();
  const isNew = id === "new";
  const user = isNew ? undefined : (await loadItems<UserDoc>("users")).find((u) => u.id === id);
  if (!isNew && !user) notFound();

  return (
    <div className="max-w-6xl">
      <PageHeader
        title={isNew ? t("New user") : user!.name}
        back={{ href: "/admin/users", label: t("Users") }}
        meta={
          user && (
            <>
              <StatusBadge tone={user.role === "super" ? "brand" : "info"}>{t(roleLabels[user.role])}</StatusBadge>
              {!user.active && <StatusBadge tone="neutral">{t("Deactivated")}</StatusBadge>}
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </>
          )
        }
      />
      <DocForm
        fields={userFields(isNew)}
        values={userValues(user)}
        action={saveUser.bind(null, isNew ? null : id)}
        submitLabel={isNew ? t("Create user") : t("Save user")}
        cancelHref="/admin/users"
      />
    </div>
  );
}
