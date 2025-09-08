import * as React from "react";

export default function EmptyRow({ text }: { text: string }) {
  return <div className="tasks-placeholder text-xs">{text}</div>;
}
