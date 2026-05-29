"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listUsersAction, updateUserRolesAction } from "@/lib/admin/actions/users";
import type { UserProfile } from "@/lib/types";

type UserRow = UserProfile & { id: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    listUsersAction().then(setUsers);
  }, []);

  async function toggleAdmin(user: UserRow) {
    const isAdmin = user.roles.includes("admin");
    const roles: UserProfile["roles"] = isAdmin
      ? user.roles.filter((r) => r !== "admin")
      : [...user.roles.filter((r) => r !== "admin"), "admin"];
    const result = await updateUserRolesAction(user.id, roles as UserProfile["roles"]);
    if (!result.success) toast.error(result.error);
    else {
      toast.success("Roles updated");
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, roles } : u)));
    }
  }

  return (
    <>
      <AdminHeader title="Users" description="Manage admin and moderator roles." />
      <div className="p-8">
        <div className="rounded-xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{user.roles.join(", ")}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => toggleAdmin(user)}>
                      {user.roles.includes("admin") ? "Revoke admin" : "Grant admin"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
