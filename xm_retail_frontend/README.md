# xm_retail_frontend

# Swiggy Offers Integration

## How it works
- Detects user location using browser geolocation and reverse geocoding.
- Fetches Swiggy offers for the detected city/area from the backend.
- Displays offers, images, and names dynamically.

## Setup
1. Ensure the backend has a valid swiggy.txt file in JSON format.
2. Start the backend and frontend servers.
3. The offers will appear on the main page based on your current location.

## Notes
- If you change your location, refresh the page to see updated offers.
- The backend expects swiggy.txt to have a structure like:
  ```json
  {
    "cards": [
      {
        "location": { "city": "Hyderabad", "area": "Kukatpally" },
        "imageId": "https://...",
        "name": "Biryani",
        "offerText": "20% off"
      }
    ]
  }
  ```
