
'use client';

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {}

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ className, ...props }, ref) => {
    const children = React.Children.toArray(props.children);
    const childrenWithSeparators = children.map((child, index) => {
      if (index < children.length - 1) {
        return (
          <React.Fragment key={index}>
            {child}
            <ChevronRight className="h-4 w-4" />
          </React.Fragment>
        );
      }
      return child;
    });

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      >
        <ol className="flex items-center gap-1.5">{childrenWithSeparators}</ol>
      </nav>
    );
  }
);
Breadcrumbs.displayName = "Breadcrumbs";


interface BreadcrumbItemProps extends React.ComponentProps<typeof Link> {
    isCurrent?: boolean;
}

const BreadcrumbItem = React.forwardRef<HTMLAnchorElement, BreadcrumbItemProps>(
  ({ className, isCurrent, ...props }, ref) => {
    return (
        <li className="inline-flex items-center gap-1.5">
             <Link
                ref={ref}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                    "transition-colors hover:text-foreground",
                    isCurrent ? "font-semibold text-foreground" : "",
                    className
                )}
                {...props}
            />
        </li>
    );
  }
);
BreadcrumbItem.displayName = "BreadcrumbItem";


export { Breadcrumbs, BreadcrumbItem };
