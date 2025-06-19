import { registerTabDataListeners } from './tabData';
import { registerMessageHandler } from './messageHandler';
import { startSpeedBroadcasting } from './speedBroadcaster';

console.log('Background script loaded at', new Date().toISOString());


registerTabDataListeners();
registerMessageHandler();
startSpeedBroadcasting();


// Example PAC script pattern for documentation:
// function FindProxyForURL(url, host) {
//   if (shExpMatch(host, '*.example.com')) {
//     return 'PROXY proxy.example.com:443';
//   }
//   return 'DIRECT';
// }

