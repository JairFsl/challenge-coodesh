import { useQuery } from '@tanstack/react-query';

import { GetWordDefinitionUseCase } from '@/domain/usecases/words';

import { useDependency } from './useDependency';

/** Word definition cached forever (and persisted), so repeated lookups never hit the API. */
export function useWordDefinition(word: string) {
  const getWordDefinition = useDependency(GetWordDefinitionUseCase);

  return useQuery({
    queryKey: ['word-definition', word],
    queryFn: ({ signal }) => getWordDefinition.execute(word, signal),
    staleTime: Infinity,
  });
}
