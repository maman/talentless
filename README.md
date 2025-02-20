# Talentless

Automate [Talenta](https://hr.talenta.co) clock in/out because nobody has time to do it.

Will skip clocking in/out on weekends & public holidays. Support custom calendar link for marking personal holidays / "cuti" days.

## How to use

1. Create new repository based on this template
2. Setup github action secrets:
    - `NTFY_TOPIC` ([ntfy.sh](https://docs.ntfy.sh/) topic to send failure notification to)
    - `TALENTLESS_EMAIL`
    - `TALENTLESS_PASSWORD`
    - `TALENTLESS_LAT`
    - `TALENTLESS_LNG`
    - `TALENTLESS_PERSONAL_CALENDAR_LINK` (optional, need to be a public `.ics` link)
3. Github action will run automatically on schedule:
    - Clock in: 8:50 AM Jakarta time
    - Clock out: 6:00 PM Jakarta time
4. Clock in/out by manually running the `Runner` workflow if you need to.
