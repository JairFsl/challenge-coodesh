import type { NavigatorScreenParams } from '@react-navigation/native';

export type WordSource = 'list' | 'history' | 'favorites';

export type HomeTabParamList = {
  WordList: undefined;
  History: undefined;
  Favorites: undefined;
};

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Home: NavigatorScreenParams<HomeTabParamList>;
  WordDetail: { word: string; source: WordSource };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
