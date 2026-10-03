import * as React from "react";

import { cn } from "@/lib/utils";

const EmptyMediaVariantContext = React.createContext<string>("icon");

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg text-center p-6",
        className,
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "mx-auto flex w-full max-w-sm flex-col items-center gap-2 text-center",
        className,
      )}
      {...props}
    />
  );
}

function EmptyMedia({ className, variant, ...props }: React.ComponentProps<"div"> & { variant?: string }) {
  const parentVariant = React.useContext(EmptyMediaVariantContext);
  const activeVariant = variant ?? parentVariant;

  return (
    <div
      data-slot="empty-media"
      data-variant={activeVariant}
      className={cn(
        "mx-auto flex max-w-[100%] items-center justify-center gap-2 text-muted-foreground",
        activeVariant === "icon" && "size-10 rounded-md border bg-muted",
        activeVariant === "icon" && "[&>svg]:size-5",
        className,
      )}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground text-sm text-balance [text-wrap:pretty]",
        className,
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "mx-auto flex w-full max-w-sm flex-col items-center gap-1.5 py-4 text-center",
        className,
      )}
      {...props}
    />
  );
}

export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
};
