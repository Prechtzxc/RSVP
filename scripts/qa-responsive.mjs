import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const qaDirectory = path.join(process.cwd(), "qa");
const profileDirectory = path.join(qaDirectory, `edge-cdp-${process.pid}`);
const port = 9333;
const baseUrl = process.env.QA_URL ?? "http://localhost:3001";
const phoneWidths = [320, 360, 375, 390, 414, 430];
const allWidths = [...phoneWidths, 768, 1024, 1440];

await mkdir(qaDirectory, { recursive: true });

const browser = spawn(
  edgePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDirectory}`,
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true },
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function findPageTarget() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Browser is still starting.
    }
    await sleep(100);
  }
  throw new Error("Could not connect to the Edge DevTools endpoint.");
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let nextId = 1;
  const pending = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });

  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  return {
    ready,
    close: () => socket.close(),
    send(method, params = {}) {
      const id = nextId;
      nextId += 1;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? "Browser evaluation failed.");
  return result.result.value;
}

async function setViewport(client, width, height = 900) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
    screenWidth: width,
    screenHeight: height,
  });
  await client.send("Emulation.setTouchEmulationEnabled", { enabled: width < 768, maxTouchPoints: 5 });
}

async function waitForPage(client, animationDelay = 1800) {
  await evaluate(
    client,
    `(async () => {
      if (document.readyState !== "complete") {
        await new Promise((resolve) => addEventListener("load", resolve, { once: true }));
      }
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, ${animationDelay}));
      return true;
    })()`,
  );
}

async function capture(client, fileName) {
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(path.join(qaDirectory, fileName), Buffer.from(result.data, "base64"));
}

let client;
try {
  const webSocketUrl = await findPageTarget();
  client = createCdpClient(webSocketUrl);
  await client.ready;
  await client.send("Page.enable");
  await client.send("Runtime.enable");

  await setViewport(client, 390, 844);
  await client.send("Page.navigate", { url: baseUrl });
  await waitForPage(client);

  const reports = [];
  for (const width of allWidths) {
    const height = width < 768 ? 844 : width < 1200 ? 900 : 950;
    await setViewport(client, width, height);
    await evaluate(client, "scrollTo(0, 0); new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
    const report = await evaluate(
      client,
      `(() => {
        const root = document.documentElement;
        const offenders = [...document.querySelectorAll("body *")]
          .map((element) => ({ element, rect: element.getBoundingClientRect() }))
          .filter(({ rect }) => rect.right > root.clientWidth + 1 || rect.left < -1)
          .slice(0, 12)
          .map(({ element, rect }) => ({
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === "string" ? element.className.slice(0, 100) : "",
            left: Math.round(rect.left * 10) / 10,
            right: Math.round(rect.right * 10) / 10,
          }));
        const buttons = [...document.querySelectorAll("a.button")];
        return {
          width: innerWidth,
          clientWidth: root.clientWidth,
          scrollWidth: root.scrollWidth,
          horizontalOverflow: root.scrollWidth > root.clientWidth,
          offenders,
          minButtonHeight: Math.min(...buttons.map((button) => button.getBoundingClientRect().height)),
        };
      })()`,
    );
    reports.push(report);

    if ([320, 390, 768, 1440].includes(width)) {
      await capture(client, `hero-${width}-exact.png`);
    }
  }

  await setViewport(client, 390, 844);
  await evaluate(client, 'document.querySelector("#gratitude-title").scrollIntoView(); new Promise((resolve) => setTimeout(resolve, 1200))');
  await capture(client, "gratitude-390-exact.png");
  await evaluate(client, 'document.querySelector("#details").scrollIntoView(); new Promise((resolve) => setTimeout(resolve, 1200))');
  await capture(client, "details-390-exact.png");
  await evaluate(client, 'document.querySelector(".countdown-panel").scrollIntoView({ block: "center" }); new Promise((resolve) => setTimeout(resolve, 1200))');
  await capture(client, "countdown-390-exact.png");
  await evaluate(client, 'document.querySelector("#rsvp-title").scrollIntoView(); new Promise((resolve) => setTimeout(resolve, 1200))');
  await capture(client, "rsvp-390-exact.png");
  await evaluate(client, 'document.querySelector("#location-title").scrollIntoView(); new Promise((resolve) => setTimeout(resolve, 1200))');
  await capture(client, "location-390-exact.png");
  await evaluate(client, 'document.querySelector("#closing-title").scrollIntoView({ block: "center" }); new Promise((resolve) => setTimeout(resolve, 1200))');
  await capture(client, "closing-390-exact.png");

  const interactionAudit = await evaluate(
    client,
    `(() => {
      const hrefs = [...document.querySelectorAll("a")].map((anchor) => anchor.getAttribute("href"));
      return {
        title: document.title,
        forms: document.querySelectorAll("form").length,
        inputs: document.querySelectorAll("input, textarea, select").length,
        callLinks: hrefs.filter((href) => href?.startsWith("tel:")),
        smsLinks: hrefs.filter((href) => href?.startsWith("sms:")),
        calendarLink: hrefs.find((href) => href?.endsWith(".ics")),
        mapLinks: hrefs.filter((href) => href?.includes("google.com/maps")),
        logoNaturalSize: (() => {
          const image = document.querySelector(".brand-crop img");
          return image ? [image.naturalWidth, image.naturalHeight] : null;
        })(),
      };
    })()`,
  );

  console.log(JSON.stringify({ reports, interactionAudit }, null, 2));
} finally {
  client?.close();
  browser.kill();
}
