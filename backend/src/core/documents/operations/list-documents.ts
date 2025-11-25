import { command, success, type Result } from "#lib/result";
import {
  listObjects,
  buildDocumentPrefix,
  getObjectMetadata,
} from "#infrastructure/s3";
import { logger } from "#infrastructure/logger";
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
 * Default category for documents without metadata
 */
const DEFAULT_CATEGORY: DocumentCategory = "SoW";

/**
 * Determine status based on file metadata
 * In a real implementation, this would come from database metadata
 */
function determineStatus(): DocumentStatus {
  // Default status - in production this would be stored in database
  return "sent";
}

/**
 * Valid document categories
 */
const VALID_CATEGORIES: DocumentCategory[] = [
  "SoW",
  "Legal",
  "Billing",
  "Assets",
];

/**
 * Check if a string is a valid document category
 */
function isValidCategory(value: string | undefined): value is DocumentCategory {
  return (
    value !== undefined && VALID_CATEGORIES.includes(value as DocumentCategory)
  );
}

/**
 * List documents from S3 for a given company and project
 */
export function listDocumentsFromS3(
  input: ListDocumentsInput,
): Result<ListDocumentsResult> {
  return command(async () => {
    const prefix = buildDocumentPrefix(input.companyId, input.projectId);
    const listResult = await listObjects({ prefix });

    // Filter out empty folder markers (keys ending with /)
    const validObjects = listResult.objects.filter(
      (obj) => obj.fileName && !obj.key.endsWith("/"),
    );

    // Fetch metadata for each object to get the category
    const objectsWithMetadata = await Promise.all(
      validObjects.map(async (obj) => {
        try {
          const metadata = await getObjectMetadata(obj.key);
          logger.debug(
            {
              key: obj.key,
              fileName: obj.fileName,
              metadata: metadata.metadata,
              category: metadata.metadata?.category,
            },
            "Fetched S3 object metadata",
          );
          return {
            ...obj,
            category: metadata.metadata?.category,
          };
        } catch (error) {
          // If we can't get metadata, return the object without it
          logger.warn(
            {
              key: obj.key,
              fileName: obj.fileName,
              error,
            },
            "Failed to fetch S3 object metadata",
          );
          return {
            ...obj,
            category: undefined,
          };
        }
      }),
    );

    return { objects: objectsWithMetadata, input };
  }, handleListDocumentsResult);
}

type S3ObjectWithMetadata = {
  key: string;
  fileName: string;
  size: number;
  lastModified: Date;
  category?: string;
};

export function handleListDocumentsResult(
  data: unknown,
): Result<ListDocumentsResult> {
  const { objects } = data as {
    objects: S3ObjectWithMetadata[];
    input: ListDocumentsInput;
  };

  const documents: DocumentRow[] = objects.map((obj, index) => {
    const lastModified = obj.lastModified.toISOString();
    // Use category from S3 metadata, default to SoW if not present
    const category = isValidCategory(obj.category)
      ? obj.category
      : DEFAULT_CATEGORY;

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
      category,
    };
  });

  return success({ documents });
}
