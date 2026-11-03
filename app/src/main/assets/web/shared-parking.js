'use strict';
/*
 * TruckSpot Shared Parking V15
 * Supabase public read + anonymous sign-in for submissions, approval-only publishing.
 * It is deliberately inactive without shared-config.json containing a project URL
 * and PUBLISHABLE key. Never insert service_role or secret keys.
 */
(function(){
 let cfg=null, lastFetch=0, busy=false;
 const status=()=>document.getElementById('sharedstatus');
 const setStatus=message=>{const e=status();if(e)e.textContent=message};
 const configured=()=>cfg&&/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.url)&&/^sb_publishable_[A-Za-z0-9_\-]+$/.test(cfg.publishableKey);
 const headers=(token)=>({'apikey':cfg.publishableKey, ...(token?{'Authorization':'Bearer '+token}:{}),'Accept':'application/json'});
 const base=()=>cfg.url;
 function areaBounds(){
  if(!state.map)return null;
  let c=state.map.getCenter(),s=state.map.getBounds();
  if(state.searchMode==='gps'&&state.location){
   const km=state.radiusKm>0?state.radiusKm:50;
   const latD=km/110.57, lonD=km/(111.32*Math.max(0.15,Math.cos(state.location.lat*Math.PI/180)));
   return {south:state.location.lat-latD,north:state.location.lat+latD,west:state.location.lng-lonD,east:state.location.lng+lonD};
  }
  return {south:s.getSouth(),north:s.getNorth(),west:s.getWest(),east:s.getEast()};
 }
 function toSpot(s){
  return {id:'shared-'+s.id,name:s.name,lat:s.lat,lng:s.lng,type:s.kind,
   truck:s.truck_verified===true,fee:s.fee||'unknown',
   fac:{toilets:s.toilets===true,shower:s.shower===true,food:s.food===true,security:s.security===true},
   note:s.notes||'',shared:true,overnightVerified:s.overnight_verified===true,overnightSource:s.overnight_source||'',raw:{operator:'','addr:city':''},
   sourceUrl:'https://www.openstreetmap.org/?mlat='+s.lat+'&mlon='+s.lng+'#map=15/'+s.lat+'/'+s.lng};
 }
 async function refresh(force=false){
  if(!configured())return;
  if(busy||(!force&&Date.now()-lastFetch<20000))return;
  const b=areaBounds();if(!b)return;
  busy=true;lastFetch=Date.now();
  setStatus('🌍 Goedgekeurde gedeelde parkeerplaatsen ophalen…');
  try{
   const query=new URLSearchParams({
    select:'id,name,lat,lng,kind,fee,truck_verified,toilets,shower,food,security,notes,overnight_verified,overnight_source',
    status:'eq.approved',truck_verified:'eq.true',overnight_verified:'eq.true',lat:'gte.'+Math.max(-90,b.south),lng:'gte.'+Math.max(-180,b.west),
    order:'created_at.desc',limit:'200'
   });
   // PostgREST URLSearchParams cannot represent duplicate keys with object constructor:
   query.append('lat','lte.'+Math.min(90,b.north));
   query.append('lng','lte.'+Math.min(180,b.east));
   const res=await fetch(base()+'/rest/v1/truckspot_parking_submissions?'+query.toString(),{headers:headers(),cache:'no-store'});
   if(!res.ok)throw Error('HTTP '+res.status);
   const rows=await res.json();
   if(!Array.isArray(rows))throw Error('Ongeldig serverantwoord');
   state.shared=rows.filter(r=>Number.isFinite(r.lat)&&Number.isFinite(r.lng)&&typeof r.name==='string'&&r.truck_verified===true&&r.overnight_verified===true).map(toSpot);
   draw();
   setStatus('🌍 '+rows.length+' gedeelde, goedgekeurde parkeerplekken in deze omgeving. Nieuwe meldingen verschijnen pas na controle.');
  }catch(e){setStatus('⚠ Gedeelde parkeerplaatsen niet bereikbaar ('+(e.message||'netwerkfout')+'). Je lokale kaart werkt wel.')}
  finally{busy=false}
 }
 async function getSession(){
  const stored=store.get('ts15_shared_session',null);
  if(stored?.access_token&&stored?.refresh_token&&stored.expiresAt>Date.now()+60000)return stored.access_token;
  if(stored?.refresh_token){
   try{
    const r=await fetch(base()+'/auth/v1/token?grant_type=refresh_token',{
     method:'POST',headers:{...headers(),'Content-Type':'application/json'},
     body:JSON.stringify({refresh_token:stored.refresh_token})
    });
    if(r.ok){const data=await r.json();if(data.access_token){saveSession(data);return data.access_token}}
   }catch(e){console.warn('Session refresh niet beschikbaar:',e)}
  }
  // Creates an anonymous Supabase account only when user explicitly shares a spot.
  const r=await fetch(base()+'/auth/v1/signup',{
   method:'POST',headers:{...headers(),'Content-Type':'application/json'},
   body:'{}'
  });
  if(!r.ok){
   let detail='HTTP '+r.status;
   try{const d=await r.json();detail=d.msg||d.message||d.error_description||d.error||detail}catch{}
   throw Error('Anoniem aanmelden mislukt: '+detail);
  }
  const data=await r.json();
  if(!data.access_token)throw Error('Inloggen leverde geen token op; controleer Anonymous Sign-Ins');
  saveSession(data);
  return data.access_token;
 }
 function saveSession(data){
  store.set('ts15_shared_session',{
   access_token:data.access_token,refresh_token:data.refresh_token,
   expiresAt:Date.now()+Math.max(60,Number(data.expires_in)||3600)*1000
  });
 }
 async function submitLocal(id){
  const spot=state.added.find(s=>s.id===id);
  if(!spot){tell('Deze parkeerplaats is niet meer op jouw telefoon gevonden.');return}
  if(spot.submittedAt){tell('Deze plek is al ingestuurd voor controle.');return}
  if(!spot.truck||!spot.overnightClaimed){tell('Je kunt alleen een bewezen vrachtwagenovernachtingsplek insturen.');return}
  if(!configured()){
   showSheet('🌍 Gedeelde database nog niet actief',
     '<p>Je eigen parkeerplaats is veilig op je telefoon bewaard.</p><p>Om hem met andere chauffeurs te delen, moet eerst de centrale TruckSpot-database worden gekoppeld. Dat is nog niet gedaan.</p><p>De knop werkt zodra de Supabase-verbinding is ingesteld.</p>');
   return;
  }
  if(!confirm('Deze parkeerplaats voor controle naar de gedeelde TruckSpot-database sturen? De locatie en je notitie kunnen na goedkeuring openbaar zichtbaar worden.'))return;
  try{
   const token=await getSession();
   const payload={
    name:spot.name,lat:spot.lat,lng:spot.lng,
    kind:spot.type==='rustplaats'?'rustplaats':'parking',
    fee:spot.fee==='free'||spot.fee==='paid'?spot.fee:'unknown',
    truck_verified:spot.truck===true,overnight_claimed:spot.overnightClaimed===true,
    toilets:spot.fac.toilets===true,shower:spot.fac.shower===true,
    food:spot.fac.food===true,security:spot.fac.security===true,
    notes:(spot.note||'').slice(0,220)
   };
   const r=await fetch(base()+'/rest/v1/truckspot_parking_submissions',{
    method:'POST',
    headers:{...headers(token),'Content-Type':'application/json','Prefer':'return=minimal'},
    body:JSON.stringify(payload)
   });
   if(!r.ok){
    let message='HTTP '+r.status;
    try{const data=await r.json();message=data.message||data.error_description||message}catch{}
    throw Error(message);
   }
   spot.submittedAt=new Date().toISOString();
   store.set('ts14_own_spots',state.added);
   showSheet('✅ Ingestuurd voor controle',
    '<p>Je parkeerplaats is doorgestuurd naar TruckSpot. Hij wordt pas openbaar als hij is goedgekeurd.</p><p>Tot die tijd blijft hij op jouw telefoon zichtbaar. Er is geen live bezettingsmelding verstuurd.</p>');
  }catch(e){
   showSheet('⚠ Insturen mislukt','<p>'+ESC(String(e.message||'Onbekende netwerkfout'))+'</p><p>Je eigen parkeerplaats staat nog op je telefoon. Je kunt het later opnieuw proberen.</p>');
  }
 }
 async function init(){
  try{
   const r=await fetch('./shared-config.json',{cache:'no-store'});
   if(!r.ok)throw Error('config ontbreekt');
   const obj=await r.json();
   cfg={url:String(obj.url||'').replace(/\/$/,''),publishableKey:String(obj.publishableKey||'')};
   if(!configured()){
    setStatus('🌍 Gedeelde database nog niet verbonden. Eigen parkeerplaatsen worden alleen op jouw telefoon bewaard.');
    return;
   }
   setStatus('🌍 Verbonden met gedeelde database; alleen goedgekeurde plekken zijn openbaar.');
   await refresh(true);
  }catch(e){setStatus('🌍 Gedeelde database nog niet ingesteld. Eigen plekken blijven lokaal.')}
 }
 document.getElementById('sharedrefresh').addEventListener('click',()=>{
  if(!configured()){
   showSheet('🌍 Gedeelde TruckSpot-parkings',
    '<p>Deze functie wordt beschikbaar zodra de gedeelde database is verbonden.</p><p>Op dit moment kun je wel zelf parkeerplaatsen toevoegen, maar ze staan alleen op jouw telefoon.</p>');
   return;
  }
  refresh(true);
 });
 document.getElementById('sheetbody').addEventListener('click',ev=>{
  const b=ev.target.closest('button[data-shared="submit"]');
  if(b)submitLocal(b.dataset.id);
 });
 window.TruckSpotShared={refresh,enabled:()=>Boolean(configured())};
 init();
})();