import * as React from "react";

export default function EmptyRow({ text }: { text: string }) {
  return <div className="tasks-placeholder text-label">{text}</div>;
}
