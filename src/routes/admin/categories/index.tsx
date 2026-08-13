import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Tags } from "lucide-react";
import { toast } from "sonner";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ActiveBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { categoriesApi, eventsApi } from "@/lib/api/client";
import type { Category, CategoryInput } from "@/types";

export const Route = createFileRoute("/admin/categories/")({
  head: () => ({
    meta: [
      { title: "Categories — Campus Events Admin" },
      { name: "description", content: "Create, edit and disable campus event categories." },
      { property: "og:title", content: "Categories — Campus Events Admin" },
      { property: "og:description", content: "Manage the categories used to organize campus events." },
    ],
  }),
  component: CategoriesPage,
});

const blank: CategoryInput = { name: "", description: "", image: "", active: true };

function CategoriesPage() {
  const qc = useQueryClient();
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: eventsApi.list });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [values, setValues] = useState<CategoryInput>(blank);
  const [error, setError] = useState<string | null>(null);
  const [toDisable, setToDisable] = useState<Category | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["categories"] });
    qc.invalidateQueries({ queryKey: ["public-events"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!values.name.trim()) throw new Error("Category name is required.");
      return editing
        ? categoriesApi.update(editing.id, values)
        : categoriesApi.create({ ...values, name: values.name.trim() });
    },
    onSuccess: () => {
      toast.success(editing ? "Category updated" : "Category created");
      setDialogOpen(false);
      invalidate();
    },
    onError: (e: Error) => setError(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      categoriesApi.setActive(id, active),
    onSuccess: (category) => {
      toast.success(`${category.name} ${category.active ? "enabled" : "disabled"}`);
      setToDisable(null);
      invalidate();
    },
    onError: () => toast.error("Could not update the category"),
  });

  const openCreate = () => {
    setEditing(null);
    setValues(blank);
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setValues({
      name: category.name,
      description: category.description,
      image: category.image ?? "",
      active: category.active,
    });
    setError(null);
    setDialogOpen(true);
  };

  const categories = categoriesQuery.data ?? [];
  const eventCount = (id: string) =>
    (eventsQuery.data ?? []).filter((e) => e.categoryId === id).length;

  return (
    <AdminLayout
      title="Categories"
      description="Group events so students can filter them quickly."
      actions={
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" /> Create Category
        </Button>
      }
    >
      <div className="rounded-lg border border-border bg-background shadow-soft">
        {categoriesQuery.isLoading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : categoriesQuery.isError ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-medium">Couldn't load categories</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => categoriesQuery.refetch()}>
              Try again
            </Button>
          </div>
        ) : categories.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Tags className="mx-auto size-7 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No categories yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first category to start organizing events.
            </p>
            <Button size="sm" className="mt-4" onClick={openCreate}>
              Create Category
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-surface text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Events</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3">
                        <p className="font-medium">{category.name}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {category.description}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{eventCount(category.id)}</td>
                      <td className="px-5 py-3">
                        <ActiveBadge active={category.active} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="sm">
                            <Link to="/admin/categories/$id" params={{ id: category.id }}>
                              View events
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              category.active
                                ? setToDisable(category)
                                : toggleMutation.mutate({ id: category.id, active: true })
                            }
                          >
                            {category.active ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-border md:hidden">
              {categories.map((category) => (
                <li key={category.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{category.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {eventCount(category.id)} events
                      </p>
                    </div>
                    <ActiveBadge active={category.active} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/admin/categories/$id" params={{ id: category.id }}>
                        View events
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(category)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        category.active
                          ? setToDisable(category)
                          : toggleMutation.mutate({ id: category.id, active: true })
                      }
                    >
                      {category.active ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "Create category"}</DialogTitle>
            <DialogDescription>
              Categories power the filters students see on the public site.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div>
              <Label htmlFor="cat-name" className="mb-1.5 text-xs font-medium">
                Name
              </Label>
              <Input
                id="cat-name"
                value={values.name}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                placeholder="Workshops"
              />
            </div>
            <div>
              <Label htmlFor="cat-desc" className="mb-1.5 text-xs font-medium">
                Description
              </Label>
              <Textarea
                id="cat-desc"
                rows={3}
                value={values.description}
                onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="cat-image" className="mb-1.5 text-xs font-medium">
                Image URL (optional)
              </Label>
              <Input
                id="cat-image"
                value={values.image ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, image: e.target.value }))}
                placeholder="https://…"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Disabled categories are hidden.</p>
              </div>
              <Switch
                checked={values.active}
                onCheckedChange={(active) => setValues((v) => ({ ...v, active }))}
                aria-label="Category active"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : editing ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(toDisable)} onOpenChange={(open) => !open && setToDisable(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable {toDisable?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Events in this category will stop appearing on the student website until you enable it
              again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                toDisable && toggleMutation.mutate({ id: toDisable.id, active: false })
              }
            >
              Disable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
