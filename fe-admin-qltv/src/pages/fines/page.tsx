import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useFines,
  useCreateFine,
  useUpdateFine,
  useDeleteFine,
} from "@/hooks/use-fines";
import { FineRulesSettings } from "./components/fine-rules-settings";
import { FinesTable } from "./components/fines-table";
import { FineForm } from "./components/fine-form";
import { useQueryParameters } from "@/hooks/use-query-parameters";
import type { Fine, CreateFineRequest } from "@/types/fine.types";

type FinesLocationState = {
  openCreateDamagedFine?: boolean;
  initialFineDraft?: CreateFineRequest;
};

type FinesTab = "records" | "rules";

export function FinesPage() {
  const { t } = useTranslation("common");
  const location = useLocation();

  
  const { params, setParam, setMultipleParams } = useQueryParameters({
    tab: "records" as FinesTab,
    page: 1,
    limit: 10,
  });

  const activeTab: FinesTab = params.tab === "rules" ? "rules" : "records";

  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingFine, setEditingFine] = useState<Fine | null>(null);
  const [deletingFine, setDeletingFine] = useState<Fine | null>(null);
  const [createFineDraft, setCreateFineDraft] =
    useState<Partial<CreateFineRequest> | null>(null);

  useEffect(() => {
    const st = location.state as FinesLocationState | null;
    if (!st?.openCreateDamagedFine || !st.initialFineDraft?.borrowId) {
      return;
    }
    setMultipleParams({ tab: "records", page: 1 });
    setEditingFine(null);
    setCreateFineDraft(st.initialFineDraft);
    setIsSheetOpen(true);
    globalThis.history.replaceState({}, document.title);
  }, [location.state, location.key, setMultipleParams]);

  
  const { data, isLoading } = useFines({
    page: params.page,
    limit: params.limit,
  });
  const createMutation = useCreateFine();
  const updateMutation = useUpdateFine();
  const deleteMutation = useDeleteFine();

  
  const handleOpenSheet = (fine?: Fine) => {
    if (fine) {
      setEditingFine(fine);
      setCreateFineDraft(null);
    } else {
      setEditingFine(null);
      setCreateFineDraft(null);
    }
    setIsSheetOpen(true);
  };

  const handleSubmit = async (formData: CreateFineRequest) => {
    if (!formData.borrowId?.trim()) {
      toast.error(t("fines.borrowIdRequired"));
      return;
    }
    if (editingFine) {
      await updateMutation.mutateAsync({
        id: editingFine.id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDelete = async () => {
    if (deletingFine) {
      await deleteMutation.mutateAsync(deletingFine.id);
      setDeletingFine(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setParam("page", newPage);
  };

  const handleTabChange = (value: string) => {
    const next = value === "rules" ? "rules" : "records";
    setMultipleParams({ tab: next, page: 1 });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t("sidebar.dashboard"), href: "/dashboard" },
          { label: t("fines.title") },
        ]}
      />

      <PageHeader
        title={t("fines.title")}
        description={
          activeTab === "rules"
            ? t("fines.rulesTabDescription")
            : t("fines.description")
        }
        showAddButton={false}
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="records">{t("fines.tabs.records")}</TabsTrigger>
          <TabsTrigger value="rules">{t("fines.tabs.rules")}</TabsTrigger>
        </TabsList>

        <TabsContent
          value="records"
          className="mt-0 focus-visible:outline-none"
        >
          <FinesTable
            data={data?.data || []}
            meta={data?.meta}
            loading={isLoading}
            noDataText={t("fines.noData")}
            currentPage={params.page}
            limit={params.limit}
            onPageChange={handlePageChange}
            onEdit={handleOpenSheet}
            onDelete={(item) => setDeletingFine(item)}
          />
        </TabsContent>

        <TabsContent value="rules" className="mt-0 focus-visible:outline-none">
          <FineRulesSettings />
        </TabsContent>
      </Tabs>

      <FineForm
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) {
            setCreateFineDraft(null);
          }
        }}
        fine={editingFine}
        initialDraft={editingFine ? null : createFineDraft}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <DeleteDialog
        open={!!deletingFine}
        onOpenChange={() => setDeletingFine(null)}
        title={t("fines.deleteConfirmTitle")}
        description={t("fines.deleteConfirmDescription", {
          name: deletingFine?.reason,
        })}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

