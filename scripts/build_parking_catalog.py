#!/usr/bin/env python3
"""Convert Fraunhofer ISI truck parking locations v04 (CC BY 4.0) to APK JSON."""
import csv
import hashlib
import json
import math
import pathlib
import sys

source = pathlib.Path(sys.argv[1])
destination = pathlib.Path(sys.argv[2])
spots = []
errors = 0
with source.open(encoding="utf-8-sig", newline="") as f:
    reader = csv.reader(f, delimiter=";")
    header = next(reader)
    assert header[:6] == ["", "name", "lat", "lon", "totalArea_m2", "country"], header[:6]
    for row in reader:
        try:
            index = int(row[0])
            lat = float(row[2])
            lon = float(row[3])
            if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                raise ValueError("invalid coordinates")
            kind = row[1].strip()[:80]
            country = row[5].strip()[:3]
            city = row[-3].strip()[:60] if len(row) > 20 else ""
            if city.lower() in {"nan", "none", "false", "unknown"}:
                city = ""
            # [stable id, lat, lon, site category, country, nearby urban node]
            spots.append([index, round(lat, 5), round(lon, 5), kind, country, city])
        except (ValueError, IndexError):
            errors += 1

assert 12000 <= len(spots) <= 15000, f"Too few valid records: {len(spots)}, bad: {errors}"
result = {
    "source": "Fraunhofer ISI / Link, Plötz, Speth, Gnann — European Truck Parking Locations v04",
    "license": "CC BY 4.0",
    "url": "https://doi.org/10.5281/zenodo.14643147",
    "published": "2025-01-24",
    "notice": "Approximate research locations: confirm actual truck access, opening hours and legality on site. No occupancy information.",
    "count": len(spots),
    "spots": spots,
}
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"CATALOG_CREATED count={len(spots)} errors={errors} bytes={destination.stat().st_size}")
print("SAMPLE", json.dumps(spots[:3], ensure_ascii=False))
