import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import {
  useReservations,
  useUpdateReservation,
  useDeleteReservation,
} from "@/hooks/use-reservations";
import { useQueryParameters } from "@/hooks/use-query-parameters";
import type { Reservation } from "@/types/reservation.types";
import { ReservationsTable } from "./components/reservations-table";
import { ReservationsStatsCards } from "./components/reservations-stats-cards";
import {
  ReservationForm,
  type ReservationFormData,
} from "./components/reservation-form";

export function ReservationsPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  
  const { params, setParam, setMultipleParams } = useQueryParameters({
    page: 1,
    limit: 10,
    search: "",
  });

  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [deletingReservation, setDeletingReservation] =
    useState<Reservation | null>(null);
  const [searchValue, setSearchValue] = useState("");

  
  const { data, isLoading } = useReservations({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
  });
  const updateMutation = useUpdateReservation();
  const deleteMutation = useDeleteReservation();

  
  const handleOpenSheet = (reservation?: Reservation) => {
    if (reservation) {
      setEditingReservation(reservation);
    } else {
      setEditingReservation(null);
    }
    setIsSheetOpen(true);
  };

  const handleSubmit = async (formData: ReservationFormData) => {
    if (editingReservation) {
      await updateMutation.mutateAsync({
        id: editingReservation.id,
        data: {
          status: formData.status,
          cancellationReason:
            formData.status === "cancelled"
              ? formData.cancellationReason
              : undefined,
        },
      });

      if (formData.status === "fulfilled") {
        setIsSheetOpen(false);
        navigate("/dashboard/borrow", {
          state: {
            action: "create",
            readerId: editingReservation.readerId,
            copyId: editingReservation.copyId,
            readerName: editingReservation.reader?.user?.fullName || editingReservation.reader?.fullName || '',
            bookTitle: editingReservation.book?.title || '',
          },
        });
      }
    }
  };

  const handleDelete = async () => {
    if (deletingReservation) {
      await deleteMutation.mutateAsync(deletingReservation.id);
      setDeletingReservation(null);
    }
  };

  const handleSearchSubmit = () => {
    setMultipleParams({
      search: searchValue,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    setParam("page", newPage);
  };

  const isSubmitting = updateMutation.isPending;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t("sidebar.dashboard"), href: "/dashboard" },
          { label: t("reservations.title") },
        ]}
      />

      <PageHeader
        title={t("reservations.title")}
        description={t("reservations.description")}
        searchPlaceholder={t("reservations.search")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
      />

      <ReservationsStatsCards />

      <ReservationsTable
        data={data?.data || []}
        meta={data?.meta}
        loading={isLoading}
        noDataText={t("reservations.noData")}
        currentPage={params.page}
        limit={params.limit}
        onPageChange={handlePageChange}
        onEdit={handleOpenSheet}
        onDelete={(item) => setDeletingReservation(item)}
      />

      <ReservationForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        reservation={editingReservation}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <DeleteDialog
        open={!!deletingReservation}
        onOpenChange={() => setDeletingReservation(null)}
        title={t("reservations.deleteConfirmTitle")}
        description={t("reservations.deleteConfirmDescription", {
          name: deletingReservation?.id || "",
        })}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

