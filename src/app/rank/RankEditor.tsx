"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { saveRanking, type RankEntry } from "./actions";

type SearchResult = RankEntry;

function coverThumb(imageId: string | null) {
  return imageId
    ? `https://images.igdb.com/igdb/image/upload/t_cover_small/${imageId}.jpg`
    : null;
}

function SortableRow({
  entry,
  index,
  onRemove,
}: {
  entry: RankEntry;
  index: number;
  onRemove: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const thumb = coverThumb(entry.coverImageId);

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex items-center gap-3 rounded-md border border-edge bg-surface px-3 py-2 ${
        isDragging ? "z-10 border-accent opacity-90" : ""
      }`}
    >
      <button
        type="button"
        aria-label={`Drag to reorder ${entry.name}`}
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted hover:text-foreground active:cursor-grabbing"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </button>
      <span className="w-7 text-center font-mono text-sm font-bold text-accent">
        {index + 1}
      </span>
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt=""
          width={30}
          height={40}
          className="h-10 w-[30px] rounded-sm object-cover"
        />
      ) : (
        <div className="h-10 w-[30px] rounded-sm bg-surface-hover" />
      )}
      <span className="min-w-0 flex-1 truncate font-mono text-sm">
        {entry.name}
        {entry.releaseYear && (
          <span className="ml-2 text-xs text-muted">{entry.releaseYear}</span>
        )}
      </span>
      <button
        type="button"
        onClick={() => onRemove(entry.id)}
        aria-label={`Remove ${entry.name}`}
        className="cursor-pointer px-1 text-muted transition-colors hover:text-red-400"
      >
        ✕
      </button>
    </li>
  );
}

export default function RankEditor({ initial }: { initial: RankEntry[] }) {
  const [entries, setEntries] = useState<RankEntry[]>(initial);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<
    { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [dirty, setDirty] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = value.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      setSearchError(null);
      return;
    }
    setSearching(true);
    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          setSearchError(data.error ?? "Search failed");
          setResults([]);
        } else {
          setSearchError(null);
          setResults(data.results);
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setSearchError("Search failed. Check your connection.");
          setResults([]);
        }
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  const markDirty = useCallback(() => {
    setDirty(true);
    setSaveState({ kind: "idle" });
  }, []);

  function addGame(game: SearchResult) {
    if (entries.length >= 10 || entries.some((e) => e.id === game.id)) return;
    setEntries([...entries, game]);
    handleQueryChange("");
    markDirty();
  }

  function removeGame(id: number) {
    setEntries(entries.filter((e) => e.id !== id));
    markDirty();
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setEntries((items) => {
      const from = items.findIndex((i) => i.id === active.id);
      const to = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, from, to);
    });
    markDirty();
  }

  async function save() {
    setSaveState({ kind: "saving" });
    const result = await saveRanking(entries);
    if (result.ok) {
      setDirty(false);
      setSaveState({ kind: "saved" });
    } else {
      setSaveState({ kind: "error", message: result.error });
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section>
        <h2 className="mb-3 font-mono text-sm font-bold uppercase tracking-wide text-muted">
          Add games
        </h2>
        <input
          type="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder={
            entries.length >= 10
              ? "Your list is full. Remove a game to add another."
              : "Search for a game..."
          }
          disabled={entries.length >= 10}
          className="w-full rounded-md border border-edge bg-surface px-3 py-2 text-sm outline-none focus:border-accent disabled:opacity-50"
        />
        <div className="mt-2">
          {searching && <p className="text-sm text-muted">Searching...</p>}
          {searchError && <p className="text-sm text-red-400">{searchError}</p>}
          {!searching && !searchError && query.trim().length >= 2 && results.length === 0 && (
            <p className="text-sm text-muted">No games found</p>
          )}
          <ul className="divide-y divide-edge overflow-hidden rounded-md border border-edge empty:hidden">
            {results.map((game) => {
              const added = entries.some((e) => e.id === game.id);
              const full = entries.length >= 10;
              const thumb = coverThumb(game.coverImageId);
              return (
                <li key={game.id}>
                  <button
                    type="button"
                    onClick={() => addGame(game)}
                    disabled={added || full}
                    className="flex w-full cursor-pointer items-center gap-3 bg-surface px-3 py-2 text-left transition-colors hover:bg-surface-hover disabled:cursor-default disabled:opacity-50"
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt=""
                        width={30}
                        height={40}
                        className="h-10 w-[30px] rounded-sm object-cover"
                      />
                    ) : (
                      <div className="h-10 w-[30px] rounded-sm bg-surface-hover" />
                    )}
                    <span className="min-w-0 flex-1 truncate font-mono text-sm">
                      {game.name}
                      {game.releaseYear && (
                        <span className="ml-2 text-xs text-muted">
                          {game.releaseYear}
                        </span>
                      )}
                    </span>
                    {added && <span className="text-xs text-accent">Added</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wide text-muted">
            Your top 10
          </h2>
          <span className="font-mono text-sm text-muted">{entries.length}/10</span>
        </div>
        {entries.length === 0 ? (
          <p className="rounded-md border border-dashed border-edge p-6 text-center text-sm text-muted">
            Search for games on the left and add them here. Drag to reorder.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={entries.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <ol className="space-y-2">
                {entries.map((entry, index) => (
                  <SortableRow
                    key={entry.id}
                    entry={entry}
                    index={index}
                    onRemove={removeGame}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        )}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saveState.kind === "saving" || !dirty}
            className="cursor-pointer rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saveState.kind === "saving" ? "Saving..." : "Save ranking"}
          </button>
          {saveState.kind === "saved" && (
            <span className="text-sm text-green-400">Saved</span>
          )}
          {saveState.kind === "error" && (
            <span className="text-sm text-red-400">{saveState.message}</span>
          )}
          {dirty && saveState.kind === "idle" && (
            <span className="text-sm text-muted">Unsaved changes</span>
          )}
        </div>
      </section>
    </div>
  );
}
