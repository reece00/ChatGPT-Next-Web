import { StateStorage } from "zustand/middleware";
import { get, set, del, clear } from "idb-keyval";
import { safeLocalStorage } from "@/app/utils";

const localStorage = safeLocalStorage();

class IndexedDBStorage implements StateStorage {
  public async getItem(name: string): Promise<string | null> {
    try {
      const value = (await get(name)) || localStorage.getItem(name);
      return value;
    } catch (error) {
      return localStorage.getItem(name);
    }
  }

  public async setItem(name: string, value: string): Promise<void> {
    try {
      const _value = JSON.parse(value);
      // Avoid redundant writes when only hydration markers or timestamps change
      try {
        const old = await get(name);
        if (old) {
          const oldJson = JSON.parse(old);
          const newJson = JSON.parse(value);
          const strip = (obj: any) => {
            try {
              const s = JSON.parse(JSON.stringify(obj));
              delete s.state?.lastUpdateTime;
              // hydration 标志不参与有效负载比较（避免仅因水合变化而重写）
              delete s.state?._hasHydrated;
              return s;
            } catch {
              return obj;
            }
          };
          const oldStripped = strip(oldJson);
          const newStripped = strip(newJson);
          if (JSON.stringify(oldStripped) === JSON.stringify(newStripped)) {
            // payload 未变化，跳过写入
            return;
          }
        }
      } catch {}
      await set(name, value);
    } catch (error) {
      localStorage.setItem(name, value);
    }
  }

  public async removeItem(name: string): Promise<void> {
    try {
      await del(name);
    } catch (error) {
      localStorage.removeItem(name);
    }
  }

  public async clear(): Promise<void> {
    try {
      await clear();
    } catch (error) {
      localStorage.clear();
    }
  }
}

export const indexedDBStorage = new IndexedDBStorage();
