import type { Role } from "@prisma/client";

export const permissions = {
  admin: [
    "manage_users",
    "manage_org_settings",
    "view_audit_logs",
    "create_reports",
    "upload_files",
    "view_reports",
    "view_raw_reports",
    "edit_reports",
    "generate_explanations",
    "edit_generated_explanations",
    "approve_explanations",
    "reject_explanations",
    "download_pdfs",
    "delete_reports",
    "audit_export",
    "mark_sent_to_patient"
  ],
  physician: [
    "view_reports",
    "view_raw_reports",
    "edit_generated_explanations",
    "approve_explanations",
    "reject_explanations",
    "download_pdfs",
    "mark_sent_to_patient"
  ],
  clinician_reviewer: [
    "view_reports",
    "view_raw_reports",
    "edit_generated_explanations",
    "reject_explanations",
    "download_pdfs"
  ],
  staff: ["create_reports", "upload_files", "generate_explanations", "submit_for_review", "view_own_reports"],
  viewer: ["view_approved_summaries"]
} as const satisfies Record<Role, readonly string[]>;

export type Permission = (typeof permissions)[Role][number];

export function roleHasPermission(role: Role, permission: string) {
  return permissions[role].includes(permission as never);
}
