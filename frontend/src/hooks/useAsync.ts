import { useState, useCallback } from 'react';
import type { ApiError } from '@/types';
import axios from 'axios';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsync<T, A extends unknown[]>(
  asyncFn: (...args: A) => Promise<T>
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: A) => {
      setState({ data: null, loading: true, error: null });
      try {
        const data = await asyncFn(...args);
        setState({ data, loading: false, error: null });
        return data;
      } catch (err: unknown) {
        let message = 'An unexpected error occurred';
        if (axios.isAxiosError(err)) {
          const apiError = err.response?.data as ApiError | undefined;
          message = apiError?.message ?? err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setState({ data: null, loading: false, error: message });
        throw err;
      }
    },
    [asyncFn]
  );

  return { ...state, execute };
}
