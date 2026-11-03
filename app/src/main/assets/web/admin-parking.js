'use strict';
/*
 * TruckSpot Europe 1.0.7 – moderator dashboard and secure admin account registration.
 * Deliberately uses a separate, short-lived, IN-MEMORY admin session.
 * No moderator identity, password, API service key or role is ever hardcoded.
 * All write decisions are enforced in the Supabase database by RLS.
 */
(function(){
 let cfg=null,token='',expiresAt=0,admin=false,working=false;
 const btn=document.getElementById('adminopen');
 if(!btn)return;
 const safe=ESC;
 function forget(){token='';expiresAt=0;admin=false}
 function allowed(){return !!cfg&&!!token&&admin&&Date.now()<expiresAt-45000}
 function header(){return {'apikey':cfg.publishableKey,'Authorization':'Bearer '+token,'Accept':'application/json'}}
 async function config(){
  if(cfg)return cfg;
  const r=await fetch('./shared-config.json',{cache:'no-store'});
  if(!r.ok)throw Error('TruckSpot-databaseconfig ontbreekt');
  const d=await r.json();
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(d.url||'')||
     !/^sb_publishable_[A-Za-z0-9_-]+$/.test(d.publishableKey||''))throw Error('Databaseconfig ongeldig');
  cfg={url:d.url.replace(/\/$/,''),publishableKey:d.publishableKey};
  return cfg;
 }
 function loginScreen(info=''){
  showSheet('🔒 TruckSpot beheer',`
   <p>Alleen voor gemachtigde beheerders. Chauffeurs kunnen geen meldingen zelf goedkeuren.</p>
   <p class="hint">Gebruik je eigen e-mail en wachtwoord. Een nieuw account heeft nog geen beheerdersrechten: die worden afzonderlijk en handmatig geactiveerd.</p>
   <label for="admin-email">Beheerder e-mail
     <input class="wide" id="admin-email" type="email" inputmode="email" autocomplete="username" maxlength="200" required placeholder="e-mailadres"></label>
   <label for="admin-password">Wachtwoord
     <input class="wide" id="admin-password" type="password" autocomplete="current-password" required placeholder="Wachtwoord"></label>
   <label class="check"><input id="admin-stopped" type="checkbox"> Ik sta veilig stil en kan de gegevens zorgvuldig controleren.</label>
   <p id="admin-feedback" class="hint" role="status" aria-live="polite">${safe(info)}</p>
   <button class="btn primary wide" data-admin="login">🔐 Aanmelden als beheerder</button>
   <button class="btn wide" data-admin="create-account">📧 Beheeraccount aanmaken</button>
   <p class="hint">Je wachtwoord wordt nooit opgeslagen door TruckSpot. Na sluiten van de app moet je opnieuw inloggen.</p>
  `);
 }
function registrationScreen(info=''){
  showSheet('📧 Beheeraccount aanmaken',`
   <p>Maak een persoonlijk account aan voor toegang tot het TruckSpot-beheer.</p>
   <p class="hint"><b>Let op:</b> registreren geeft nog geen beheerdersrechten. De eigenaar moet je account na e-mailbevestiging apart activeren. Chauffeurs kunnen geen beheerder worden door zich alleen aan te melden.</p>
   <label for="admin-register-email">E-mailadres
     <input class="wide" id="admin-register-email" type="email" inputmode="email" autocomplete="email" maxlength="200" placeholder="jij@voorbeeld.nl" required></label>
   <label for="admin-register-password">Nieuw wachtwoord (minimaal 12 tekens)
     <input class="wide" id="admin-register-password" type="password" autocomplete="new-password" minlength="12" maxlength="128" required></label>
   <label for="admin-register-confirm">Wachtwoord herhalen
     <input class="wide" id="admin-register-confirm" type="password" autocomplete="new-password" minlength="12" maxlength="128" required></label>
   <label class="check"><input id="admin-register-stopped" type="checkbox"> Ik sta veilig stil en bevestig dat ik dit account zelf aanmaak.</label>
   <p id="admin-feedback" class="hint" role="status" aria-live="polite">${safe(info)}</p>
   <button class="btn primary wide" data-admin="register">✅ Account aanmaken</button>
   <button class="btn wide" data-admin="back-login">↩ Terug naar inloggen</button>
   <p class="hint">Je wachtwoord gaat rechtstreeks via een beveiligde HTTPS-verbinding naar Supabase Auth en wordt niet in TruckSpot opgeslagen.</p>
  `);
 }
 async function registerAccount(){
  if(working)return;
  if(!document.getElementById('admin-register-stopped')?.checked)return status('Bevestig dat je veilig stilstaat.');
  const email=(document.getElementById('admin-register-email')?.value||'').trim();
  const pw=document.getElementById('admin-register-password')?.value||'';
  const again=document.getElementById('admin-register-confirm')?.value||'';
  if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)||email.length>200)return status('Vul een geldig e-mailadres in.');
  if(pw.length<12||pw.length>128)return status('Kies een wachtwoord van minstens 12 en maximaal 128 tekens.');
  if(pw!==again)return status('De twee wachtwoorden zijn niet gelijk.');
  working=true;status('Beveiligd account aanmaken…');
  try{
   const c=await config();
   const r=await fetch(c.url+'/auth/v1/signup',{
    method:'POST',
    headers:{'apikey':c.publishableKey,'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({email,password:pw}),cache:'no-store'
   });
   if(!r.ok){
    let message='Registreren is niet gelukt.';
    try{const d=await r.json();if(r.status===429)message='Te veel pogingen. Probeer later opnieuw.';else if(r.status===422)message=d.msg||d.message||'E-mailadres of wachtwoord geweigerd.';else if(r.status===400)message=d.msg||d.message||message}catch{}
    throw Error(message);
   }
   showSheet('✅ Account aangevraagd',`
    <p>Je registratie is verstuurd voor <b>${safe(email)}</b>.</p>
    <p><b>Controleer je e-mail</b> op een bevestigingslink (ook in de spamfolder). Heb je al een account, gebruik dan de inlogknop.</p>
    <p class="callout">🔒 Dit account is <b>nog niet bevoegd</b> om parkings goed te keuren. Na je bevestiging moet de TruckSpot-eigenaar de beheerdersrechten afzonderlijk activeren. Dat gaat nooit automatisch.</p>
    <button class="btn primary wide" data-admin="back-login">🔐 Naar inloggen</button>
    <p class="hint">Deel nooit je wachtwoord of bevestigingslink met anderen.</p>`);
  }catch(e){status(String(e.message||'Account aanmaken mislukt'))}
  finally{working=false}
 }
 function status(msg){const e=document.getElementById('admin-feedback');if(e)e.textContent=msg}
 async function signIn(){
  if(working)return;
  if(!document.getElementById('admin-stopped')?.checked)return status('Bevestig eerst dat je veilig stilstaat.');
  const email=(document.getElementById('admin-email')?.value||'').trim();
  const password=document.getElementById('admin-password')?.value||'';
  if(!email.includes('@')||!password)return status('Vul e-mail en wachtwoord in.');
  working=true;status('Beveiligde login controleren…');
  try{
   const c=await config();
   const r=await fetch(c.url+'/auth/v1/token?grant_type=password',{
    method:'POST',
    headers:{'apikey':c.publishableKey,'Content-Type':'application/json'},
    body:JSON.stringify({email,password}),cache:'no-store'
   });
   if(!r.ok)throw Error('Inloggen mislukt. Controleer je account en wachtwoord.');
   const data=await r.json();
   if(!data.access_token||data.user?.app_metadata?.truckspot_moderator!==true||data.user?.is_anonymous===true){
    forget();throw Error('Dit account heeft geen beheerdersrechten. Activeer die eerst veilig in Supabase.');
   }
   token=data.access_token;
   expiresAt=Date.now()+1000*Math.max(60,Number(data.expires_in)||3600);
   admin=true;
   await loadQueue();
  }catch(e){forget();loginScreen(String(e.message||'Geen toegang'))}
  finally{working=false}
 }
 async function query(table,columns){
  const c=await config();
  const params=new URLSearchParams({select:columns,status:'eq.pending',order:'created_at.asc',limit:'80'});
  const r=await fetch(c.url+'/rest/v1/'+table+'?'+params,{
   headers:header(),cache:'no-store'
  });
  if(!r.ok)throw Error('Meldingen ophalen mislukt (HTTP '+r.status+'). Controleer beheerdersrechten.');
  const rows=await r.json();if(!Array.isArray(rows))throw Error('Ongeldig antwoord van database');
  return rows;
 }
 const fmtDate=d=>{const t=new Date(d);return isNaN(t.getTime())?'onbekend':t.toLocaleString('nl-NL',{dateStyle:'short',timeStyle:'short'})};
 function locationLink(r){
  return '<a rel="noopener noreferrer" target="_blank" href="https://www.openstreetmap.org/?mlat='
   +encodeURIComponent(r.lat)+'&mlon='+encodeURIComponent(r.lng)
   +'#map=15/'+encodeURIComponent(r.lat)+'/'+encodeURIComponent(r.lng)
   +'">📍 Kaart bekijken ↗</a>';
 }
 function correctionCard(r){
  return '<div class="callout"><b>✏️ '+safe(r.spot_name)+'</b><br>'
  +safe(r.overnight==='yes'?'Chauffeur meldt: nachtparkeren toegestaan':'Chauffeur meldt: nachtparkeren niet toegestaan')
  +'<br><b>Uitleg:</b> '+safe(r.evidence)+'<br>'+locationLink(r)
  +'<br><span class="hint">Ingestuurd: '+safe(fmtDate(r.created_at))+'</span>'
  +'<p class="hint">Goedkeuren publiceert dit alléén als chauffeursmelding, nooit als officiële toestemming.</p>'
  +'<div class="toolbar"><button class="btn primary small" data-admin="approve-correction" data-id="'+safe(r.id)+'">✅ Goedkeuren</button>'
  +'<button class="btn small" data-admin="reject-correction" data-id="'+safe(r.id)+'">✖ Afwijzen</button></div></div>';
 }
 function parkingCard(r){
  return '<div class="callout"><b>🚛 '+safe(r.name)+'</b><br>'
  +'Soort: '+safe(r.kind)+' · Tarief: '+safe(r.fee)
  +'<br><b>Toelichting chauffeur:</b> '+safe(r.notes||'Geen bron opgegeven')
  +'<br>Vrachtwagentoegang volgens chauffeur: '+(r.truck_verified?'ja':'nee')
  +' · Nachtparkeren volgens chauffeur: '+(r.overnight_claimed?'ja':'nee')
  +'<br>'+locationLink(r)+'<br><span class="hint">Ingestuurd: '+safe(fmtDate(r.created_at))+'</span>'
  +'<p class="hint"><b>Goedkeuren kan alleen met onafhankelijk gecontroleerde bron</b> (beheerder of officiële borden). Zonder bron: afwijzen of laten wachten.</p>'
  +'<label for="admin-source-'+safe(r.id)+'">Bron / bevestiging van nachtparkeren (min. 12 tekens)'
  +'<textarea class="wide" id="admin-source-'+safe(r.id)+'" maxlength="220" placeholder="Bijvoorbeeld beheerder, datum en regels"></textarea></label>'
  +'<div class="toolbar"><button class="btn primary small" data-admin="approve-parking" data-id="'+safe(r.id)+'">✅ Goedkeuren na controle</button>'
  +'<button class="btn small" data-admin="reject-parking" data-id="'+safe(r.id)+'">✖ Afwijzen</button></div></div>';
 }
 async function loadQueue(){
  if(!allowed()){forget();return loginScreen('Je beheerderssessie is verlopen. Meld je opnieuw aan.')}
  try{
   const [corrections,parkings]=await Promise.all([
    query('truckspot_parking_corrections','id,source_spot_id,spot_name,lat,lng,overnight,evidence,created_at'),
    query('truckspot_parking_submissions','id,name,lat,lng,kind,fee,truck_verified,overnight_claimed,notes,created_at')
   ]);
   showSheet('🔒 TruckSpot – meldingen beoordelen',`
    <p><b>✏️ ${corrections.length} correcties</b> en <b>🚛 ${parkings.length} nieuwe parkeerplaatsen</b> wachten op controle.</p>
    <p class="hint">Geen automatische goedkeuring. Controleer regelgeving en bron zorgvuldig; een chauffeursmelding is nooit officiële toestemming.</p>
    <div class="toolbar"><button class="btn small" data-admin="refresh">↻ Vernieuwen</button><button class="btn small" data-admin="logout">Uitloggen</button></div>
    <p id="admin-feedback" role="status" aria-live="polite" class="hint"></p>
    <h3>✏️ Nachtparkeren aanpassen</h3>
    ${corrections.length?corrections.map(correctionCard).join(''):'<p class="hint">Geen wachtende correcties.</p>'}
    <h3>🚛 Nieuwe parkeerplaatsen</h3>
    ${parkings.length?parkings.map(parkingCard).join(''):'<p class="hint">Geen wachtende nieuwe parkeerplaatsen.</p>'}
    <div class="toolbar"><button class="btn small" data-admin="refresh">↻ Ververs lijst</button><button class="btn small" data-admin="logout">Uitloggen</button></div>
   `);
  }catch(e){status(String(e.message||'Database tijdelijk niet bereikbaar'))}
 }
 async function moderate(action,id){
  if(working)return;
  if(!allowed()){forget();return loginScreen('Beheerderssessie verlopen.')}
  const isCorrection=action.endsWith('correction');
  const approve=action.startsWith('approve');
  if(!/^[0-9a-f-]{36}$/i.test(id))return status('Ongeldig meldingsnummer');
  let payload={status:approve?'approved':'rejected'};
  if(!isCorrection){
   if(approve){
    const source=(document.getElementById('admin-source-'+id)?.value||'').trim();
    if(source.length<12)return status('Vul eerst een controleerbare onafhankelijke bron in (min. 12 tekens).');
    payload.overnight_verified=true;payload.overnight_source=source.slice(0,220);
   }else {payload.overnight_verified=false;payload.overnight_source=null}
  }
  const question=approve?
   (isCorrection?'Deze melding publiceren als NIET-OFFICIELE chauffeursmelding?':'Is nachtparkeren onafhankelijk bevestigd door beheerder of officiële bron? Dan pas publiceren.'):
   'Deze melding afwijzen?';
  if(!confirm(question))return;
  working=true;status('Beoordeling wordt veilig opgeslagen…');
  try{
   const table=isCorrection?'truckspot_parking_corrections':'truckspot_parking_submissions';
   const params=new URLSearchParams({id:'eq.'+id,status:'eq.pending',select:'id,status'});
   const r=await fetch(cfg.url+'/rest/v1/'+table+'?'+params,{
    method:'PATCH',headers:{...header(),'Content-Type':'application/json','Prefer':'return=representation'},
    body:JSON.stringify(payload),cache:'no-store'
   });
   if(!r.ok){let message='HTTP '+r.status;try{const d=await r.json();message=d.message||message}catch{}throw Error(message)}
   const changed=await r.json();
   if(!Array.isArray(changed)||changed.length!==1)throw Error('Geen wachtende melding gewijzigd. Vernieuw de lijst.');
   await loadQueue();
   status('✅ '+(approve?'Goedgekeurd':'Afgewezen')+'. De gegevens zijn bijgewerkt.');
   window.TruckSpotShared?.refresh(true);
  }catch(e){status('⚠ '+String(e.message||'Beoordeling mislukt'))}
  finally{working=false}
 }
 btn.addEventListener('click',()=>{if(allowed())loadQueue();else loginScreen()});
 document.getElementById('sheetbody').addEventListener('click',e=>{
  const b=e.target.closest('button[data-admin]');if(!b)return;
  const action=b.dataset.admin;
  if(action==='login')signIn();
  else if(action==='create-account')registrationScreen();
  else if(action==='register')registerAccount();
  else if(action==='back-login')loginScreen();
  else if(action==='logout'){forget();hideSheet();tell('Beheerderssessie afgesloten')}
  else if(action==='refresh')loadQueue();
  else if(['approve-correction','reject-correction','approve-parking','reject-parking'].includes(action))moderate(action,b.dataset.id);
 });
})();
