/**
 * @format
 */

import {AppRegistry, Text, TextInput} from 'react-native';
import App from './src/app/App';
import {name as appName} from './app.json';

// Disable font scaling globally for all Text and TextInput components
// This ensures text size is always controlled by app code, not device settings
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;

if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.allowFontScaling = false;

AppRegistry.registerComponent(appName, () => App);
