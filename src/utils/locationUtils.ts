/**
 * Centralized utility for handling Vietnamese address parsing and formatting.
 * Standard format: "Street, Ward, District, Province"
 */

export interface StructuredLocation {
  street: string;
  ward: string;
  districtName: string;
  provinceName: string;
  provinceId?: number | null;
  districtId?: number | null;
}

/**
 * Parses a primaryLocation string into a structured object.
 */
export const parseLocation = (locationString: string): StructuredLocation => {
  if (!locationString) {
    return { street: "", ward: "", districtName: "", provinceName: "" };
  }

  const parts = locationString.split(",").map(s => s.trim());
  
  // Basic heuristic-based parsing (assuming standard format)
  // [Street/HouseNum, Ward, District, Province]
  const result: StructuredLocation = {
    street: "",
    ward: "",
    districtName: "",
    provinceName: "",
  };

  if (parts.length >= 1) {
    result.provinceName = parts[parts.length - 1];
  }
  if (parts.length >= 2) {
    result.districtName = parts[parts.length - 2];
  }
  if (parts.length >= 3) {
    result.ward = parts[parts.length - 3];
  }
  if (parts.length >= 4) {
    result.street = parts.slice(0, parts.length - 3).join(", ");
  } else if (parts.length === 3) {
    // If only 3 parts, first might be street+ward or just ward
    // This is ambiguous, but we'll stick to a best-effort
  }

  return result;
};

/**
 * Formats structured location parts into a single string.
 */
export const formatLocation = (loc: Partial<StructuredLocation>): string => {
  return [loc.street, loc.ward, loc.districtName, loc.provinceName]
    .filter(p => !!p)
    .join(", ");
};
