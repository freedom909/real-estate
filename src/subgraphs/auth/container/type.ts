export interface CacheClient {
  set(
    key: string,
    value: string,
    options?: { ttl?: number }
  ): Promise<void>;

  get(key: string): Promise<string | null>;

  del(key: string): Promise<void>;
}