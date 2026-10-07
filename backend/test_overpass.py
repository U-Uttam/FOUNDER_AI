import requests

query = """
[out:json][timeout:15];
(
  node(around:2500, 12.9806, 79.1382)["tourism"~"hotel|guest_house"];
  node(around:2500, 12.9806, 79.1382)["amenity"~"school|college|university|hospital|bank|restaurant"];
);
out center 60;
"""

servers = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter"
]

for s in servers:
    try:
        r = requests.post(s, data={"data": query}, timeout=8)
        print(s, "Status:", r.status_code, "Count:", len(r.json().get("elements", [])))
        for el in r.json().get("elements", [])[:10]:
            t = el.get("tags", {})
            if t.get("name"):
                print(" -", t.get("name"), "(", t.get("tourism") or t.get("amenity"), ")")
        break
    except Exception as e:
        print(s, "failed:", e)
