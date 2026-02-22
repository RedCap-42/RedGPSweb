# RedGPS Receiver

This script runs on your Windows PC. It fetches your phone's live GPS coordinates from your Vercel Web App and writes them instantly to a local file (`latest_location.json`), making them available to your other software (like RedView, game engines, or map software).

## 🚀 How to Run (Windows)

1. Make sure Python is installed on your PC. You can download it from [python.org](https://www.python.org/downloads/).
2. Open **Command Prompt** or **PowerShell** in this directory.
3. Run the script by providing your deployed Vercel App URL:

```cmd
python receiver.py --url https://votre-app-vercel.vercel.app/api/location
```

### Options

You can customize the behavior using these arguments:

- `--url` : The URL of your Vercel Tracker API (Default is localhost for testing).
- `--out` : Where to save the data file (Default is `latest_location.json` in the current folder).
- `--interval` : How often to poll the API in seconds (Default is `3.0`).

Example:
```cmd
python receiver.py --url https://mon-tracker.vercel.app/api/location --out C:\Data\gps.json --interval 1.5
```

## 📁 Output Format

The script writes to the file instantaneously with this format, which is very easy to read in C++, C#, Rust, or JS:

```json
{
    "latitude": 48.856614,
    "longitude": 2.352221,
    "accuracy_meters": 5.0,
    "last_update_ms": 1708892123456,
    "fetch_time": "2026-02-22T20:50:00.123456"
}
```
