import { command, success, type Result } from "#lib/result";
import { listObjects, buildDocumentPrefix } from "#infrastructure/s3";
import type { ListDocumentsInput } from "../types/inputs";
import type {
  ListDocumentsResult,
  DocumentRow,
  DocumentStatus,
  DocumentCategory,
} from "../types/outputs";

/**
 * Default icon paths for documents
 */
const DEFAULT_DOC_ICON = "/documents/table-doc.svg";
const EFSORA_PEOPLE_ICON = "/documents/table-people.svg";

/**
 * Get file extension from filename
 */
function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts[parts.length - 1]?.toLowerCase() ?? "") : "";
}

/**
 * Determine category based on file extension or name
 * This is a simple heuristic - in production, this would come from metadata
 */
function determineCategory(fileName: string): DocumentCategory {
  const lowerName = fileName.toLowerCase();
  const ext = getFileExtension(fileName);

  // Check for billing-related files
  if (
    lowerName.includes("invoice") ||
    lowerName.includes("billing") ||
    lowerName.includes("payment") ||
    ext === "xlsx" ||
    ext === "xls"
  ) {
    return "Billing";
  }

  // Check for legal-related files
  if (
    lowerName.includes("contract") ||
    lowerName.includes("legal") ||
    lowerName.includes("agreement") ||
    lowerName.includes("nda")
  ) {
    return "Legal";
  }

  // Check for asset files
  if (
    lowerName.includes("asset") ||
    lowerName.includes("image") ||
    lowerName.includes("logo") ||
    lowerName.includes("brand") ||
    ext === "png" ||
    ext === "jpg" ||
    ext === "jpeg" ||
    ext === "gif" ||
    ext === "svg" ||
    ext === "zip"
  ) {
    return "Assets";
  }

  // Default to SoW (Statement of Work)
  return "SoW";
}

/**
 * Determine status based on file metadata
 * In a real implementation, this would come from database metadata
 */
function determineStatus(): DocumentStatus {
  // Default status - in production this would be stored in database
  return "sent";
}

/**
 * List documents from S3 for a given company and project
 */
export function listDocumentsFromS3(
  input: ListDocumentsInput,
): Result<ListDocumentsResult> {
  return command(async () => {
    const prefix = buildDocumentPrefix(input.companyId, input.projectId);
    const result = await listObjects({ prefix });
    return { result, input };
  }, handleListDocumentsResult);
}

type S3Object = {
  key: string;
  fileName: string;
  size: number;
  lastModified: Date;
};

export function handleListDocumentsResult(
  data: unknown,
): Result<ListDocumentsResult> {
  const { result } = data as {
    result: {
      objects: S3Object[];
    };
    input: ListDocumentsInput;
  };

  // Filter out empty folder markers (keys ending with /)
  const validObjects = result.objects.filter(
    (obj) => obj.fileName && !obj.key.endsWith("/"),
  );

  const documents: DocumentRow[] = validObjects.map((obj, index) => {
    const lastModified = obj.lastModified.toISOString();

    return {
      id: String(index + 1),
      fileName: {
        name: obj.fileName,
        icon: DEFAULT_DOC_ICON,
      },
      uploader: {
        name: "Efsora",
        icon: EFSORA_PEOPLE_ICON,
      },
      lastUpdated: lastModified,
      dateCreated: lastModified, // Using lastModified as creation date (S3 doesn't store creation time)
      status: determineStatus(),
      category: determineCategory(obj.fileName),
    };
  });

  return success({ documents });
}
