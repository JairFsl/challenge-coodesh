import { useMemo } from 'react';
import { container, type InjectionToken } from 'tsyringe';

/** Resolves a dependency (use case, repository or service) from the DI container. */
export function useDependency<T>(token: InjectionToken<T>): T {
  return useMemo(() => container.resolve(token), [token]);
}
