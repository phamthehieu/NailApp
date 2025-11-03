import {MMKV} from 'react-native-mmkv';

export const storage = new MMKV();

export function loadString(key: string): string | null {
  try {
    return storage.getString(key) ?? null;
  } catch {
    return null;
  }
}

export function saveString(key: string, value: string): boolean {
  try {
    storage.set(key, value);
    return true;
  } catch {
    return false;
  }
}

export function load<T>(key: string): T | null {
  let almostThere: string | null = null;
  try {
    almostThere = loadString(key);
    return JSON.parse(almostThere ?? '') as T;
  } catch {
    return (almostThere as T) ?? null;
  }
}

export function save(key: string, value: unknown): boolean {
  try {
    saveString(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key: string): void {
  try {
    storage.delete(key);
  } catch {}
}

export function clear(): void {
  try {
    storage.clearAll();
  } catch {}
}

export function loadBool(key: string): boolean | undefined {
  try {
    if (!storage.contains(key)) return undefined;
    return storage.getBoolean(key) ?? undefined;
  } catch {
    return undefined;
  }
}

export function saveBool(key: string, value: boolean): boolean {
  try {
    storage.set(key, value);
    return true;
  } catch {
    return false;
  }
}

export function getBool(key: string, defaultValue: boolean = true): boolean {
  const value = loadBool(key);
  return value !== undefined ? value : defaultValue;
}

export function setBool(key: string, value: boolean) {
  saveBool(key, value);
}
