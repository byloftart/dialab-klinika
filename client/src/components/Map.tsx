/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: typeof google;
  }
}

const DIRECT_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const FORGE_API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";

const GOOGLE_MAPS_SRC = DIRECT_MAPS_API_KEY
  ? `https://maps.googleapis.com/maps/api/js?key=${DIRECT_MAPS_API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`
  : FORGE_API_KEY
    ? `${FORGE_BASE_URL}/v1/maps/proxy/maps/api/js?key=${FORGE_API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`
    : "";

function loadMapScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-map-loader="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_MAPS_SRC;
    script.async = true;
    script.dataset.mapLoader = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 40.4093, lng: 49.8671 },
  initialZoom = 15,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [mode, setMode] = useState<"google" | "iframe">(
    GOOGLE_MAPS_SRC ? "google" : "iframe"
  );

  const init = usePersistFn(async () => {
    if (!GOOGLE_MAPS_SRC) {
      setMode("iframe");
      return;
    }

    try {
      await loadMapScript();
      if (!mapContainer.current || !window.google?.maps) {
        setMode("iframe");
        return;
      }

      map.current = new window.google.maps.Map(mapContainer.current, {
        zoom: initialZoom,
        center: initialCenter,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: true,
      });

      if (onMapReady) {
        onMapReady(map.current);
      }
    } catch (error) {
      console.error("Failed to initialize Google Maps", error);
      setMode("iframe");
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  if (mode === "iframe") {
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=49.8571%2C40.4043%2C49.8771%2C40.4143&layer=mapnik&marker=${initialCenter.lat}%2C${initialCenter.lng}`;
    return (
      <iframe
        title="Dialab Klinika Map"
        src={src}
        loading="lazy"
        className={cn("w-full h-[500px] border-0", className)}
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />;
}
