export const TOKENS = {
  SupabaseClient: Symbol('SupabaseClient'),
  HttpClient: Symbol('HttpClient'),

  AuthRepository: Symbol('AuthRepository'),
  WordListRepository: Symbol('WordListRepository'),
  DictionaryRepository: Symbol('DictionaryRepository'),
  FavoritesRepository: Symbol('FavoritesRepository'),
  HistoryRepository: Symbol('HistoryRepository'),

  AudioPlayer: Symbol('AudioPlayer'),
  SpeechService: Symbol('SpeechService'),
} as const;
