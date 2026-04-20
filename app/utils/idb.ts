export const AttachmentDB = {
  getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("chat-next-web-attachments", 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("attachments")) {
          db.createObjectStore("attachments");
        }
      };
      request.onsuccess = (e: any) => resolve(e.target.result);
      request.onerror = (e: any) => reject(e.target.error);
    });
  },
  async set(id: string, data: any): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("attachments", "readwrite");
      const store = tx.objectStore("attachments");
      const request = store.put(data, id);
      request.onsuccess = () => resolve();
      request.onerror = (e: any) => reject(e.target.error);
    });
  },
  async get(id: string): Promise<any> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("attachments", "readonly");
      const store = tx.objectStore("attachments");
      const request = store.get(id);
      request.onsuccess = (e: any) => resolve(e.target.result);
      request.onerror = (e: any) => reject(e.target.error);
    });
  },
  async del(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("attachments", "readwrite");
      const store = tx.objectStore("attachments");
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = (e: any) => reject(e.target.error);
    });
  },
  async clear(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("attachments", "readwrite");
      const store = tx.objectStore("attachments");
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = (e: any) => reject(e.target.error);
    });
  },
};
