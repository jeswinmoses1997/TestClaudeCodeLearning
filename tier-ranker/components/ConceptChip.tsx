"use client";
import { forwardRef, type HTMLAttributes } from "react";
import { iconUrl, type Concept } from "@/lib/concepts";

type Props = { item: Concept; dragging?: boolean; overlay?: boolean } & HTMLAttributes<HTMLDivElement>;

export const ConceptChip = forwardRef<HTMLDivElement, Props>(function ConceptChip(
  { item, dragging, overlay, className = "", ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      data-item-id={item.id}
      className={`item ${dragging ? "is-dragging" : ""} ${overlay ? "item-overlay" : ""} ${className}`}
      {...rest}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="item-logo" src={iconUrl(item.icon)} alt={item.name} draggable={false} />
      <span>{item.name}</span>
    </div>
  );
});
