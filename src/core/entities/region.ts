export interface TransmigrationArea {
  name: string;
}

export interface District {
  id: string;
  name: string;
  coordinates: [number, number];
  transmigrationAreas: string[];
}

export interface Regency {
  id: string;
  name: string;
  coordinates: [number, number];
  districts: District[];
}

export interface Province {
  id: string;
  name: string;
  coordinates: [number, number];
  regencies: Regency[];
}

export interface RegionData {
  provinces: Province[];
}

export function findRegionById(
  regions: RegionData,
  regionId: string
): { province?: Province; regency?: Regency; district?: District } {
  for (const province of regions.provinces) {
    if (province.id === regionId) {
      return { province };
    }
    for (const regency of province.regencies) {
      if (regency.id === regionId) {
        return { province, regency };
      }
      for (const district of regency.districts) {
        if (district.id === regionId) {
          return { province, regency, district };
        }
      }
    }
  }
  return {};
}

export function getRegionName(
  regions: RegionData,
  regionId: string
): string {
  const { province, regency, district } = findRegionById(regions, regionId);

  if (district) return district.name;
  if (regency) return regency.name;
  if (province) return province.name;
  return 'Unknown';
}

export function getFullRegionPath(
  regions: RegionData,
  regionId: string
): string {
  const { province, regency, district } = findRegionById(regions, regionId);

  const parts: string[] = [];
  if (province) parts.push(province.name);
  if (regency) parts.push(regency.name);
  if (district) parts.push(district.name);

  return parts.join(' > ');
}
