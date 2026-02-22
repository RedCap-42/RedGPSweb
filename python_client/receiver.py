import urllib.request
import urllib.error
import json
import time
import os
import argparse
from datetime import datetime

# Default Configuration
DEFAULT_URL = "http://localhost:3000/api/location"  # Change this to your Vercel URL
OUTPUT_FILE = "latest_location.json"
POLL_INTERVAL = 3.0  # seconds

def fetch_location(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                return data
            else:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] HTTP Error: {response.status}")
                return None
    except urllib.error.URLError as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Connection Error: {e.reason}")
        return None
    except json.JSONDecodeError:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Error: Invalid JSON received")
        return None
    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Error: {str(e)}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Fetch GPS coordinates from Vercel Tracker.")
    parser.add_argument("--url", type=str, default=None, help="The Vercel API URL (e.g. https://your-app.vercel.app/api/location)")
    parser.add_argument("--out", type=str, default=OUTPUT_FILE, help="The local file to save the coordinates to")
    parser.add_argument("--interval", type=float, default=POLL_INTERVAL, help="Polling interval in seconds")
    
    args = parser.parse_args()
    
    api_url = args.url if args.url else DEFAULT_URL
    output_path = os.path.abspath(args.out)
    
    print("==================================================")
    print("      RedGPS Receiver - Live Telemetry Link       ")
    print("==================================================")
    print(f"Target API: {api_url}")
    print(f"Output File: {output_path}")
    print(f"Polling Rate: Every {args.interval} seconds")
    print("Press Ctrl+C to stop.")
    print("==================================================\n")

    try:
        while True:
            data = fetch_location(api_url)
            
            if data and not 'error' in data:
                lat = data.get('lat', 0.0)
                lng = data.get('lng', 0.0)
                acc = data.get('accuracy', 0.0)
                timestamp = data.get('timestamp', 0)
                
                # Write to local file for other software (like RedView) to read
                with open(output_path, 'w') as f:
                    json.dump({
                        "latitude": lat,
                        "longitude": lng,
                        "accuracy_meters": acc,
                        "last_update_ms": timestamp,
                        "fetch_time": datetime.now().isoformat()
                    }, f, indent=4)
                
                print(f"[{datetime.now().strftime('%H:%M:%S')}] UPDATED | Lat: {lat:.6f}, Lng: {lng:.6f}, Acc: {acc:.1f}m")
            else:
                if data and 'error' in data:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] API returned error: {data['error']}")
                else:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] Failed to get data. Retrying...")

            time.sleep(args.interval)
            
    except KeyboardInterrupt:
        print("\nReceiver stopped by user. Goodbye!")

if __name__ == "__main__":
    main()
