#!/usr/bin/env python3
"""Fix the live, evidence-based truck overnight parking search for stable v1.0.1."""
from pathlib import Path

path = Path("app/src/main/assets/web/index.html")
s = path.read_text(encoding="utf-8")


def replace(old, new, label):
    global s
    count = s.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one occurrence, found {count}")
    s = s.replace(old, new)


def span(start, end, new, label):
    global s
    a = s.find(start)
    b = s.find(end, a + len(start)) if a >= 0 else -1
    if a < 0 or b < 0:
        raise RuntimeError(f"{label}: expected source markers missing")
    s = s[:a] + new + s[b:]


replace("<title>TruckSpot Europe · V17 | Vrachtwagenovernachting</title>",
        "<title>TruckSpot Europe · 1.0.1 | Vrachtwagenovernachting</title>", "title")
replace(
    r"const truck=has(t,'hgv')||Number(t['capacity:hgv'])>0||Number(t['capacity:truck'])>0||/\b(truck|lkw|autohof|camion|vrachtwagen|tir\s*park|camiones)\b/i.test(t.name||'');",
    r"const truck=has(t,'hgv')||Number(t['capacity:hgv'])>0||Number(t['capacity:truck'])>0||['hgv:overnight','overnight:hgv','overnight_parking:hgv','parking:overnight:hgv'].some(k=>/^(yes|designated|official|allowed|permitted)$/i.test(t[k]||''))||/\b(truck|lkw|autohof|camion|vrachtwagen|tir\s*park|camiones)\b/i.test(t.name||'');",
    "truckovernachting tags",
)
replace("return [...seen.values()].slice(0,MAX_RESULTS);",
        "return [...seen.values()].filter(truckOvernightAllowed).slice(0,MAX_RESULTS);",
        "OSM overnight filter before limit")
span("function fallbackQuery(path){", "async function parkingApi(",
     """function fallbackQuery(path){
 const p=new URL(path,window.location.origin).searchParams;
 const radius=Math.round(Math.min(100,Math.max(5,Number(p.get('radius'))||50))*1000);
 const area=p.has('bbox')?'('+p.get('bbox')+')':'(around:'+radius+','+Number(p.get('lat'))+','+Number(p.get('lon'))+')';
 const allowed='^(yes|designated|official|allowed|permitted)$';
 const strict=['hgv:overnight','overnight:hgv','overnight_parking:hgv','parking:overnight:hgv']
   .map(k=>'nwr["'+k+'"~"'+allowed+'",i]'+area+';').join('');
 const general='nwr["overnight_parking"~"'+allowed+'",i]["hgv"~"^(yes|designated|official)$",i]'+area+';'
  +'nwr["overnight_parking"~"'+allowed+'",i]["capacity:hgv"]'+area+';'
  +'nwr["overnight_parking"~"'+allowed+'",i]["capacity:truck"]'+area+';';
 return '[out:json][timeout:35];('+strict+general+');out center tags '+MAX_RESULTS+';';
}
""", "OSM overnight query")
span("async function fetchLocations(){", "  const height=distance(",
     """async function fetchLocations(){
  if(state.pending||!state.map)return;
  const bounds=state.map.getBounds();
  // V1.0.0 returned early from an unverified offline research catalog.
  // Search live overnight-tagged sources instead of showing zero truck parkings.
""", "map source fallback")
span("  // Use the built-in 2025 European research catalog first; no network timeout.",
     "  const key='ts9_gps_",
     """  // Search live for truck parking with explicit overnight permission.
  // Research coordinates are not evidence that sleeping here is permitted.
""", "GPS source fallback")
replace("const key='ts9_bbox_'+bboxKey();", "const key='ts18_bbox_'+bboxKey();", "map cache version")
replace("const key='ts9_gps_'+loc.lat.toFixed(2)+'_'+loc.lng.toFixed(2)+'_'+km;",
        "const key='ts18_gps_'+loc.lat.toFixed(2)+'_'+loc.lng.toFixed(2)+'_'+km;", "GPS cache version")
replace(
    "const verified=spots.filter(truckOvernightAllowed).length;\n  $('#mapstatus').textContent='🌙 '+verified+' bevestigde truckovernachtingsplekken '+label+' · '+(spots.length-verified)+' onbevestigde locaties verborgen';\n  tell(verified?verified+' bevestigde overnachtingsplekken gevonden':'Geen bewezen truckovernachtingsplek in dit gebied. Onbevestigde plekken zijn verborgen.');",
    "const verified=spots.filter(truckOvernightAllowed).length;\n  $('#mapstatus').textContent='🌙 '+verified+' truckparkings met vermelde nachttoestemming '+label;\n  tell(verified?verified+' trucknachtparkings gevonden':'Geen trucknachtparkings met expliciete nachttoestemming gevonden. Probeer een groter gebied.');",
    "status text",
)
replace(
    """s.research?'<span class="chip warn">🚛 Mogelijke truckstop (onderzoek 2025)</span>':(s.truck?'<span class="chip good">🚛 HGV aangeduid</span>':'<span class="chip warn">🚛 Controleer toegang</span>')""",
    """s.research?'<span class="chip warn">🚛 Mogelijke truckstop (onderzoek 2025)</span>':(s.truck?'<span class="chip good">🌙 Overnachten volgens OSM · borden controleren</span>':'<span class="chip warn">🚛 Controleer toegang</span>')""",
    "OSM badge",
)
replace(
    "Nog geen geverifieerde truckovernachtingsplek in dit gebied. Onderzoeksplekken zonder nachttoestemming zijn verborgen. Zoek een andere regio of voeg een gecontroleerde plek toe.",
    "Geen truckparking met expliciete nachttoestemming in de beschikbare bron. Zoek binnen 100 km of kies een andere regio.",
    "empty status",
)
replace(
    "🌙 Alleen plekken waar truckovernachten is bevestigd. Onbevestigde rustplaatsen blijven verborgen. Bezetting is niet live; controleer ter plaatse altijd de actuele borden.",
    "🌙 Alleen truckparkeerplaatsen met vermelde nachttoestemming in OSM of een gecontroleerde gedeelde bron. OSM-informatie kan verouderd zijn; controleer altijd de borden en regels. Geen live bezetting.",
    "source warning",
)
assert "await catalogMap(bounds)" not in s[s.index("async function fetchLocations(){"):s.index("function init(){")]
assert "await catalogNear(loc.lat" not in s[s.index("async function loadNearMe(){"):s.index("function requestGps(")]
path.write_text(s, encoding="utf-8")
print("1.0.1 live overnight truckparking search patched; offline unverified data hidden.")
