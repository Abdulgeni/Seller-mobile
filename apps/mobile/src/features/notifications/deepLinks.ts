import { DeepLinkParamsSchema } from "@repo/schemas";
import { logger } from "@repo/ui";

export interface ParsedDeepLink {
  valid: boolean;
  orderId?: string | undefined;
  action?: "accept" | "view" | undefined;
  targetRoute?: string | undefined;
  error?: string | undefined;
}

/**
 * Validates and parses incoming deep links against strict Zod contract.
 * Supported schemes: seller://orders/:id and seller://orders/:id?action=accept|view
 */
export function parseAndValidateDeepLink(rawUrl: string): ParsedDeepLink {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { valid: false, error: "Empty or invalid URL" };
  }

  try {
    // Normalise scheme for URL parsing
    let normalized = rawUrl.trim();
    if (normalized.startsWith("seller://")) {
      normalized = normalized.replace("seller://", "https://seller.internal/");
    }

    const parsedUrl = new URL(normalized);
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);

    // Expected: /orders/:id
    if (pathParts[0] !== "orders" || !pathParts[1]) {
      return { valid: false, error: `Unrecognized route pattern: ${parsedUrl.pathname}` };
    }

    const orderId = pathParts[1];
    const rawAction = parsedUrl.searchParams.get("action") ?? undefined;

    // Strict Zod validation
    const validationResult = DeepLinkParamsSchema.safeParse({
      id: orderId,
      action: rawAction,
    });

    if (!validationResult.success) {
      logger.warn("Deep link validation failed", {
        rawUrl,
        errors: validationResult.error.format(),
      });
      return {
        valid: false,
        error: `Deep link parameter schema violation: ${validationResult.error.message}`,
      };
    }

    const { id, action } = validationResult.data;
    const targetRoute = action
      ? `/orders/${id}?action=${action}`
      : `/orders/${id}`;

    return {
      valid: true,
      orderId: id,
      action,
      targetRoute,
    };
  } catch (err: unknown) {
    logger.warn("Exception parsing deep link URL", { rawUrl, err });
    return { valid: false, error: "Malformed URL syntax" };
  }
}
