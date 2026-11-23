"use client";
import { useEffect } from "react";
import { iconUrl, type Concept } from "@/lib/concepts";

export function InfoPanel({ item, onClose }: { item: Concept | null; onClose: () => void }) {
  const isOpen = item !== null;
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <aside id="panel" className={`panel ${item ? "open" : ""}`} aria-hidden={!item} inert={!item}>
      <button id="panel-close" className="panel-close" aria-label="Close details" onClick={onClose}>×</button>
      <div className="panel-header">
        {item && (
          // eslint-disable-next-line @next/next/no-img-element
          <img id="panel-logo" className="panel-logo" src={iconUrl(item.icon)} alt={item.name} />
        )}
        <div id="panel-name" className="panel-name">{item?.name}</div>
      </div>
      <section className="panel-section"><h4>What is it?</h4><p id="panel-what">{item?.what}</p></section>
      <section className="panel-section"><h4>When is it useful?</h4><p id="panel-when">{item?.when}</p></section>
      <section className="panel-section"><h4>Tools</h4><p id="panel-tools">{item?.tools}</p></section>
    </aside>
  );
}
