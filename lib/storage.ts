"use client";

import type { Track } from "./zoko";

const CONTINUE_KEY = "anistream:continue";
const WATCHED_KEY = "anistream:watched";
const LIST_KEY = "anistream:list";
const PREFS_KEY = "anistream:prefs";
const UPDATE_EVENT = "anistream:update";

export type ProgressEntry = {
  mediaId: number;
  title: string;
  cover: string;
  episode: number;
  total: number;
  position: number;
  duration: number;
  track: Track;
  updatedAt: number;
};

export type ListEntry = {
  mediaId: number;
  title: string;
  cover: string;
  format?: string | null;
  year?: number | null;
  score?: number | null;
  addedAt: number;
};

type MapOf<T> = Record<string, T>;

function notify(key: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: key }));
}

function readMap<T>(key: string): MapOf<T> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as MapOf<T>)
      : {};
  } catch {
    return {};
  }
}

function writeMap<T>(key: string, value: MapOf<T>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
  notify(key);
}

function validProgress(value: unknown): value is ProgressEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<ProgressEntry>;
  return (
    Number.isFinite(entry.mediaId) &&
    Number.isFinite(entry.episode) &&
    Number.isFinite(entry.position) &&
    Number.isFinite(entry.duration) &&
    typeof entry.title === "string" &&
    typeof entry.cover === "string"
  );
}

export function getProgress(mediaId: number): ProgressEntry | null {
  const entry = readMap<ProgressEntry>(CONTINUE_KEY)[String(mediaId)];
  return validProgress(entry) ? entry : null;
}

export function getContinueList(): ProgressEntry[] {
  return Object.values(readMap<ProgressEntry>(CONTINUE_KEY))
    .filter(validProgress)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveProgress(entry: ProgressEntry): void {
  if (!validProgress(entry)) return;
  const all = readMap<ProgressEntry>(CONTINUE_KEY);
  all[String(entry.mediaId)] = entry;
  writeMap(CONTINUE_KEY, all);
}

export function removeProgress(mediaId: number): void {
  const all = readMap<ProgressEntry>(CONTINUE_KEY);
  delete all[String(mediaId)];
  writeMap(CONTINUE_KEY, all);
}

export function clearProgress(): void {
  writeMap(CONTINUE_KEY, {});
}

export function getWatched(mediaId: number): number[] {
  const value = readMap<number[]>(WATCHED_KEY)[String(mediaId)];
  return Array.isArray(value)
    ? value.filter((episode) => Number.isFinite(episode))
    : [];
}

export function markWatched(mediaId: number, episode: number): void {
  const all = readMap<number[]>(WATCHED_KEY);
  const current = new Set(Array.isArray(all[String(mediaId)]) ? all[String(mediaId)] : []);
  current.add(episode);
  all[String(mediaId)] = [...current].sort((a, b) => a - b);
  writeMap(WATCHED_KEY, all);
}

export function getList(): ListEntry[] {
  return Object.values(readMap<ListEntry>(LIST_KEY))
    .filter(
      (entry) =>
        entry &&
        Number.isFinite(entry.mediaId) &&
        typeof entry.title === "string",
    )
    .sort((a, b) => b.addedAt - a.addedAt);
}

export function isInList(mediaId: number): boolean {
  return Boolean(readMap<ListEntry>(LIST_KEY)[String(mediaId)]);
}

export function toggleList(entry: Omit<ListEntry, "addedAt">): boolean {
  const all = readMap<ListEntry>(LIST_KEY);
  const key = String(entry.mediaId);

  if (all[key]) {
    delete all[key];
    writeMap(LIST_KEY, all);
    return false;
  }

  all[key] = { ...entry, addedAt: Date.now() };
  writeMap(LIST_KEY, all);
  return true;
}

export function removeFromList(mediaId: number): void {
  const all = readMap<ListEntry>(LIST_KEY);
  delete all[String(mediaId)];
  writeMap(LIST_KEY, all);
}

export function getPreferredTrack(): Track {
  if (typeof window === "undefined") return "sub";
  try {
    const prefs = JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? "{}");
    return prefs?.track === "dub" ? "dub" : "sub";
  } catch {
    return "sub";
  }
}

export function setPreferredTrack(track: Track): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify({ track }));
  } catch {
    return;
  }
}

export const STORAGE_UPDATE_EVENT = UPDATE_EVENT;
