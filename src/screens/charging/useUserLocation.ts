import { useCallback, useEffect, useState } from 'react';

export type Coords = { lat: number; lon: number };
export type LocStatus = 'idle' | 'loading' | 'ready' | 'denied' | 'unavailable' | 'failed';

/** Konum izni ve güncel konum. Native modül yoksa (eski build) 'unavailable' döner. */
export function useUserLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<LocStatus>('idle');
  /** "İlçe, İl" (geocoding başarısızsa null). */
  const [place, setPlace] = useState<string | null>(null);

  const locate = useCallback(async (ask: boolean) => {
    let Location: typeof import('expo-location');
    try {
      Location = await import('expo-location');
    } catch {
      setStatus('unavailable');
      return;
    }
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (!perm.granted && ask && perm.canAskAgain) perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) { setStatus(ask ? 'denied' : 'idle'); return; }
      setStatus('loading');
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      setStatus('ready');
      // İl/ilçe adı: yalnızca bilgi amaçlı, alınamazsa sessizce atlanır.
      try {
        const [a] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        const province = a?.region || a?.city || '';
        const district = a?.subregion || a?.city || a?.district || '';
        setPlace([district !== province ? district : '', province].filter(Boolean).join(', ') || null);
      } catch {
        setPlace(null);
      }
    } catch {
      setStatus('unavailable');
    }
  }, []);

  // İzin daha önce verildiyse sayfa açılırken sessizce konumu al.
  useEffect(() => {
    const timer = setTimeout(() => { void locate(false); }, 0);
    return () => clearTimeout(timer);
  }, [locate]);

  return { coords, place, status, request: () => locate(true) };
}
