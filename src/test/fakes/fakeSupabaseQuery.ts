import type { SupabaseClient } from '@supabase/supabase-js';

export type QueryResult = { data: unknown; error: unknown };

export interface FakeQueryBuilder extends PromiseLike<QueryResult> {
  select: jest.Mock;
  order: jest.Mock;
  limit: jest.Mock;
  gt: jest.Mock;
  eq: jest.Mock;
  upsert: jest.Mock;
  delete: jest.Mock;
  abortSignal: jest.Mock;
}

/** Chainable PostgREST query double that resolves with `result`. */
export function createQueryBuilder(result: QueryResult): FakeQueryBuilder {
  const builder: FakeQueryBuilder = {
    select: jest.fn(() => builder),
    order: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    gt: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    upsert: jest.fn(() => builder),
    delete: jest.fn(() => builder),
    abortSignal: jest.fn(() => builder),
    then: (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return builder;
}

/** Supabase client double whose `from()` returns the given query builder. */
export function createSupabaseClient(builder: FakeQueryBuilder) {
  const from = jest.fn(() => builder);
  return { client: { from } as unknown as SupabaseClient, from };
}
