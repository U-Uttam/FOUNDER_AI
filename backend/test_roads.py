import requests
import json

lat, lng = 12.9698, 79.1417  # Katpadi / Vellore
query = f"""
[out:json][timeout:20];
(
  way(around:2000, {lat}, {lng})["highway"~"primary|secondary|tertiary|trunk|service|residential"];
  way(around:2000, {lat}, {lng})["building"];
);
out center 150;
"""
try:
    r = requests.post("https://overpass-api.de/api/interpreter", data={"data": query}, timeout=20)
    data = r.json().get("elements", [])
    print(f"Found {len(data)} actual road and building elements in Overpass!")
    road_points = []
    for d in data:
        c = d.get("center") or ({"lat": d.get("lat"), "lon": d.get("lon")} if d.get("lat") else None)
        if c and c.get("lat") and c.get("lon"):
            name = d.get("tags", {}).get("name") or d.get("tags", {}).get("highway") or "Road Corridor"
            road_points.append({"name": name, "lat": c["lat"], "lng": c["lon"]})
    print(f"Parsed {len(road_points)} valid road/building coordinate points.")
    for p in road_points[:8]:
        print(f" - {p['name']}: ({p['lat']:.5f}, {p['lng']:.5f})")
except Exception as e:
    print(f"Error: {e}")
