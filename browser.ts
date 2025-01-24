import puppeteer from "puppeteer";

const LIVE_ATTENDANCE_URL = "https://hr.talenta.co/live-attendance";
const SIGNIN_URL = "https://account.mekari.com/users/sign_in";
const SIGNOUT_URL = "https://account.mekari.com/navigate?id=sign_out";
const HOME_URL = "https://hr.talenta.co";
const EMAIL_SELECTOR = "#user_email";
const PASSWORD_SELECTOR = "#user_password";
const SIGNIN_BUTTON_SELECTOR = "#new-signin-button";

export type Phase = "clockin" | "clockout";

export class NoAttendanceTextareaError extends Error {
  constructor() {
    super("No attendance textarea found");
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function execute({
  phase,
  email,
  password,
  lat,
  lng,
}: {
  phase: Phase;
  email: string;
  password: string;
  lat: string;
  lng: string;
}) {
  const browser = await puppeteer.launch({
    headless: process.env.HEADLESS === "1",
    handleSIGTERM: true,
    defaultViewport: { width: 1280, height: 800 },
    args: [
      "--use-fake-ui-for-media-stream",
      "--disable-notifications",
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });
  const ctx = await browser.createBrowserContext();

  // Open Sign in page
  const page = await ctx.newPage();
  await page.goto(SIGNIN_URL, { waitUntil: "networkidle2" });
  await page.waitForSelector(EMAIL_SELECTOR);
  await page.type(EMAIL_SELECTOR, email);
  await delay(800);
  await page.waitForSelector(PASSWORD_SELECTOR);
  await page.type(PASSWORD_SELECTOR, password);
  await delay(500);
  await page.waitForSelector(SIGNIN_BUTTON_SELECTOR);
  await page.click(SIGNIN_BUTTON_SELECTOR);
  await delay(2000);
  await page.goto(HOME_URL, { waitUntil: "networkidle2" });
  await delay(2000);

  // Open Live Attendance page
  await ctx.overridePermissions(LIVE_ATTENDANCE_URL, ["geolocation"]);
  const liveAttendancePage = await ctx.newPage();
  await liveAttendancePage.setGeolocation({
    latitude: Number.parseFloat(lat),
    longitude: Number.parseFloat(lng),
  });
  await liveAttendancePage.goto(LIVE_ATTENDANCE_URL, {
    waitUntil: "networkidle2",
  });
  const textarea = await liveAttendancePage.$("textarea.form-control");
  if (textarea) {
    const buttons = await liveAttendancePage.$$(
      "button.btn.btn-primary.btn-block",
    );
    for await (const button of buttons) {
      const btnText = await liveAttendancePage.evaluate(
        (el) => el.querySelector("span")?.textContent?.trim(),
        button,
      );
      if (btnText === "Clock In" && phase === "clockin") {
        console.log("Found clockin button");
        await delay(2000);
        await button.click();
        break;
      }
      if (btnText === "Clock Out" && phase === "clockout") {
        console.log("Found clockout button");
        await delay(2000);
        await button.click();
        break;
      }
    }
    await delay(800);
    await liveAttendancePage.goto(SIGNOUT_URL, { waitUntil: "networkidle2" });
    await delay(3000);
    await browser.close();
  } else {
    throw new NoAttendanceTextareaError();
  }
}
