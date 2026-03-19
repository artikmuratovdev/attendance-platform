const rawUrl = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:4000`;
const urls = rawUrl.split(',').map(u => u.trim()).filter(Boolean);

const config = {
  API: urls[0],
  SOCKET: urls[0],
  ready: false,
};

let initPromise = null;

async function findWorkingUrl(urlList) {
  const checks = urlList.map(async (url) => {
    try {
      const res = await fetch(`${url}/api/health`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return url;
    } catch {}
    return null;
  });
  const results = await Promise.all(checks);
  return results.find(r => r !== null) || urlList[0];
}

export async function initConfig() {
  if (config.ready) return config;
  if (initPromise) return initPromise;

  if (urls.length === 1) {
    config.ready = true;
    return config;
  }

  initPromise = findWorkingUrl(urls).then(url => {
    config.API = url;
    config.SOCKET = url;
    config.ready = true;
    console.log('[CONFIG] Active API:', url);
    return config;
  });

  return initPromise;
}

export function getConfig() {
  return config;
}