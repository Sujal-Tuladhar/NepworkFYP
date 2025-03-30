"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = ({ className, ...props }) => (
  <LabelPrimitive.Root
    data-slot="label"
    className={cn(
      "flex items-center gap-2 text-sm font-medium leading-none select-none",
      "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      className
    )}
    {...props}
  />
);

export { Label };
