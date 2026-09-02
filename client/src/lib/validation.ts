// Orbital Command reminder: validation is immediate, explicit, and operational; never allow an invalid location lock.
export const coordinateErrors = (latitude: string, longitude: string) => {
  const lat = Number(latitude);
  const lon = Number(longitude);
  const errors: { latitude?: string; longitude?: string } = {};
  if (!latitude.trim() || !Number.isFinite(lat) || lat < -90 || lat > 90) {
    errors.latitude = "Use a latitude from −90 to +90.";
  }
  if (!longitude.trim() || !Number.isFinite(lon) || lon < -180 || lon > 180) {
    errors.longitude = "Use a longitude from −180 to +180.";
  }
  return errors;
};

export const isValidCoordinates = (latitude: string, longitude: string) =>
  Object.keys(coordinateErrors(latitude, longitude)).length === 0;
