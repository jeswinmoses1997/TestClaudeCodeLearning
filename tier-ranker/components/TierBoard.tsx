"use client";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext, DragOverlay, MouseSensor, TouchSensor, KeyboardSensor, closestCorners, pointerWithin,
  type CollisionDetection,
  useDroppable, useSensor, useSensors, type DragEndEvent, type DragOverEvent, type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, horizontalListSortingStrategy, rectSortingStrategy,
  sortableKeyboardCoordinates, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CONCEPTS, TIERS, type Concept } from "@/lib/concepts";
import { buildTierListCanvas, saveImage, type BoardState } from "@/lib/exportPng";
import { ConceptChip } from "./ConceptChip";
import { InfoPanel } from "./InfoPanel";

const STORAGE_KEY = "tier-ranker.v1";
const byId: Record<string, Concept> = Object.fromEntries(CONCEPTS.map((c) => [c.id, c]));
const initial = (): BoardState => ({
  S: [], A: [], B: [], C: [], D: [], unranked: CONCEPTS.map((c) => c.id),
});
type Zone = keyof BoardState;

// Prefer what's under the pointer (works for empty rows); fall back to nearest corners.
const ZONES = new Set<string>(["S", "A", "B", "C", "D", "unranked"]);
const collision: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  if (!hits.length) return closestCorners(args);
  const chips = hits.filter((h) => !ZONES.has(String(h.id)));
  return chips.length ? chips : hits; // prefer a chip under the pointer over its container
};

const SortableChip = memo(function SortableChip({ item, onOpen }: { item: Concept; onOpen: (c: Concept) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <ConceptChip
      ref={setNodeRef}
      item={item}
      dragging={isDragging}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={() => onOpen(item)}
      {...attributes}
      {...listeners}
    />
  );
});

const DropZone = memo(function DropZone({
  id, ids, className, tray, onOpen, dataTier,
}: { id: Zone; ids: string[]; className: string; tray?: boolean; onOpen: (c: Concept) => void; dataTier: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <SortableContext items={ids} strategy={tray ? horizontalListSortingStrategy : rectSortingStrategy}>
      <div
        ref={setNodeRef}
        id={tray ? "unranked" : `zone-${id}`}
        data-tier={dataTier}
        className={`${className} ${isOver ? "is-over" : ""}`}
      >
        {ids.map((cid) => byId[cid] && <SortableChip key={cid} item={byId[cid]} onOpen={onOpen} />)}
      </div>
    </SortableContext>
  );
});

export function TierBoard() {
  const [board, setBoard] = useState<BoardState>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [active, setActive] = useState<Concept | null>(null);
  const [open, setOpen] = useState<Concept | null>(null);
  const [btnLabel, setBtnLabel] = useState("Download PNG");
  const [busy, setBusy] = useState(false);
  const justDragged = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as BoardState;
        const known = new Set(CONCEPTS.map((c) => c.id));
        const placed = new Set<string>();
        const next = initial();
        for (const z of Object.keys(next) as Zone[]) {
          next[z] = (saved[z] ?? []).filter((id) => known.has(id) && !placed.has(id) && placed.add(id));
        }
        for (const c of CONCEPTS) if (!placed.has(c.id)) next.unranked.push(c.id);
        setBoard(next);
      }
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board, hydrated]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findZone = useCallback(
    (id: string, b: BoardState): Zone | undefined =>
      id in b ? (id as Zone) : (Object.keys(b) as Zone[]).find((z) => b[z].includes(id)),
    [],
  );

  const onDragStart = (e: DragStartEvent) => {
    justDragged.current = true;
    setActive(byId[String(e.active.id)] ?? null);
  };

  const onDragOver = ({ active: a, over }: DragOverEvent) => {
    if (!over) return;
    const aid = String(a.id), oid = String(over.id);
    setBoard((b) => {
      const from = findZone(aid, b), to = findZone(oid, b);
      if (!from || !to || from === to) return b;
      const overIdx = b[to].indexOf(oid);
      const isBelow =
        over.rect && a.rect.current.translated &&
        a.rect.current.translated.left > over.rect.left + over.rect.width / 2;
      const idx = overIdx >= 0 ? overIdx + (isBelow ? 1 : 0) : b[to].length;
      return {
        ...b,
        [from]: b[from].filter((x) => x !== aid),
        [to]: [...b[to].slice(0, idx), aid, ...b[to].slice(idx)],
      };
    });
  };

  const onDragEnd = ({ active: a, over }: DragEndEvent) => {
    setActive(null);
    setTimeout(() => (justDragged.current = false), 50);
    if (!over) return;
    const aid = String(a.id), oid = String(over.id);
    setBoard((b) => {
      const z = findZone(aid, b);
      if (!z || z !== findZone(oid, b)) return b;
      const from = b[z].indexOf(aid), to = b[z].indexOf(oid);
      if (to < 0 || from === to) return b;
      return { ...b, [z]: arrayMove(b[z], from, to) };
    });
  };

  const openPanel = useCallback((c: Concept) => {
    if (justDragged.current) return;
    setOpen(c);
  }, []);
  const closePanel = useCallback(() => setOpen(null), []);

  const reset = () => setBoard(initial());
  const rankedCount = CONCEPTS.length - board.unranked.length;

  const download = async () => {
    setBusy(true);
    setBtnLabel("Rendering…");
    try {
      const canvas = await buildTierListCanvas(board, /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 1.5 : 2);
      await saveImage(canvas, "system-design-tier-list.png");
      setBtnLabel("Saved");
    } finally {
      setBusy(false);
      setTimeout(() => setBtnLabel("Download PNG"), 1400);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActive(null)}
    >
      <main className="tool-main">
        <div className="summary">
          <div className="summary-count" aria-live="polite">
            {rankedCount} <span>of {CONCEPTS.length} ranked</span>
          </div>
          <div className="summary-bar" aria-hidden="true">
            {TIERS.map((t) => (
              <i key={t.id} style={{ background: t.color, width: `${(board[t.id].length / CONCEPTS.length) * 100}%` }} />
            ))}
          </div>
        </div>
        <section id="tiers" aria-label="Tiers">
          {TIERS.map((t) => (
            <div className="tier-row" data-tier={t.id} key={t.id}>
              <div className="tier-label" style={{ background: t.color, color: t.fg }}>{t.id}</div>
              <DropZone id={t.id} ids={board[t.id]} className="drop-zone" dataTier={t.id} onOpen={openPanel} />
            </div>
          ))}
        </section>
      </main>

      <InfoPanel item={open} onClose={closePanel} />

      <footer className="sticky-bar">
        <div className="sticky-inner">
          <div className="sticky-head">
            <div>
              <div className="sticky-label">Unranked</div>
              <div className="sticky-hint">Drag a concept into a tier above</div>
            </div>
            <div className="sticky-actions">
              <button id="reset" className="btn" onClick={reset}>Reset</button>
              <button id="download" className="btn btn-primary" onClick={download} disabled={busy}>{btnLabel}</button>
            </div>
          </div>
          <DropZone id="unranked" ids={board.unranked} className="unranked-zone" tray dataTier="unranked" onOpen={openPanel} />
        </div>
      </footer>

      <DragOverlay>{active ? <ConceptChip item={active} overlay /> : null}</DragOverlay>
    </DndContext>
  );
}
