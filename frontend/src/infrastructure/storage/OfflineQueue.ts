interface QueuedAction {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: unknown;
  timestamp: number;
}

export class OfflineQueue {
  private static readonly QUEUE_KEY = 'offline_queue';

  static queue(action: Omit<QueuedAction, 'id' | 'timestamp'>): void {
    const queue = this.getQueue();
    const queuedAction: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    queue.push(queuedAction);
    this.saveQueue(queue);
  }

  static getQueue(): QueuedAction[] {
    const stored = localStorage.getItem(this.QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static clearQueue(): void {
    localStorage.removeItem(this.QUEUE_KEY);
  }

  static removeAction(id: string): void {
    const queue = this.getQueue();
    const filtered = queue.filter((action) => action.id !== id);
    this.saveQueue(filtered);
  }

  private static saveQueue(queue: QueuedAction[]): void {
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }

  static async flushQueue(
    requestFn: (endpoint: string, options: RequestInit) => Promise<unknown>
  ): Promise<void> {
    const queue = this.getQueue();
    
    for (const action of queue) {
      try {
        await requestFn(action.endpoint, {
          method: action.method,
          body: action.body ? JSON.stringify(action.body) : undefined,
        });
        this.removeAction(action.id);
      } catch (error) {
        console.error(`Failed to flush queued action ${action.id}:`, error);
        // Keep failed actions in queue for retry
      }
    }
  }
}
