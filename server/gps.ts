/**
 * GPS Tracking and Location Services for Zimbites
 * Handles real-time driver location tracking, geofencing, and distance calculations
 */

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
}

export interface DeliveryRoute {
  restaurantLocation: Location;
  customerLocation: Location;
  currentLocation: Location;
  distanceToRestaurant: number; // in meters
  distanceToCustomer: number; // in meters
  estimatedTimeToRestaurant: number; // in seconds
  estimatedTimeToCustomer: number; // in seconds
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if driver is within geofence radius
 * @param driverLocation Current driver location
 * @param targetLocation Target location (restaurant or customer)
 * @param radiusMeters Geofence radius in meters
 * @returns true if driver is within geofence
 */
export function isWithinGeofence(
  driverLocation: Location,
  targetLocation: Location,
  radiusMeters: number = 100
): boolean {
  const distance = calculateDistance(
    driverLocation.latitude,
    driverLocation.longitude,
    targetLocation.latitude,
    targetLocation.longitude
  );
  return distance <= radiusMeters;
}

/**
 * Estimate time to reach destination based on average speed
 * @param distanceMeters Distance in meters
 * @param averageSpeedKmh Average speed in km/h (default: 40 km/h for urban delivery)
 * @returns Estimated time in seconds
 */
export function estimateTimeToDestination(
  distanceMeters: number,
  averageSpeedKmh: number = 40
): number {
  const distanceKm = distanceMeters / 1000;
  const timeHours = distanceKm / averageSpeedKmh;
  return Math.round(timeHours * 3600);
}

/**
 * Calculate delivery fee based on distance
 * @param distanceKm Distance in kilometers
 * @param baseFeeZWL Base delivery fee in ZWL (cents)
 * @param perKmFeeZWL Per-kilometer fee in ZWL (cents)
 * @returns Total delivery fee in cents
 */
export function calculateDeliveryFee(
  distanceKm: number,
  baseFeeZWL: number = 20000, // 200 ZWL base
  perKmFeeZWL: number = 5000 // 50 ZWL per km
): number {
  const distanceFee = Math.round(distanceKm * perKmFeeZWL);
  return baseFeeZWL + distanceFee;
}

/**
 * Format location for display
 */
export function formatLocation(location: Location): string {
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format time for display
 */
export function formatTime(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Validate GPS coordinates
 */
export function validateCoordinates(latitude: number, longitude: number): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Calculate bearing between two points
 * @returns Bearing in degrees (0-360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const bearing = Math.atan2(y, x);
  return (toDeg(bearing) + 360) % 360;
}

/**
 * Convert radians to degrees
 */
function toDeg(radians: number): number {
  return radians * (180 / Math.PI);
}
