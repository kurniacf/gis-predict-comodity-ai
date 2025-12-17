'use client';

import * as React from 'react';
import { MapPin } from 'lucide-react';

import type { Province, Regency, District } from '@/core/entities/region';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Label } from '@/presentation/components/ui/label';

interface LocationSelectorProps {
  provinces: Province[];
  selectedProvince: Province | null;
  selectedRegency: Regency | null;
  selectedDistrict: District | null;
  onProvinceChange: (province: Province | null) => void;
  onRegencyChange: (regency: Regency | null) => void;
  onDistrictChange: (district: District | null) => void;
  className?: string;
}

export function LocationSelector({
  provinces,
  selectedProvince,
  selectedRegency,
  selectedDistrict,
  onProvinceChange,
  onRegencyChange,
  onDistrictChange,
  className,
}: LocationSelectorProps) {
  const handleProvinceChange = (provinceId: string) => {
    if (provinceId === 'all') {
      onProvinceChange(null);
      onRegencyChange(null);
      onDistrictChange(null);
      return;
    }
    const province = provinces.find((p) => p.id === provinceId);
    onProvinceChange(province || null);
    onRegencyChange(null);
    onDistrictChange(null);
  };

  const handleRegencyChange = (regencyId: string) => {
    if (regencyId === 'all') {
      onRegencyChange(null);
      onDistrictChange(null);
      return;
    }
    const regency = selectedProvince?.regencies.find((r) => r.id === regencyId);
    onRegencyChange(regency || null);
    onDistrictChange(null);
  };

  const handleDistrictChange = (districtId: string) => {
    if (districtId === 'all') {
      onDistrictChange(null);
      return;
    }
    const district = selectedRegency?.districts.find((d) => d.id === districtId);
    onDistrictChange(district || null);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Pilih Lokasi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="province" className="text-sm">
            Provinsi
          </Label>
          <Select
            value={selectedProvince?.id || 'all'}
            onValueChange={handleProvinceChange}
          >
            <SelectTrigger id="province">
              <SelectValue placeholder="Pilih Provinsi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Provinsi</SelectItem>
              {provinces.map((province) => (
                <SelectItem key={province.id} value={province.id}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="regency" className="text-sm">
            Kabupaten/Kota
          </Label>
          <Select
            value={selectedRegency?.id || 'all'}
            onValueChange={handleRegencyChange}
            disabled={!selectedProvince}
          >
            <SelectTrigger id="regency">
              <SelectValue placeholder="Pilih Kabupaten/Kota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kabupaten</SelectItem>
              {selectedProvince?.regencies.map((regency) => (
                <SelectItem key={regency.id} value={regency.id}>
                  {regency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="district" className="text-sm">
            Kecamatan
          </Label>
          <Select
            value={selectedDistrict?.id || 'all'}
            onValueChange={handleDistrictChange}
            disabled={!selectedRegency}
          >
            <SelectTrigger id="district">
              <SelectValue placeholder="Pilih Kecamatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kecamatan</SelectItem>
              {selectedRegency?.districts.map((district) => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedRegency && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">Kawasan Transmigrasi:</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedRegency.districts
                .flatMap((d) => d.transmigrationAreas)
                .slice(0, 5)
                .map((area, index) => (
                  <span
                    key={index}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                  >
                    {area}
                  </span>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
