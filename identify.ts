// identify.ts
import { FigmaDocumentNode } from "./types";

/**
 * Checks if a given Figma node represents a modal.
 * @param node Figma document node
 * @returns boolean indicating if it's a modal
 */
export function isModal(node: FigmaDocumentNode): boolean {
  const name = node.name || "";
  return name.toLowerCase().includes("modal");
}
