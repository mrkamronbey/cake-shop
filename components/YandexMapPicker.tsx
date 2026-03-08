"use client";

import { useEffect, useRef, useState } from "react";
import { X, MapPin, Check, Loader2 } from "lucide-react";

interface Props {
  onSelect: (address: string) => void;
  onClose: () => void;
  locale: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

const TASHKENT = [41.2995, 69.2401];

export default function YandexMapPicker({ onSelect, onClose, locale }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const placemarkRef = useRef<any>(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const isUz = locale === "uz";

  const geocode = async (coords: number[]) => {
    setGeocoding(true);
    try {
      const result = await window.ymaps.geocode(coords, { results: 1 });
      const first = result.geoObjects.get(0);
      setAddress(first?.getAddressLine() ?? "");
    } finally {
      setGeocoding(false);
    }
  };

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;
      window.ymaps.ready(() => {
        const map = new window.ymaps.Map(
          mapRef.current,
          { center: TASHKENT, zoom: 13, controls: ["zoomControl"] },
          { suppressMapOpenBlock: true }
        );

        const placemark = new window.ymaps.Placemark(
          TASHKENT,
          {},
          { draggable: true, preset: "islands#redDotIcon" }
        );

        map.geoObjects.add(placemark);
        mapInstanceRef.current = map;
        placemarkRef.current = placemark;
        setLoading(false);

        geocode(TASHKENT);

        placemark.events.add("dragend", () => {
          geocode(placemark.geometry.getCoordinates());
        });

        map.events.add("click", (e: any) => {
          const coords = e.get("coords");
          placemark.geometry.setCoordinates(coords);
          geocode(coords);
        });
      });
    };

    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    const lang = locale === "uz" ? "uz_UZ" : "ru_RU";

    if (window.ymaps) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=${lang}`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      mapInstanceRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = () => {
    if (!address) return;
    onSelect(address);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-salmon-500" />
          <h3 className="font-bold text-gray-800 text-base">
            {isUz ? "Manzilni xaritadan tanlang" : "Выберите адрес на карте"}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Hint */}
      <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 font-medium shrink-0">
        {isUz ? "Xaritada kerakli joyni bosing yoki belgicha sudrang" : "Нажмите на карту или перетащите метку"}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <Loader2 className="w-8 h-8 text-salmon-400 animate-spin" />
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Address bar + confirm */}
      <div className="px-5 py-4 border-t border-gray-100 bg-white shrink-0 space-y-3">
        <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 min-h-[48px]">
          <MapPin className="w-4 h-4 text-salmon-400 mt-0.5 shrink-0" />
          {geocoding ? (
            <span className="text-sm text-gray-400 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {isUz ? "Aniqlanmoqda..." : "Определяется..."}
            </span>
          ) : (
            <span className="text-sm text-gray-700 leading-snug">
              {address || (isUz ? "Joy tanlanmagan" : "Место не выбрано")}
            </span>
          )}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!address || geocoding}
          className="flex items-center justify-center gap-2 w-full bg-salmon-500 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-salmon-600 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Check className="w-5 h-5" />
          {isUz ? "Tasdiqlash" : "Подтвердить"}
        </button>
      </div>
    </div>
  );
}
