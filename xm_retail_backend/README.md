# Swiggy Offers API

## Endpoint
`GET /api/swiggy-offers?city=Hyderabad&area=Kukatpally`

- Returns Swiggy offers for the specified city and area (area is optional).
- Reads from swiggy.txt (must be valid JSON).

## Example swiggy.txt
```
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