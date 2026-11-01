'use strict';
/* TruckSpot V14: own parking locations are strictly local to this test APK. */
function addParkingDialog(){
 const center=state.map?state.map.getCenter():{lat:52.09,lng:5.12};
 const coords=state.location||center;
 showSheet('➕ Nieuwe parkeerplaats',`
 <p class="hint">Voeg een plek toe die je kent. <b>Alleen zichtbaar en opgeslagen op jouw telefoon</b> — nog niet gedeeld met andere chauffeurs.</p>
 <div class="add-grid">
  <label class="wide" for="add-name">Naam van de parkeerplaats *<input id="add-name" maxlength="80" placeholder="Bijv. Truckparking A28" required></label>
  <label for="add-lat">Breedtegraad *<input id="add-lat" inputmode="decimal" type="number" step="any" min="-90" max="90" required value="${coords.lat.toFixed(5)}"></label>
  <label for="add-lng">Lengtegraad *<input id="add-lng" inputmode="decimal" type="number" step="any" min="-180" max="180" required value="${coords.lng.toFixed(5)}"></label>
  <div class="wide toolbar"><button class="btn" type="button" data-own="gps">📍 Gebruik mijn GPS</button><button class="btn" type="button" data-own="center">🗺️ Midden van kaart</button></div>
  <label for="add-type">Soort plek<select id="add-type"><option value="parking">🅿️ Parking</option><option value="rustplaats">🛣️ Rustplaats</option></select></label>
  <label for="add-fee">Tarief<select id="add-fee"><option value="unknown">Onbekend</option><option value="free">Gratis</option><option value="paid">Betaald</option></select></label>
  <label class="check wide"><input id="add-truck" type="checkbox"> 🚛 Ik heb ter plaatse gecontroleerd dat vrachtwagens er mogen staan.</label>
  <label class="check"><input id="add-toilet" type="checkbox"> 🚻 Toilet</label>
  <label class="check"><input id="add-shower" type="checkbox"> 🚿 Douche</label>
  <label class="check"><input id="add-food" type="checkbox"> 🍽️ Eten</label>
  <label class="check"><input id="add-security" type="checkbox"> 🔐 Beveiliging vermeld</label>
  <label class="wide" for="add-note">Opmerking (optioneel)<textarea id="add-note" maxlength="220" placeholder="Bijv. inrit, openingstijden of hoogtebeperking"></textarea></label>
  <label class="check wide"><input id="add-stopped" type="checkbox"> Ik sta veilig stil en controleer de gegevens voordat ik deze bewaar.</label>
 </div>
 <p class="add-status" id="add-status" role="status" aria-live="polite"></p>
 <button type="button" data-own="save" class="btn primary wide">✅ Parkeerplaats opslaan</button>
 `);
}
function ownStatus(msg,error=false){const e=$('#add-status');if(e){e.textContent=msg;e.style.color=error?'#ffbd3a':'#b7ffa0'}}
function ownCoords(lat,lng){
 if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180){ownStatus('Ongeldige coördinaten',true);return}
 $('#add-lat').value=lat.toFixed(6);$('#add-lng').value=lng.toFixed(6);
 ownStatus('📍 Positie ingevuld. Controleer of de pin op de juiste parking staat.');
}
function saveOwnParking(){
 const name=$('#add-name').value.trim(),lt=$('#add-lat').value.trim(),ln=$('#add-lng').value.trim(),lat=Number(lt),lng=Number(ln);
 if(!name||name.length>80){ownStatus('Vul eerst een naam in (maximaal 80 tekens).',true);return}
 if(!lt||!ln||!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180){ownStatus('Vul geldige GPS-coördinaten in.',true);return}
 if(!$('#add-stopped').checked){ownStatus('Bevestig dat je veilig stilstaat.',true);return}
 if(state.added.length>=500){ownStatus('Maximaal 500 eigen locaties in deze test.',true);return}
 const spot={
  id:'own-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),
  name,lat,lng,type:$('#add-type').value==='rustplaats'?'rustplaats':'parking',
  truck:$('#add-truck').checked,fee:$('#add-fee').value,
  fac:{toilets:$('#add-toilet').checked,shower:$('#add-shower').checked,food:$('#add-food').checked,security:$('#add-security').checked},
  raw:{operator:'','addr:city':''},
  sourceUrl:'https://www.openstreetmap.org/?mlat='+lat+'&mlon='+lng+'#map=15/'+lat+'/'+lng,
  userAdded:true,note:$('#add-note').value.trim().slice(0,220),createdAt:new Date().toISOString()
 };
 if(state.added.some(s=>distance(s,spot)<0.05&&s.name.toLowerCase()===name.toLowerCase())){ownStatus('Deze eigen parkeerplaats bestaat al.',true);return}
 state.added.push(spot);store.set('ts14_own_spots',state.added);
 state.filterView='all';state.searchMode='map';state.query='';$('#search').value='';
 Object.keys(state.filter).forEach(k=>state.filter[k]=false);
 hideSheet();state.map?.setView([lat,lng],Math.max(13,state.map.getZoom()));
 draw();$('#mapstatus').textContent='✅ Eigen parkeerplaats opgeslagen · niet gedeeld met anderen';
 tell('✅ Eigen parkeerplaats opgeslagen op deze telefoon');
}
function deleteOwnParking(id){
 const s=state.added.find(p=>p.id===id);if(!s)return;
 if(!confirm('Deze zelf toegevoegde parkeerplaats verwijderen?'))return;
 state.added=state.added.filter(p=>p.id!==id);store.set('ts14_own_spots',state.added);
 state.favs.delete(id);delete state.saved[id];delete state.reports[id];
 store.set('ts3_favs',[...state.favs]);store.set('ts3_savedspots',state.saved);store.set('ts3_reports',state.reports);
 hideSheet();draw();tell('Eigen parkeerplaats verwijderd');
}
$('#addparking').addEventListener('click',addParkingDialog);
$('#sheetbody').addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button||!button.dataset.own)return;
 if(button.dataset.own==='delete')return deleteOwnParking(button.dataset.id);
 if(button.dataset.own==='save')return saveOwnParking();
 if(button.dataset.own==='center'){const p=state.map.getCenter();return ownCoords(p.lat,p.lng)}
 if(button.dataset.own==='gps'){
  if(!navigator.geolocation)return ownStatus('GPS is niet beschikbaar',true);
  ownStatus('📍 GPS-positie opvragen…');
  navigator.geolocation.getCurrentPosition(
   p=>ownCoords(p.coords.latitude,p.coords.longitude),
   e=>ownStatus('GPS niet beschikbaar: '+(e.message||'geen toestemming'),true),
   {enableHighAccuracy:true,maximumAge:10000,timeout:20000}
  );
 }
});
