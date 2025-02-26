import { createClient, type RedisClientType } from "redis";

/**
 * KVStore interface defining key-value store operations
 */
export interface KVStore {
  hSet(key: string, field: string, value: string | number): Promise<void>;
  hGetAll(key: string): Promise<Record<string, string>>;
  set<T>(
    key: string,
    value: T,
    ttl_in_seconds?: number,
    key_prefix?: string
  ): Promise<void>;
  get<T>(key: string, key_prefix?: string): Promise<T | null>;
  delete(key: string, key_prefix?: string): Promise<void>;
  sAdd(key: string, value: string | number): Promise<void>;
  sMembers(key: string): Promise<Array<string>>;
  sRem(key: string, value: string | number): Promise<void>;
}

/**
 * Represents a key-value store using Redis.
 * @implements {KVStore}
 */
export class RedisKV implements KVStore {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL
    });

    this.client.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });
  }

  /**
   * Ensures the Redis client is connected
   */
  public async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  /**
   * Gets the full key with prefix
   */
  private getFullKey(key: string, key_prefix: string = ""): string {
    return key_prefix + key.replaceAll("/", "-");
  }

  /**
   * Sets a hash field
   * @param key The key under which to store the hash
   * @param field The field in the hash
   * @param value The value to store
   */
  async hSet(
    key: string,
    field: string,
    value: string | number
  ): Promise<void> {
    await this.ensureConnection();
    const fullKey = this.getFullKey(key);
    await this.client.hSet(fullKey, field, value.toString());
  }

  /**
   * Gets all fields and values from a hash
   * @param key The hash key
   * @returns Record of field-value pairs
   */
  async hGetAll(key: string): Promise<Record<string, string>> {
    await this.ensureConnection();
    const fullKey = this.getFullKey(key);
    return await this.client.hGetAll(fullKey);
  }

  /**
   * Sets a value in the KV store
   * @param key The key under which to store the value
   * @param value The value to store
   * @param ttl_in_seconds Optional time-to-live in seconds
   * @param key_prefix Optional key prefix
   */
  async set<T>(
    key: string,
    value: T,
    ttl_in_seconds?: number,
    key_prefix: string = ""
  ): Promise<void> {
    await this.ensureConnection();
    const fullKey = this.getFullKey(key, key_prefix);
    const serializedValue = JSON.stringify(value);

    await this.client.set(fullKey, serializedValue);

    if (ttl_in_seconds) {
      await this.client.expire(fullKey, ttl_in_seconds);
    }
  }

  /**
   * Gets a value from the KV store
   * @param key The key to retrieve
   * @param key_prefix Optional key prefix
   * @returns The stored value or null if not found
   */
  async get<T>(key: string, key_prefix: string = ""): Promise<T | null> {
    await this.ensureConnection();
    const fullKey = this.getFullKey(key, key_prefix);

    const value = await this.client.get(fullKey);
    return value ? (JSON.parse(value) as T) : null;
  }

  /**
   * Deletes a key from the KV store
   * @param key The key to delete
   * @param key_prefix Optional key prefix
   */
  async delete(key: string, key_prefix: string = ""): Promise<void> {
    await this.ensureConnection();
    const fullKey = this.getFullKey(key, key_prefix);
    await this.client.del(fullKey);
  }

  /**
   * Adds a member to a set
   * @param key The set key
   * @param value The value to add to the set
   */
  async sAdd(key: string, value: string | number): Promise<void> {
    await this.ensureConnection();
    const fullKey = this.getFullKey(key);
    await this.client.sAdd(fullKey, value.toString());
  }

  /**
   * Gets all members of a set
   * @param key The set key
   * @returns Array of set members
   */
  async sMembers(key: string): Promise<Array<string>> {
    await this.ensureConnection();
    const fullKey = this.getFullKey(key);
    return await this.client.sMembers(fullKey);
  }

  /**
   * Removes a member from a set
   * @param key The set key
   * @param value The value to remove from the set
   */
  async sRem(key: string, value: string | number): Promise<void> {
    await this.ensureConnection();
    const fullKey = this.getFullKey(key);
    await this.client.sRem(fullKey, value.toString());
  }

  /**
   * Closes the Redis connection
   */
  async close(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}
