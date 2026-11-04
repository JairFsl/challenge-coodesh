import 'reflect-metadata';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerDependencies } from './src/di/container';

registerDependencies();

AppRegistry.registerComponent(appName, () => App);
