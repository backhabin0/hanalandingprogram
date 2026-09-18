"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapSupabaseError, SAFE_SAVE_ERROR_MESSAGE, logUnexpectedSaveError } from "@/lib/supabase-errors";
import { CONSULTATION_STATUSES } from "@/lib/consultation-requests";
import type { ConsultationStatus } from "@/types/landing";

export async function updateConsultationStatusAction(
  id: string,
  status: string
): Promise<{ error: string | null }> {
  await requireUser();

  if (!(CONSULTATION_STATUSES as string[]).includes(status)) {
    return { error: "잘못된 상태값입니다." };
  }

  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("consultation_requests")
      .update({ status: status as ConsultationStatus })
      .eq("id", id);
    if (error) return { error: mapSupabaseError(error) };
  } catch (err) {
    logUnexpectedSaveError("updateConsultationStatusAction", err);
    return { error: SAFE_SAVE_ERROR_MESSAGE };
  }

  revalidatePath("/admin/consultations");
  revalidatePath(`/admin/consultations/${id}`);
  revalidatePath("/admin");
  return { error: null };
}
