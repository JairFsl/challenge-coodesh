export type PendingOperationType = 'favorite.add' | 'favorite.remove' | 'history.add';

export interface PendingOperation {
  id: string;
  userId: string;
  type: PendingOperationType;
  word: string;
  createdAt: string;
}
