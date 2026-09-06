/* SCA's small, same-origin push worker. Keep payloads deliberately generic. */
function safeAdminUrl(value) {
  try {
    var url = new URL(typeof value === "string" ? value : "/admin", self.location.origin);
    return url.origin === self.location.origin && url.pathname.indexOf("/admin") === 0
      ? url.pathname + url.search + url.hash
      : "/admin";
  } catch (_) {
    return "/admin";
  }
}

self.addEventListener("push", function (event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = {}; }
  var title = typeof data.title === "string" ? data.title.slice(0, 80) : "SCA admin update";
  var body = typeof data.body === "string" ? data.body.slice(0, 180) : "You have a new admin notification.";
  var url = safeAdminUrl(data.url);
  var payload = { id: typeof data.id === "string" ? data.id : String(Date.now()), title: title, body: body, url: url, createdAt: Date.now() };
  event.waitUntil(self.registration.showNotification(title, {
    body: body,
    icon: "/images/ui/SCA-Logo.png",
    badge: "/images/ui/SCA-Logo.png",
    tag: payload.id,
    data: { url: url }
  }).then(function () { return self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (windows) {
    windows.forEach(function (client) { client.postMessage(payload); });
  }); }));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var target = event.notification.data && event.notification.data.url;
  var url = new URL(safeAdminUrl(target), self.location.origin);
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (windows) {
    for (var i = 0; i < windows.length; i += 1) {
      if ("focus" in windows[i]) { windows[i].navigate(url.href); return windows[i].focus(); }
    }
    return clients.openWindow(url.href);
  }));
});
