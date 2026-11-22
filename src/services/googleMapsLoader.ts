let mapsScriptPromise: Promise<typeof google> | null = null;

export function loadGoogleMaps(apiKey: string): Promise<typeof google> {
  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (!apiKey) {
    return Promise.reject(
      new Error("Set VITE_GOOGLE_MAPS_API_KEY to enable the map.")
    );
  }

  if (mapsScriptPromise) {
    return mapsScriptPromise;
  }

  mapsScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(
      "google-maps-javascript-api"
    ) as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement("script");

    const handleLoad = () => {
      if (window.google?.maps) {
        resolve(window.google);
      } else {
        mapsScriptPromise = null;
        reject(new Error("Google Maps loaded without its map library."));
      }
    };

    const handleError = () => {
      mapsScriptPromise = null;
      reject(new Error("Google Maps could not be loaded."));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.id = "google-maps-javascript-api";
      script.async = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
      document.head.appendChild(script);
    }

    if (window.google?.maps) {
      resolve(window.google);
    }
  });

  return mapsScriptPromise;
}
