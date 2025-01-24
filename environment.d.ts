export interface IProcessEnv {
  HEADLESS: "1" | "0";
  TALENTLESS_LAT: string;
  TALENTLESS_LNG: string;
  TALENTLESS_EMAIL: string;
  TALENTLESS_PASSWORD: string;
  TALENTLESS_PERSONAL_CALENDAR_LINK: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends IProcessEnv {}
  }
}
