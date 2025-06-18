export async function pingServer(url: string, username?: string, password?: string): Promise<boolean> {
  const isDomain = /[a-zA-Z]/.test(url);
  if (!isDomain) {
    return false;
  } else {
    return true;
  }
  // return new Promise((resolve) => {
  //   const port = chrome.runtime.connect();
  //   port.postMessage({ action: 'setProxy', url, username, password });
  //   port.onMessage.addListener((response) => {
  //     if (response && response.status === 'Proxy set') {
  //       resolve(true);
  //     } else {
  //       resolve(false);
  //     }
  //     port.disconnect();
  //   });
  //   // Defensive: timeout in case background never responds
  //   setTimeout(() => {
  //     resolve(false);
  //     port.disconnect();
  //   }, 35000);
  // });
}
