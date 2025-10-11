"use client";

import * as React from "react";
import { Button, Snackbar } from "@/components/ui";

export function SnackbarShowcase() {
  const [open, setOpen] = React.useState(false);
  return open ? (
    <Snackbar
      message="Saved"
      actionLabel="Undo"
      onAction={() => setOpen(false)}
    />
  ) : (
    <Button size="sm" onClick={() => setOpen(true)}>
      Show
    </Button>
  );
}
