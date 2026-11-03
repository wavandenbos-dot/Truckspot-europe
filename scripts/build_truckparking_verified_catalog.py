#!/usr/bin/env python3
"""Build offline EU truck-designated parking catalog for TruckSpot stable Android.

Rest Areas Europe: ODbL / OpenStreetMap contributors.
NDW: Netherlands public Truckparking_Parking_Table.xml DATEX II.
Manual verified night parking: individual operator or municipality sources.

OSM truck_parking=True is evidence of HGV parking, NOT proof of overnight
permission. Distinguish "night verified" from "truck parking, check night rules".
Avoid generic Fraunhofer research coordinates and avoid asserting legality of
unverified sites. The app makes the status visible to drivers.
"""
import json
import math
import pathlib
import urllib.request
import xml.etree.ElementTree as ET

OUTPUT = pathlib.Path("app/src/main/assets/web/data/truckparking-verified.json")
REST_URL = "https://restareaseurope.com/downloads/rest-areas-europe.geojson"
NDW_URL = "https://opendata.ndw.nu/Truckparking_Parking_Table.xml"
# [id, lat, lng, name, country, kind, road, 24h, facilities bitmask,
#  source url, overnight independently confirmed]   kind: r=rest, s=service,
#  t=truckstop, d=NDW dedicated truckparking, v=operator confirmed.
# Facility mask: toilet=1, shower=2, food=4, security=8
CURATED = [
    ["nl-rogaat-raket",52.68660,6.26859,"Wegrestaurant De Raket · Truckparking","NL","v","A28 afrit 24",False,15,
     "https://wegrestaurantderaket.nl/truck-parkeren/",1],
    ["nl-emmen-routiers",52.74079,6.96603,"Emmen · bewaakte truckparking (Edisonstraat)","NL","v","A37 · bedrijventerrein",True,13,
     "https://www.truckstar.nl/overzicht-bewaakte-parkeerplaatsen-in-nederland/",1],
    ["nl-venlo-truckparking",51.391284,6.099148,"Truck Parking Venlo · Tradeport West","NL","v","A67 / A73",True,15,
     "https://truckparkingvenlo.nl/",1],
    ["nl-asten-truckinn",51.41656,5.75729,"Truck-Inn Nobis Asten · Truckparking","NL","v","A67 afrit 36",True,7,
     "https://www.truckstop.nl/parkeren/",1],
    ["nl-deurningen-frans",52.28498,6.85336,"Frans op den Bult · Bewaakte truckstop","NL","v","A1 afrit 31",True,15,
     "https://fransopdenbult.nl/truckstop/",1],
    ["nl-maasvlakte-plaza",51.92976,4.02093,"Truckparking Maasvlakte Plaza","NL","v","A15 · haven / industrieterrein",True,15,
     "https://www.portofrotterdam.com/nl/logistiek/verbindingen/intermodaal-transport/wegtransport/maasvlakte-plaza-truckparking",1],
]

def download(url, limit=20000000):
    req=urllib.request.Request(url, headers={"User-Agent":"TruckSpotEurope/1.0 (+https://github.com/wavandenbos-dot/Truckspot-europe)"})
    with urllib.request.urlopen(req, timeout=80) as resp:
        content=resp.read(limit+1)
        if len(content)>limit: raise RuntimeError("Source download exceeds expected size")
        return content

def clean(s, length=95):
    return " ".join(str(s or "").split())[:length]

def valid(lat,lon):
    return math.isfinite(lat) and math.isfinite(lon) and -90 <= lat <= 90 and -180 <= lon <= 180

def rest_area_catalog():
    raw=json.loads(download(REST_URL))
    assert raw.get("type")=="FeatureCollection" and len(raw.get("features",[]))>18000, "Wrong EU parking data source"
    rows=[]
    for obj in raw["features"]:
        p=obj.get("properties") or {}
        amenities=p.get("amenities") or {}
        if not isinstance(amenities,dict) or amenities.get("truck_parking") is not True:
            continue
        xy=(obj.get("geometry") or {}).get("coordinates") or []
        if len(xy)<2:continue
        try: lon,lat=map(float,xy[:2])
        except (ValueError,TypeError):continue
        if not valid(lat,lon):continue
        typ=p.get("type")
        kind="t" if typ=="truck_stop" else "s" if typ=="service_area" else "r"
        name=clean(p.get("name") or ("Truckstop" if kind=="t" else "Vrachtwagenrustplaats"),90)
        road=clean(p.get("road"),40)
        osm=p.get("osm") or ""
        if not isinstance(osm,str) or not osm.startswith(("way/","node/","relation/")):continue
        flags=(1 if amenities.get("toilets") else 0)|(2 if amenities.get("shower") else 0)|(4 if amenities.get("restaurant") or amenities.get("cafe") else 0)
        h=clean(p.get("openingHours"),45)
        open24=h.strip() in ("24/7","PH,Mo-Su 00:00-24:00","Mo-Su,PH 00:00-24:00")
        # Critical: 24h opening is not proof of legally permitted truck overnight parking.
        rows.append([clean(p.get("id") or ("osm-"+osm),40),round(lat,6),round(lon,6),name,clean(p.get("country"),2),kind,road,open24,flags,osm,0])
    assert len(rows)>=4500, "Unusually few HGV-designated sites in ODbL dataset"
    return rows

def xmlname(node):
    return node.tag.rsplit("}",1)[-1]

def text_under(node,key):
    for el in node.iter():
        if xmlname(el)==key and el.text and el.text.strip():return el.text.strip()
    return None

def ndw_truckparking():
    root=ET.fromstring(download(NDW_URL,500000))
    rows=[]
    for rec in root.iter():
        if xmlname(rec)!="parkingRecord":continue
        name_node=next((el for el in rec if xmlname(el)=="parkingName"),None)
        name=text_under(name_node,"value") if name_node is not None else None
        if not name: name=next((el.text.strip() for el in rec.iter() if xmlname(el)=="value" and el.text and el.text.strip()),None)
        lat=text_under(rec,"latitude");lon=text_under(rec,"longitude")
        if not (name and lat and lon):continue
        try:lat=float(lat);lon=float(lon)
        except ValueError:continue
        if not valid(lat,lon):continue
        loc=rec.attrib.get("id") or name
        road=next((el.text.strip() for el in rec.iter() if xmlname(el)=="roadNumber" and el.text), "")
        rows.append(["ndw-"+clean(loc,55),round(lat,6),round(lon,6),clean(name,90),"NL","d",clean(road,40),False,0,NDW_URL,0])
    assert len(rows)>=5, "Dutch NDW truckparking registry unexpected"
    return rows

def main():
    rows=CURATED+ndw_truckparking()+rest_area_catalog()
    ids=set();unique=[]
    for row in rows:
        if row[0] in ids:continue
        ids.add(row[0]);unique.append(row)
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    result={"version":2,"license":"ODbL: © OpenStreetMap contributors, Rest Areas Europe; NDW open truckparking data; operator confirmations",
            "sources":[REST_URL,NDW_URL],
            "notice":"Truckparking in OSM/NDW does not by itself prove overnight permission. Operator-verified sites are separately flagged. Check signs and local rules.",
            "count":len(unique),"spots":unique}
    OUTPUT.write_text(json.dumps(result,ensure_ascii=False,separators=(",",":")),encoding="utf8")
    print("TRUCKSPOT_TRUSTED_CATALOG",len(unique),"operator-confirmed:",len(CURATED),"NDW:",sum(r[5]=="d" for r in unique),"EU OSM:",sum(r[5] in ("r","s","t") for r in unique),"output_bytes:",OUTPUT.stat().st_size)
    assert len(unique)>4500
if __name__=="__main__":main()
