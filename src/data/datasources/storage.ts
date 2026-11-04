import { createAsyncStorage } from '@react-native-async-storage/async-storage';

import { STORAGE_NAME } from '@/core/config/constants';

export const storage = createAsyncStorage(STORAGE_NAME);
