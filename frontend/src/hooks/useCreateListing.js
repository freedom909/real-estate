import useMutationHandler from './useMutationHandler';
import { CREATE_LISTING } from '../graphql/listings';

export default function useCreateListing(options = {}) {
  const selectStatus = (data) => {
    const res = data?.createListing;
    if (!res) return { ok: false, message: 'No response' };
    return { ok: Boolean(res.success), message: res.message || '' };
  };

  const {
    execute,
    data,
    error,
    loading,
    reset,
    status,
  } = useMutationHandler(CREATE_LISTING, { selectStatus, ...options });

  const createListing = async (input) => execute({ input });

  return { createListing, data, error, loading, reset, status };
}