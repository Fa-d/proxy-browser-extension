import { registerTabDataListeners } from './tabData';
import { registerMessageHandler } from './messageHandler';

console.log('Background script loaded at', new Date().toISOString());


registerTabDataListeners();
registerMessageHandler();


// Example PAC script pattern for documentation:
// function FindProxyForURL(url, host) {
//   if (shExpMatch(host, '*.example.com')) {
//     return 'PROXY proxy.example.com:443';
//   }
//   return 'DIRECT';
// }

