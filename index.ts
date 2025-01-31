import { parseArgs } from "node:util";
import type { CalendarComponent } from "node-ical";
import { type Phase, execute } from "./browser.ts";
import { getCalendarEvents } from "./calendar.ts";

const { values: args } = parseArgs({
  strict: true,
  options: {
    email: { type: "string", default: process.env.TALENTLESS_EMAIL },
    password: { type: "string", default: process.env.TALENTLESS_PASSWORD },
    lat: { type: "string", default: process.env.TALENTLESS_LAT },
    lng: { type: "string", default: process.env.TALENTLESS_LNG },
    personalCalendarLink: {
      type: "string",
      short: "l",
      default: process.env.TALENTLESS_PERSONAL_CALENDAR_LINK,
    },
    checkTag: { type: "string", default: "ofc", short: "c" },
    phase: { type: "string", short: "p" },
    help: { type: "boolean", short: "h" },
    version: { type: "boolean", short: "v" },
  },
});

if (args.version) {
  console.log("1.0.0");
  process.exit(0);
}

if (args.help) {
  console.log("Usage: yarn exec -p <phase>");
  process.exit(0);
}

if (
  !args.email?.length ||
  !args.password?.length ||
  !args.lat?.length ||
  !args.lng?.length ||
  !args.checkTag?.length
) {
  console.error("email, password, lat, lng, and checkTag are required");
  process.exit(1);
}

if (!args.phase) {
  console.error("Phase is required");
  process.exit(1);
}

if (args.phase !== "clockin" && args.phase !== "clockout") {
  console.error("Invalid phase - must be 'clockin' or 'clockout'");
  process.exit(1);
}

let events: Array<CalendarComponent> = [];
if (args.personalCalendarLink?.length) {
  console.log("Checking personal calendar ...");
  events = await getCalendarEvents(new Date(), args.personalCalendarLink);
}
if (!events.length) {
  try {
    console.log(`Performing ${args.phase} ...`);
    await execute({
      phase: args.phase as Phase,
      email: args.email,
      password: args.password,
      lat: args.lat,
      lng: args.lng,
      checkTag: args.checkTag,
    });
    console.log(`${args.phase} executed successfully`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
} else {
  console.log(`No need to execute: ${JSON.stringify(events, null, 2)}`);
  process.exit(0);
}
