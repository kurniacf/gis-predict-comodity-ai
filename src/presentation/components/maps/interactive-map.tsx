'use client';

import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { Province } from '@/core/entities/region';
import type { CommodityWithAnalysis } from '@/core/entities/commodity';
import { cn } from '@/shared/lib/utils';

interface InteractiveMapProps {
  provinces: Province[];
  commodities: CommodityWithAnalysis[];
  selectedRegionId?: string;
  onRegionSelect?: (regionId: string) => void;
  className?: string;
}

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const getMarkerColor = (commodityCount: number, hasTopCommodity: boolean): string => {
  if (hasTopCommodity) return '#16A34A';
  if (commodityCount > 3) return '#2563EB';
  if (commodityCount > 0) return '#F59E0B';
  return '#94A3B8';
};

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  React.useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
}

export function InteractiveMap({
  provinces,
  commodities,
  selectedRegionId,
  onRegionSelect,
  className,
}: InteractiveMapProps) {
  const [mapCenter, setMapCenter] = React.useState<[number, number]>([-2.5489, 118.0149]);
  const [mapZoom, setMapZoom] = React.useState(5);

  const getCommoditiesForRegion = React.useCallback((regionId: string) => {
    return commodities.filter(
      (c) => c.regionId === regionId || c.regionId.startsWith(regionId)
    );
  }, [commodities]);

  const hasTopCommodity = React.useCallback((regionId: string) => {
    const regionCommodities = commodities.filter(
      (c) => c.regionId === regionId || c.regionId.startsWith(regionId)
    );
    return regionCommodities.some((c) => c.rcaData.rcaScore >= 1.5);
  }, [commodities]);

  React.useEffect(() => {
    if (selectedRegionId) {
      for (const province of provinces) {
        if (province.id === selectedRegionId) {
          setMapCenter(province.coordinates as [number, number]);
          setMapZoom(7);
          return;
        }
        for (const regency of province.regencies) {
          if (regency.id === selectedRegionId) {
            setMapCenter(regency.coordinates as [number, number]);
            setMapZoom(9);
            return;
          }
        }
      }
    }
  }, [selectedRegionId, provinces]);

  const markers = React.useMemo(() => {
    const result: Array<{
      id: string;
      name: string;
      position: [number, number];
      commodityCount: number;
      hasTopCommodity: boolean;
      province: string;
    }> = [];

    provinces.forEach((province) => {
      province.regencies.forEach((regency) => {
        const regionCommodities = getCommoditiesForRegion(regency.id);
        result.push({
          id: regency.id,
          name: regency.name,
          position: regency.coordinates as [number, number],
          commodityCount: regionCommodities.length,
          hasTopCommodity: hasTopCommodity(regency.id),
          province: province.name,
        });
      });
    });

    return result;
  }, [provinces, getCommoditiesForRegion, hasTopCommodity]);

  return (
    <div className={cn('relative h-full w-full rounded-lg overflow-hidden', className)}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={createCustomIcon(
              getMarkerColor(marker.commodityCount, marker.hasTopCommodity)
            )}
            eventHandlers={{
              click: () => onRegionSelect?.(marker.id),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-sm">{marker.name}</h3>
                <p className="text-xs text-gray-500">{marker.province}</p>
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs">
                    <span className="font-medium">{marker.commodityCount}</span> komoditas
                    {marker.hasTopCommodity && (
                      <span className="ml-2 text-green-600 font-medium">
                        (Unggulan)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-[1000]">
        <h4 className="text-xs font-semibold mb-2">Legenda</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span>Komoditas Unggulan</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span>Multi Komoditas</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Komoditas Potensial</span>
          </div>
        </div>
      </div>
    </div>
  );
}
