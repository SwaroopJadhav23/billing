import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createResource, deleteResource, listResource, updateResource } from '../services/api';

export function useResource(resource, params = {}) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [resource, params],
    queryFn: () => listResource(resource, params)
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [resource] });
  const create = useMutation({ mutationFn: (payload) => createResource(resource, payload), onSuccess: invalidate });
  const update = useMutation({ mutationFn: ({ id, payload }) => updateResource(resource, id, payload), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id) => deleteResource(resource, id), onSuccess: invalidate });

  return { ...query, items: query.data?.items || [], create, update, remove };
}
