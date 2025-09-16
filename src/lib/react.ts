import * as React from "react";

export const hasTextContent = (node: React.ReactNode): boolean => {
  if (node === null || node === undefined) return false;
  if (typeof node === "boolean") return false;
  if (typeof node === "string") return node.trim().length > 0;
  if (typeof node === "number") return true;
  if (Array.isArray(node)) return node.some((item) => hasTextContent(item));
  if (React.isValidElement(node)) {
    return hasTextContent(node.props.children);
  }
  return false;
};
