import { useCallback, useEffect, useState } from 'react';
import { getCache, setCache } from '../storage/cache';

interface UseCachedQueryOptions<T> {
  key: string;
  fetchFn: () => Promise<T>;
  initialData?: T;
  ttl?: number;
}

/**
 * Hook truy vấn dữ liệu với cơ chế hiển thị nhanh từ Cache và fetch API chạy ngầm
 */
export function useCachedQuery<T>({
  key,
  fetchFn,
  initialData,
  ttl,
}: UseCachedQueryOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    // 1. Nạp từ cache trước (nếu có)
    const cached = await getCache<T>(key);
    if (cached !== null) {
      setData(cached);
    }

    // 2. Fetch API làm mới
    try {
      const fresh = await fetchFn();
      setData(fresh);
      await setCache(key, fresh);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, ttl]);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch: execute,
  };
}

export default useCachedQuery;
