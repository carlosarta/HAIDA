import { useCallback, useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { GraphService } from '@/services/graph.service';

export function useGraph() {
  const { acquireToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createGraphService = useCallback(
    async (scopes: string[]): Promise<GraphService> => {
      const token = await acquireToken(scopes);
      return new GraphService(token);
    },
    [acquireToken]
  );

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const service = await createGraphService(['User.Read']);
      return await service.getProfile();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [createGraphService]);

  const getProfilePhoto = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const service = await createGraphService(['User.Read']);
      return await service.getProfilePhoto();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [createGraphService]);

  const getEmails = useCallback(
    async (top?: number) => {
      try {
        setLoading(true);
        setError(null);
        const service = await createGraphService(['Mail.Read']);
        return await service.getEmails(top);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [createGraphService]
  );

  const getCalendarEvents = useCallback(
    async (startDate: Date, endDate: Date) => {
      try {
        setLoading(true);
        setError(null);
        const service = await createGraphService(['Calendars.Read']);
        return await service.getCalendarEvents(startDate, endDate);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [createGraphService]
  );

  const getPeople = useCallback(
    async (top?: number) => {
      try {
        setLoading(true);
        setError(null);
        const service = await createGraphService(['People.Read']);
        return await service.getPeople(top);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [createGraphService]
  );

  const getFiles = useCallback(
    async (top?: number) => {
      try {
        setLoading(true);
        setError(null);
        const service = await createGraphService(['Files.Read']);
        return await service.getFiles(top);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [createGraphService]
  );

  return {
    getProfile,
    getProfilePhoto,
    getEmails,
    getCalendarEvents,
    getPeople,
    getFiles,
    loading,
    error,
  };
}
