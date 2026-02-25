import { useMutation } from '@apollo/client';

export default function useMutationHandler(mutation, options = {}) {
  const { selectStatus, onSuccess, onError } = options;
  const [mutate, { data, error, loading, reset }] = useMutation(mutation);

  const getStatus = () => {
    if (typeof selectStatus === 'function') {
      try {
        return selectStatus(data);
      } catch {
        return { ok: false, message: 'Status mapping failed' };
      }
    }
    if (error) return { ok: false, message: error.message };
    return { ok: Boolean(data), message: '' };
  };

  const execute = async (variables) => {
    try {
      const result = await mutate({ variables });
      const status = getStatus();
      if (status.ok && typeof onSuccess === 'function') onSuccess(result.data);
      return { ok: status.ok, message: status.message, data: result.data, error: null };
    } catch (e) {
      if (typeof onError === 'function') onError(e);
      return { ok: false, message: e.message || 'Mutation failed', data: null, error: e };
    }
  };

  return { execute, data, error, loading, reset, status: getStatus() };
}