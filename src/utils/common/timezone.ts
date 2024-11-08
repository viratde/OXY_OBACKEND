import moment from "moment-timezone";
const zones = moment.tz.names();

const getTimeZoneFromOffset = (offsetMinutes: number): string | null => {
 
  for (let i = 0; i < zones.length; i++) {
    const zone = moment.tz(zones[i]);
    if (zone.utcOffset() === offsetMinutes) {
      return zones[i];
    }
  }
  return null;
};

const getOffsetFromTimeZone = (timezone: string): number | null => {
  if (zones.includes(timezone)) {
    const now = moment.tz(timezone);
    return now.utcOffset();
  }

  return null;
};

const TimeZone = {
  getOffsetFromTimeZone,
  getTimeZoneFromOffset,
};

export default TimeZone;
