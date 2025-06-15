// src/background/notifications.ts
export function showNotification(title: string, message: string) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "img/thunder.png",
    title: title,
    message: message
  });
}
