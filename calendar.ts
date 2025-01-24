import { DateTime } from "luxon";
import ical from "node-ical";

const DEFAULT_TZ = "Asia/Jakarta";

async function getCalendarEvents(date: Date, url: string) {
  const today = DateTime.fromJSDate(date).setZone(DEFAULT_TZ);
  // skip sat / sun
  if (today.weekday >= 6) return [];
  return new Promise<Array<ical.CalendarComponent>>((resolve, reject) => {
    ical.async.fromURL(
      url,
      {
        headers: {
          "User-Agent": "talentless/1.0",
        },
      },
      (err, data) => {
        if (err) reject(err.message);
        else {
          const events = Object.values(data).filter((event) => {
            if (event.type !== "VEVENT") return false;
            const eventStart = DateTime.fromJSDate(event.start).setZone(
              DEFAULT_TZ,
            );
            const eventEnd = DateTime.fromJSDate(event.end).setZone(DEFAULT_TZ);
            return today >= eventStart && today <= eventEnd;
          });
          resolve(events);
        }
      },
    );
  });
}

export async function loadEvents(date: Date, personalCalendarLink?: string) {
  const holidayCalendarLink =
    "https://calendar.google.com/calendar/ical/en.indonesian%23holiday%40group.v.calendar.google.com/public/basic.ics";
  const [holidayCalendar, personalCalendar] = await Promise.all(
    [
      getCalendarEvents(date, holidayCalendarLink),
      personalCalendarLink?.length
        ? getCalendarEvents(date, personalCalendarLink)
        : null,
    ].filter(Boolean),
  );
  return [...(holidayCalendar || []), ...(personalCalendar || [])];
}
