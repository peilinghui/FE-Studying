/**
 * @format
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

if(__DEV__) {
    //import('./reactotron').then(() => console.log('Reactotron Configured'))
}

import { YellowBox } from 'react-native';
import './src/index'

console.ignoredYellowBox = [
    'Warning: componentWillMount is deprecated',
    'Warning: componentWillReceiveProps is deprecated',
    'Warning: componentWillUpdate is deprecated',
    'Warning: isMounted(...) is deprecated',
]
YellowBox.ignoreWarnings([
    'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
]);
