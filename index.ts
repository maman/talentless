import { parseArgs } from "node:util";
import { type Phase, execute } from "./browser.ts";
import { loadEvents } from "./calendar.ts";

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

if (!args.email || !args.password || !args.lat || !args.lng) {
  console.error("email, password, lat, and lng are required");
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

const events = await loadEvents(new Date(), args.personalCalendarLink);
if (!events.length) {
  try {
    await execute({
      phase: args.phase as Phase,
      email: args.email,
      password: args.password,
      lat: args.lat,
      lng: args.lng,
    });
    console.log(`${args.phase} executed successfully`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
} else {
  console.log(`No need to execute: ${JSON.stringify(events)}`);
  process.exit(0);
}
