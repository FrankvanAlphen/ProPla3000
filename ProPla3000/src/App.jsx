import { useState, useMemo, useCallback, createContext, useContext, useRef } from 'react'

/* ── Tokens ───────────────────────────────────────────────────────────── */
const C = {
  pu:'#630D80', puD:'#4A0960', puL:'#EDE0F2',
  li:'#C1E62E', wh:'#FFFFFF', bg:'#F5F4F8',
  bd:'#E8E4EE', bm:'#D4CCE0',
  t1:'#1A1A2E', t2:'#5A5470', t3:'#9B95A8',
  re:'#DC2626', rL:'#FEF2F2', rB:'#FECACA',
  am:'#D97706', aL:'#FFFBEB', aB:'#FDE68A',
  gr:'#16A34A', gL:'#F0FDF4', gB:'#BBF7D0',
}

const PHASES = [
  {key:'Ideeën',        kl:'#7C3AED', bg:'#F5F3FF', rd:'#DDD6FE'},
  {key:'Inventarisatie',kl:'#2563EB', bg:'#EFF6FF', rd:'#BFDBFE'},
  {key:'Analyse',       kl:'#0891B2', bg:'#ECFEFF', rd:'#A5F3FC'},
  {key:'Implementatie', kl:'#630D80', bg:'#EDE0F2', rd:'#D4B0E8'},
  {key:'Nazorg',        kl:'#16A34A', bg:'#F0FDF4', rd:'#BBF7D0'},
  {key:'Archief',       kl:'#6B7280', bg:'#F9FAFB', rd:'#E5E7EB'},
]

/* ── Helpers ──────────────────────────────────────────────────────────── */
const TODAY = new Date().toISOString().slice(0,10)
const addD  = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10) }
const diff  = (a,b) => Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/86400000)
const dFrom = s => diff(TODAY,s)
const fmt   = s => s ? new Date(s+'T00:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'short'}) : '—'
const rel   = s => { if(!s)return'—'; const n=diff(s,TODAY); return n===0?'Vandaag':n===1?'Gisteren':n<7?n+'d geleden':fmt(s) }
const isLate= t => t.s!=='afgerond'&&t.eind<TODAY
const isRisk= t => t.s==='niet_gestart'&&dFrom(t.eind)>=0&&dFrom(t.eind)<=7
const bAge  = s => diff(s,TODAY)
const ageC  = n => n<=3?C.t3:n<=7?C.am:C.re
const uid   = () => Math.random().toString(36).slice(2,9)
const shD   = (s,n) => { const d=new Date(s+'T00:00:00'); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10) }
const hC    = g => g==='groen'?C.gr:g==='rood'?C.re:C.am
const hBg   = g => g==='groen'?C.gL:g==='rood'?C.rL:C.aL
const hBd   = g => g==='groen'?C.gB:g==='rood'?C.rB:C.aB
const hLbl  = g => g==='groen'?'Op schema':g==='rood'?'Kritiek':'Aandacht'

/* ── Demo data ────────────────────────────────────────────────────────── */
const P0 = [
  {id:'p1',naam:'BI Platform Migratie',       fase:'Implementatie',  eig:'Sarah Chen',   h:'oranje',omschr:'Migratie legacy BI naar cloud.',         themas:'Digitalisering',          type:'IT-project',         bij:addD(-1)},
  {id:'p2',naam:'Klantportaal Relaunch',       fase:'Analyse',        eig:'Mark de Vries',h:'groen', omschr:'Herontwerp klantportaal.',                themas:'Klantgericht',            type:'Bedrijfsverandering',bij:addD(0) },
  {id:'p3',naam:'Data Governance Framework',   fase:'Inventarisatie', eig:'Sarah Chen',   h:'rood',  omschr:'Enterprise data-governancebeleid.',       themas:'Operationele excellentie',type:'Onderzoek',          bij:addD(-3)},
  {id:'p4',naam:'Finance Rapportage Automat.', fase:'Nazorg',         eig:'Mark de Vries',h:'groen', omschr:'Automatisering financiele rapportage.',   themas:'Digitalisering',          type:'IT-project',         bij:addD(-2)},
  {id:'p5',naam:'HR Selfservice Portal',       fase:'Ideeën',         eig:'Lisa Janssen', h:'groen', omschr:'Concept HR selfservice, ideefase.',       themas:'Klantgericht',            type:'Bedrijfsverandering',bij:addD(-5)},
  {id:'p6',naam:'Infrastructuur Modernisering',fase:'Archief',        eig:'Mark de Vries',h:'groen', omschr:'Succesvol afgerond Q1 2026.',             themas:'Operationele excellentie',type:'Infrastructuur',     bij:addD(-30)},
]

const T0 = [
  {id:'t01',pid:'p1',naam:'Projectkickoff',              eig:'Sarah Chen',   start:addD(-30),eind:addD(-22),s:'afgerond',    mp:false},
  {id:'t02',pid:'p1',naam:'As-is architectuur',          eig:'Team IT',      start:addD(-25),eind:addD(-16),s:'afgerond',    mp:false},
  {id:'t03',pid:'p1',naam:'Datamodel mapping',           eig:'Jan Bakker',   start:addD(-20),eind:addD(-12),s:'afgerond',    mp:false},
  {id:'t04',pid:'p1',naam:'API-integratie specificatie', eig:'Team IT',      start:addD(-14),eind:addD(-7), s:'afgerond',    mp:false},
  {id:'t05',pid:'p1',naam:'Architectuurbeslissing',      eig:'',             start:addD(-14),eind:addD(-14),s:'afgerond',    mp:true },
  {id:'t06',pid:'p1',naam:'Testomgeving inrichten',      eig:'Team IT',      start:addD(-12),eind:addD(-5), s:'actief',      mp:false},
  {id:'t07',pid:'p1',naam:'Data migratie proefrun',      eig:'Jan Bakker',   start:addD(-8), eind:addD(-2), s:'actief',      mp:false},
  {id:'t08',pid:'p1',naam:'Design aftekening',           eig:'Sarah Chen',   start:addD(-10),eind:addD(-3), s:'actief',      mp:false},
  {id:'t09',pid:'p1',naam:'UAT testplan opstellen',      eig:'Sarah Chen',   start:addD(-4), eind:addD(1),  s:'niet_gestart',mp:false},
  {id:'t10',pid:'p1',naam:'UAT Start',                   eig:'',             start:addD(3),  eind:addD(3),  s:'niet_gestart',mp:true },
  {id:'t11',pid:'p1',naam:'UAT uitvoering wave 1',       eig:'Jan Bakker',   start:addD(3),  eind:addD(10), s:'niet_gestart',mp:false},
  {id:'t12',pid:'p1',naam:'UAT uitvoering wave 2',       eig:'Team IT',      start:addD(10), eind:addD(17), s:'niet_gestart',mp:false},
  {id:'t13',pid:'p1',naam:'Go/No-Go beslissing',         eig:'',             start:addD(25), eind:addD(25), s:'niet_gestart',mp:true },
  {id:'t14',pid:'p1',naam:'Go-Live',                     eig:'',             start:addD(28), eind:addD(28), s:'niet_gestart',mp:true },
  {id:'t15',pid:'p1',naam:'Hypercare periode',           eig:'Team IT',      start:addD(28), eind:addD(42), s:'niet_gestart',mp:false},
  {id:'t16',pid:'p2',naam:'Gebruikersonderzoek',         eig:'Mark de Vries',start:addD(-18),eind:addD(-10),s:'afgerond',    mp:false},
  {id:'t17',pid:'p2',naam:'Requirements workshops',      eig:'Mark de Vries',start:addD(-8), eind:addD(0),  s:'actief',      mp:false},
  {id:'t18',pid:'p2',naam:'Functioneel ontwerp',         eig:'Design Team',  start:addD(-5), eind:addD(5),  s:'actief',      mp:false},
  {id:'t19',pid:'p2',naam:'Requirements bevroren',       eig:'',             start:addD(5),  eind:addD(5),  s:'niet_gestart',mp:true },
  {id:'t20',pid:'p2',naam:'UX wireframes',               eig:'Design Team',  start:addD(5),  eind:addD(14), s:'niet_gestart',mp:false},
  {id:'t21',pid:'p2',naam:'Design Goedkeuring',          eig:'',             start:addD(28), eind:addD(28), s:'niet_gestart',mp:true },
  {id:'t22',pid:'p2',naam:'Backend API ontwikkeling',    eig:'Dev Team',     start:addD(28), eind:addD(55), s:'niet_gestart',mp:false},
  {id:'t23',pid:'p3',naam:'Stakeholder mapping',         eig:'Sarah Chen',   start:addD(-20),eind:addD(-14),s:'afgerond',    mp:false},
  {id:'t24',pid:'p3',naam:'Leveranciers shortlist',      eig:'Sarah Chen',   start:addD(-10),eind:addD(-3), s:'actief',      mp:false},
  {id:'t25',pid:'p3',naam:'Leveranciersbeslissing',      eig:'',             start:addD(-3), eind:addD(-3), s:'niet_gestart',mp:true },
  {id:'t26',pid:'p3',naam:'Contract onderhandeling',     eig:'Sarah Chen',   start:addD(0),  eind:addD(10), s:'niet_gestart',mp:false},
  {id:'t27',pid:'p3',naam:'Tooling implementatie',       eig:'Team IT',      start:addD(12), eind:addD(35), s:'niet_gestart',mp:false},
  {id:'t28',pid:'p4',naam:'Definitieve UAT',             eig:'Mark de Vries',start:addD(-5), eind:addD(2),  s:'actief',      mp:false},
  {id:'t29',pid:'p4',naam:'Go-live checklist',           eig:'Mark de Vries',start:addD(2),  eind:addD(5),  s:'niet_gestart',mp:false},
  {id:'t30',pid:'p4',naam:'Project Afsluiting',          eig:'',             start:addD(7),  eind:addD(7),  s:'niet_gestart',mp:true },
  {id:'t31',pid:'p5',naam:'Business case opstellen',     eig:'Lisa Janssen', start:addD(-5), eind:addD(5),  s:'actief',      mp:false},
  {id:'t32',pid:'p5',naam:'Go/No-Go directie',           eig:'',             start:addD(14), eind:addD(14), s:'niet_gestart',mp:true },
]

const B0 = [
  {id:'b1',pid:'p1',txt:'Testomgeving niet ingericht — UAT kan niet starten',eig:'Team IT',   st:'open',    dag:addD(-8), opl:''},
  {id:'b2',pid:'p1',txt:'Legacy API-documentatie ontbreekt',                  eig:'Jan Bakker',st:'open',    dag:addD(-3), opl:''},
  {id:'b3',pid:'p1',txt:'Staging server capaciteit onvoldoende',              eig:'Team IT',   st:'opgelost',dag:addD(-15),opl:'Server tier opgewaardeerd.'},
  {id:'b4',pid:'p3',txt:'Geen budgetgoedkeuring — selectie on hold',          eig:'Sarah Chen',st:'open',    dag:addD(-6), opl:''},
]

const D0 = [
  {id:'d1',pid:'p1',vr:'UAT scope — financiele module in wave 1?',ctx:'3 dagen extra maar lager risico.',     eig:'Sarah Chen',   dl:addD(2),  st:'open',    uit:''},
  {id:'d2',pid:'p1',vr:'Productie-deploymentvenster',              ctx:'Weekend window voor minimale impact.', eig:'Jan Bakker',   dl:addD(10), st:'open',    uit:''},
  {id:'d3',pid:'p1',vr:'Rollback-strategie',                       ctx:'Definieer criteria en eigenaar.',      eig:'Team IT',      dl:addD(-2), st:'open',    uit:''},
  {id:'d4',pid:'p1',vr:'Parallelle run duur',                      ctx:'Hoe lang oud en nieuw parallel?',      eig:'Sarah Chen',   dl:addD(-8), st:'besloten',uit:'3 weken goedgekeurd.'},
  {id:'d5',pid:'p3',vr:'Governance tooling leverancier',           ctx:'Keuze Leverancier A of B.',            eig:'Sarah Chen',   dl:addD(-3), st:'open',    uit:''},
  {id:'d6',pid:'p2',vr:'Authenticatie — SSO vs. standalone',       ctx:'SSO of eigen portaalauthenticatie.',   eig:'Mark de Vries',dl:addD(8),  st:'open',    uit:''},
]

const G0 = [
  {id:'g1',pid:'p1',actie:'Blokkade gemeld',   det:'Testomgeving toegang',        dag:addD(-8)},
  {id:'g2',pid:'p1',actie:'Taak afgerond',      det:'API-integratie specificatie', dag:addD(-3)},
  {id:'g3',pid:'p1',actie:'Blokkade gemeld',   det:'Legacy API ontbreekt',        dag:addD(-3)},
  {id:'g4',pid:'p1',actie:'Besluit vastgelegd', det:'Parallelle run duur',         dag:addD(-8)},
  {id:'g5',pid:'p2',actie:'Taak gestart',       det:'Requirements workshops',      dag:addD(-5)},
  {id:'g6',pid:'p3',actie:'Blokkade gemeld',   det:'Geen budgetgoedkeuring',      dag:addD(-6)},
]

/* ── Context ──────────────────────────────────────────────────────────── */
const Ctx = createContext(null)
const useApp = () => useContext(Ctx)

/* ── UI Atoms ─────────────────────────────────────────────────────────── */
function Btn({children, onClick, v='sec', sm, style:sx={}}) {
  const variants = {
    primair:{background:C.pu, color:'#fff',  border:'1px solid '+C.pu},
    sec:    {background:C.wh, color:C.pu,   border:'1px solid '+C.bm},
    gevaar: {background:C.rL, color:C.re,   border:'1px solid '+C.rB},
    succes: {background:C.gL, color:C.gr,   border:'1px solid '+C.gB},
    amber:  {background:C.aL, color:C.am,   border:'1px solid '+C.aB},
    geest:  {background:'transparent', color:C.t2, border:'1px solid transparent'},
  }
  return (
    <button onClick={onClick} style={{
      ...variants[v], borderRadius:4, fontWeight:600, cursor:'pointer',
      whiteSpace:'nowrap', lineHeight:1.4,
      fontSize:sm?11:13, padding:sm?'4px 10px':'8px 16px', ...sx
    }}>{children}</button>
  )
}

function Inp({val, set, ph, type='text', rows, style:sx={}}) {
  const s = {background:C.bg, border:'1px solid '+C.bm, borderRadius:4, color:C.t1,
    fontSize:13, padding:'8px 12px', outline:'none', width:'100%', boxSizing:'border-box', ...sx}
  return rows
    ? <textarea value={val} onChange={e=>set(e.target.value)} placeholder={ph} rows={rows} style={{...s,resize:'vertical'}}/>
    : <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={s}/>
}

function Sel({val, set, children, style:sx={}}) {
  return (
    <select value={val} onChange={e=>set(e.target.value)} style={{
      background:C.bg, border:'1px solid '+C.bm, borderRadius:4, color:C.t1,
      fontSize:13, padding:'8px 12px', outline:'none', cursor:'pointer', width:'100%', ...sx
    }}>{children}</select>
  )
}

function FR({label, children, req}) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:C.t2,marginBottom:5,textTransform:'uppercase',letterSpacing:'0.06em'}}>
        {label}{req&&<span style={{color:C.re,marginLeft:3}}>*</span>}
      </div>
      {children}
    </div>
  )
}

function Modal({title, onClose, children, w=520}) {
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:'fixed',inset:0,background:'rgba(10,4,20,0.5)',zIndex:400,
        display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{background:C.wh,borderRadius:12,width:'100%',maxWidth:w,
        maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(99,13,128,0.18)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'18px 22px',borderBottom:'1px solid '+C.bd}}>
          <span style={{fontWeight:800,fontSize:16,color:C.t1}}>{title}</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.t3,cursor:'pointer',fontSize:22,lineHeight:1}}>×</button>
        </div>
        <div style={{padding:22}}>{children}</div>
      </div>
    </div>
  )
}

function HBadge({h,sm}) {
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:5,background:hBg(h),color:hC(h),
      border:'1px solid '+hBd(h),borderRadius:20,padding:sm?'2px 8px':'4px 12px',fontSize:sm?11:12,fontWeight:700}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:hC(h)}}/>
      {hLbl(h)}
    </span>
  )
}

function FPill({fase,sm}) {
  const f = PHASES.find(p=>p.key===fase)||{kl:C.t3,bg:C.bg,rd:C.bd}
  return (
    <span style={{fontSize:sm?10:11,fontWeight:700,borderRadius:20,padding:sm?'1px 7px':'2px 9px',
      color:f.kl,background:f.bg,border:'1px solid '+f.rd,whiteSpace:'nowrap',display:'inline-block'}}>
      {fase}
    </span>
  )
}

function SPill({st}) {
  const M = {
    niet_gestart:{l:'Niet gestart',k:C.t3, bg:C.bg, r:C.bd},
    actief:      {l:'Actief',       k:C.pu, bg:C.puL,r:C.bd},
    geblokkeerd: {l:'Geblokkeerd',  k:C.re, bg:C.rL, r:C.rB},
    afgerond:    {l:'Afgerond',     k:C.gr, bg:C.gL, r:C.gB},
  }
  const s = M[st]||M.niet_gestart
  return (
    <span style={{fontSize:11,fontWeight:700,borderRadius:20,padding:'2px 9px',
      color:s.k,background:s.bg,border:'1px solid '+s.r,whiteSpace:'nowrap'}}>{s.l}</span>
  )
}

function Empty({text}) {
  return (
    <div style={{padding:'10px 0',color:C.t3,fontSize:13,display:'flex',alignItems:'center',gap:8}}>
      <span style={{color:C.gr}}>✓</span>{text}
    </div>
  )
}

/* ── Board ────────────────────────────────────────────────────────────── */
function ProjCard({proj}) {
  const {setActive,setView,tasks,bls,decs} = useApp()
  const ob = bls.filter(b=>b.pid===proj.id&&b.st==='open').length
  const vl = tasks.filter(t=>t.pid===proj.id&&isLate(t)).length
  const op = decs.filter(d=>d.pid===proj.id&&d.st==='open').length
  const nm = tasks.filter(t=>t.pid===proj.id&&t.mp&&t.eind>=TODAY)
    .sort((a,b)=>a.eind.localeCompare(b.eind))[0]
  return (
    <div draggable
      onDragStart={e=>{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',proj.id)}}
      onClick={()=>{setActive(proj.id);setView('cockpit')}}
      style={{background:C.wh,border:'1px solid '+C.bd,borderTop:'3px solid '+hC(proj.h),
        borderRadius:8,padding:'12px 14px',cursor:'pointer',userSelect:'none',marginBottom:8,
        boxShadow:'0 1px 3px rgba(99,13,128,0.06)',transition:'box-shadow 0.15s'}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 14px rgba(99,13,128,0.14)'}
      onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 3px rgba(99,13,128,0.06)'}
    >
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:6}}>
        <div style={{fontSize:13,fontWeight:700,color:C.t1,lineHeight:1.3,flex:1}}>{proj.naam}</div>
        <HBadge h={proj.h} sm/>
      </div>
      <div style={{fontSize:11,color:C.t3,marginBottom:8}}>{proj.eig}</div>
      {nm&&<div style={{background:C.bg,borderRadius:5,padding:'5px 8px',marginBottom:8,display:'flex',justifyContent:'space-between'}}>
        <span style={{fontSize:11,color:C.t2}}>◆ {nm.naam}</span>
        <span style={{fontSize:10,fontWeight:700,color:dFrom(nm.eind)<=7?C.am:C.t3}}>{dFrom(nm.eind)}d</span>
      </div>}
      <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
        {ob>0&&<span style={{fontSize:10,fontWeight:700,borderRadius:20,padding:'1px 7px',color:C.re,background:C.rL,border:'1px solid '+C.rB}}>{ob} blokkade{ob>1?'s':''}</span>}
        {vl>0&&<span style={{fontSize:10,fontWeight:700,borderRadius:20,padding:'1px 7px',color:C.am,background:C.aL,border:'1px solid '+C.aB}}>{vl} verlaat</span>}
        {op>0&&<span style={{fontSize:10,fontWeight:700,borderRadius:20,padding:'1px 7px',color:C.pu,background:C.puL,border:'1px solid '+C.bd}}>{op} besluit{op>1?'en':''}</span>}
        {ob===0&&vl===0&&op===0&&<span style={{fontSize:10,fontWeight:700,borderRadius:20,padding:'1px 7px',color:C.gr,background:C.gL,border:'1px solid '+C.gB}}>Op schema</span>}
      </div>
    </div>
  )
}

function PhaseCol({fase,projs,over,onOver,onLeave,onDrop}) {
  return (
    <div onDragOver={e=>{e.preventDefault();onOver()}} onDragLeave={onLeave}
      onDrop={e=>{e.preventDefault();onDrop(e.dataTransfer.getData('text/plain'),fase.key)}}
      style={{flexShrink:0,width:224,background:over?fase.bg:C.bg,
        border:'2px solid '+(over?fase.kl:C.bd),borderRadius:12,
        display:'flex',flexDirection:'column',transition:'all 0.12s',minHeight:440}}>
      <div style={{padding:'12px 14px 10px',borderBottom:'1px solid '+C.bd,background:fase.bg,borderRadius:'10px 10px 0 0'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:7}}>
            <span style={{width:9,height:9,borderRadius:'50%',background:fase.kl,display:'inline-block'}}/>
            <span style={{fontSize:12,fontWeight:800,color:fase.kl}}>{fase.key}</span>
          </div>
          <span style={{fontSize:10,fontWeight:800,borderRadius:20,padding:'1px 7px',background:fase.kl,color:'#fff'}}>{projs.length}</span>
        </div>
      </div>
      <div style={{padding:10,flex:1}}>
        {projs.length===0
          ? <div style={{border:'2px dashed '+(over?fase.kl:C.bd),borderRadius:4,padding:'18px 10px',
              textAlign:'center',color:over?fase.kl:C.t3,fontSize:12}}>
              {over?'Hier loslaten':'Geen projecten'}
            </div>
          : projs.map(p=><ProjCard key={p.id} proj={p}/>)
        }
      </div>
    </div>
  )
}

function Board() {
  const {projs,setFase} = useApp()
  const [over,setOver] = useState(null)
  const pf = useMemo(()=>{
    const m={}; PHASES.forEach(f=>{m[f.key]=[]})
    projs.forEach(p=>{(m[p.fase]||m['Ideeën']).push(p)})
    return m
  },[projs])
  return (
    <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:16}}>
      {PHASES.map(f=>(
        <PhaseCol key={f.key} fase={f} projs={pf[f.key]||[]} over={over===f.key}
          onOver={()=>setOver(f.key)} onLeave={()=>setOver(null)}
          onDrop={(id,fk)=>{setOver(null);const p=projs.find(x=>x.id===id);if(p&&p.fase!==fk)setFase(id,fk)}}
        />
      ))}
    </div>
  )
}

/* ── Cockpit header ───────────────────────────────────────────────────── */
function CHdr({proj,ob,od,vl,tab,setTab}) {
  const TABS=[
    {id:'overzicht',l:'Overzicht'},
    {id:'taken',    l:'Taken & Planning'},
    {id:'tijdlijn', l:'Tijdlijn'},
    {id:'blokkades',l:'Blokkades',  badge:ob},
    {id:'besluiten',l:'Besluiten',  badge:od},
    {id:'historie', l:'Historie'},
  ]
  return (
    <div style={{background:C.wh,borderBottom:'1px solid '+C.bd,flexShrink:0}}>
      <div style={{background:'linear-gradient(135deg,'+C.pu+' 0%,'+C.puD+' 100%)',padding:'18px 28px',color:'#fff'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:4}}>PROJECT COCKPIT</div>
            <div style={{fontSize:22,fontWeight:800,letterSpacing:'-0.02em',marginBottom:4}}>{proj.naam}</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.75)',display:'flex',gap:16}}>
              <span>Eigenaar: {proj.eig}</span><span>Bijgewerkt: {rel(proj.bij)}</span>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
            <HBadge h={proj.h}/><FPill fase={proj.fase}/>
          </div>
        </div>
        <div style={{display:'flex',gap:16,marginTop:12,flexWrap:'wrap'}}>
          {ob>0&&<span style={{fontSize:12,color:'#FCA5A5',fontWeight:700}}>{ob} blokkade{ob>1?'s':''} open</span>}
          {vl>0&&<span style={{fontSize:12,color:'#FCD34D',fontWeight:700}}>{vl} verlate taken</span>}
          {od>0&&<span style={{fontSize:12,color:'#C4B5FD',fontWeight:700}}>{od} open besluit{od>1?'en':''}</span>}
          {ob===0&&vl===0&&od===0&&<span style={{fontSize:12,color:'#86EFAC',fontWeight:700}}>Alles op schema</span>}
        </div>
      </div>
      <div style={{display:'flex',padding:'0 28px',overflowX:'auto'}}>
        {TABS.map(t=>{
          const a=tab===t.id
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:'12px 16px',border:'none',background:'transparent',cursor:'pointer',
              fontSize:13,fontWeight:a?700:400,color:a?C.pu:C.t2,
              borderBottom:'2px solid '+(a?C.pu:'transparent'),
              display:'flex',alignItems:'center',gap:5,whiteSpace:'nowrap'
            }}>
              {t.l}
              {t.badge>0&&<span style={{fontSize:10,fontWeight:800,background:C.re,color:'#fff',borderRadius:10,padding:'0 5px',minWidth:16,textAlign:'center'}}>{t.badge}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Overzicht ────────────────────────────────────────────────────────── */
function Overzicht({pid}) {
  const {projs,tasks,bls,decs,setProj} = useApp()
  const p = projs.find(x=>x.id===pid)
  const [editOpen,setEditOpen] = useState(false)
  const [form,setForm] = useState({})
  if(!p) return null

  const ob = bls.filter(b=>b.pid===pid&&b.st==='open')
  const vl = tasks.filter(t=>t.pid===pid&&isLate(t))
  const dw = tasks.filter(t=>t.pid===pid&&t.s!=='afgerond'&&dFrom(t.eind)>=0&&dFrom(t.eind)<=7)
  const od = decs.filter(d=>d.pid===pid&&d.st==='open')
  const nm = tasks.filter(t=>t.pid===pid&&t.mp&&t.eind>=TODAY).sort((a,b)=>a.eind.localeCompare(b.eind))[0]

  return (
    <div style={{padding:28,maxWidth:900}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[{w:vl.length,l:'Verlate taken',k:vl.length>0?C.re:C.t3},
          {w:dw.length,l:'Deze week',k:C.pu},
          {w:ob.length,l:'Open blokkades',k:ob.length>0?C.re:C.t3},
          {w:od.length,l:'Open besluiten',k:od.length>0?C.am:C.t3}
        ].map(kpi=>(
          <div key={kpi.l} style={{background:C.wh,border:'1px solid '+C.bd,borderRadius:8,padding:'18px 14px',textAlign:'center'}}>
            <div style={{fontSize:30,fontWeight:800,color:kpi.k,letterSpacing:'-0.02em'}}>{kpi.w}</div>
            <div style={{fontSize:11,color:C.t3,marginTop:4,textTransform:'uppercase',letterSpacing:'0.05em'}}>{kpi.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div style={{background:C.wh,border:'1px solid '+C.bd,borderRadius:12,padding:'16px 18px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <span style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:C.t3}}>Projectgegevens</span>
            <Btn v="sec" sm onClick={()=>{setForm({...p});setEditOpen(true)}}>Bewerken</Btn>
          </div>
          {[['Eigenaar',p.eig],['Fase',p.fase],['Gezondheid',hLbl(p.h)],['Type',p.type],["Thema's",p.themas]].map(([k,v])=>(
            <div key={k} style={{display:'flex',gap:12,marginBottom:8}}>
              <span style={{fontSize:12,color:C.t3,width:90,flexShrink:0}}>{k}</span>
              <span style={{fontSize:12,color:C.t1,fontWeight:500}}>{v||'—'}</span>
            </div>
          ))}
        </div>
        <div style={{background:C.wh,border:'1px solid '+C.bd,borderRadius:12,padding:'16px 18px'}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:C.t3,marginBottom:10}}>Omschrijving</div>
          <p style={{fontSize:13,color:C.t2,lineHeight:1.6}}>{p.omschr||'Geen omschrijving.'}</p>
        </div>
        <div style={{background:C.wh,border:'1px solid '+C.bd,borderRadius:12,padding:'16px 18px'}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:C.t3,marginBottom:10}}>Planning Puls</div>
          {nm&&<div style={{display:'flex',justifyContent:'space-between',padding:'8px 10px',background:C.bg,borderRadius:4,marginBottom:10}}>
            <span style={{fontSize:12,fontWeight:600}}>◆ {nm.naam}</span>
            <span style={{fontSize:11,fontWeight:700,color:dFrom(nm.eind)<=7?C.am:C.pu}}>{fmt(nm.eind)} — {dFrom(nm.eind)}d</span>
          </div>}
          {vl.slice(0,3).map(t=>(
            <div key={t.id} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid '+C.bd}}>
              <span style={{fontSize:12}}>{t.naam}</span>
              <span style={{fontSize:11,color:C.re,fontWeight:700}}>{Math.abs(dFrom(t.eind))}d te laat</span>
            </div>
          ))}
          {vl.length===0&&<Empty text="Geen verlate taken"/>}
        </div>
        <div style={{background:C.wh,border:'1px solid '+C.bd,borderRadius:12,padding:'16px 18px'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
            <span style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:ob.length>0?C.re:C.t3}}>Open Blokkades</span>
            {ob.length>0&&<span style={{fontSize:10,fontWeight:700,background:C.re,color:'#fff',borderRadius:10,padding:'0 6px'}}>{ob.length}</span>}
          </div>
          {ob.length===0?<Empty text="Geen open blokkades"/>:ob.slice(0,3).map(b=>{
            const l=bAge(b.dag),lk=ageC(l)
            return (
              <div key={b.id} style={{padding:'8px 10px',borderRadius:4,background:l>=8?C.rL:C.aL,marginBottom:6,borderLeft:'3px solid '+lk}}>
                <div style={{fontSize:12,marginBottom:2}}>{b.txt}</div>
                <div style={{fontSize:11,color:lk,fontWeight:700}}>{l}d open{b.eig?' — '+b.eig:''}</div>
              </div>
            )
          })}
        </div>
      </div>

      {editOpen&&(
        <Modal title="Project bewerken" onClose={()=>setEditOpen(false)}>
          <FR label="Naam" req><Inp val={form.naam||''} set={v=>setForm(f=>({...f,naam:v}))}/></FR>
          <FR label="Omschrijving"><Inp val={form.omschr||''} set={v=>setForm(f=>({...f,omschr:v}))} rows={3}/></FR>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <FR label="Eigenaar"><Inp val={form.eig||''} set={v=>setForm(f=>({...f,eig:v}))}/></FR>
            <FR label="Fase"><Sel val={form.fase||''} set={v=>setForm(f=>({...f,fase:v}))}>{PHASES.map(f=><option key={f.key} value={f.key}>{f.key}</option>)}</Sel></FR>
            <FR label="Gezondheid"><Sel val={form.h||'groen'} set={v=>setForm(f=>({...f,h:v}))}><option value="groen">Op schema</option><option value="oranje">Aandacht</option><option value="rood">Kritiek</option></Sel></FR>
            <FR label="Type"><Inp val={form.type||''} set={v=>setForm(f=>({...f,type:v}))}/></FR>
          </div>
          <FR label="Thema's"><Inp val={form.themas||''} set={v=>setForm(f=>({...f,themas:v}))}/></FR>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:4}}>
            <Btn v="geest" onClick={()=>setEditOpen(false)}>Annuleren</Btn>
            <Btn v="primair" onClick={()=>{setProj(pid,form);setEditOpen(false)}}>Opslaan</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ── Taken & Planning ─────────────────────────────────────────────────── */
function AddRij({defaultEind, onAdd}) {
  const [open,setOpen] = useState(false)
  const [naam,setNaam] = useState('')
  const [eig,setEig]   = useState('')
  const [eind,setEind] = useState('')
  const [mp,setMp]     = useState(false)
  const ref = useRef(null)

  function commit() {
    if(!naam.trim()) return
    onAdd({naam, eig, start:eind||defaultEind||TODAY, eind:eind||defaultEind||TODAY, s:'niet_gestart', mp})
    setNaam(''); setEig(''); setEind(''); setMp(false)
    setTimeout(()=>ref.current&&ref.current.focus(), 10)
  }

  if(!open) return (
    <button onClick={()=>{setOpen(true);setTimeout(()=>ref.current&&ref.current.focus(),30)}}
      style={{width:'100%',marginTop:4,padding:'7px 10px',border:'1px dashed '+C.bm,borderRadius:5,
        background:'transparent',color:C.t3,fontSize:12,cursor:'pointer',textAlign:'left',
        display:'flex',alignItems:'center',gap:6}}>
      + Taak toevoegen...
    </button>
  )

  return (
    <div style={{marginTop:4,border:'2px solid '+C.pu,borderRadius:6,background:C.wh,overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'9px 12px'}}>
        <button onClick={()=>setMp(v=>!v)} style={{
          width:20,height:20,borderRadius:4,border:'1px solid '+(mp?C.pu:C.bm),
          background:mp?C.pu:'transparent',color:mp?'#fff':C.t3,cursor:'pointer',
          fontSize:11,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontWeight:700
        }}>◆</button>
        <input ref={ref} value={naam} onChange={e=>setNaam(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&naam.trim())commit();if(e.key==='Escape'){setOpen(false);setNaam('')}}}
          placeholder={mp?'Naam van de mijlpaal...':'Naam van de taak...'}
          style={{flex:1,border:'none',outline:'none',fontSize:13,color:C.t1,background:'transparent'}}/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:C.bg,borderTop:'1px solid '+C.bd,flexWrap:'wrap'}}>
        <input value={eig} onChange={e=>setEig(e.target.value)} placeholder="Eigenaar (optioneel)"
          style={{flex:1,minWidth:130,border:'1px solid '+C.bm,borderRadius:4,padding:'5px 8px',fontSize:12,color:C.t1,outline:'none',background:C.wh}}/>
        <input type="date" value={eind} onChange={e=>setEind(e.target.value)}
          style={{border:'1px solid '+C.bm,borderRadius:4,padding:'5px 8px',fontSize:12,color:C.t1,outline:'none',background:C.wh}}/>
        <div style={{marginLeft:'auto',display:'flex',gap:6}}>
          <Btn sm v="geest" onClick={()=>{setOpen(false);setNaam('')}}>Annuleren</Btn>
          <Btn sm v="primair" onClick={commit}>Toevoegen</Btn>
        </div>
      </div>
      <div style={{padding:'3px 12px 7px',background:C.bg,fontSize:10,color:C.t3}}>Enter om op te slaan · Escape om te sluiten · ◆ voor mijlpaal</div>
    </div>
  )
}

function TaakRij({t, onUpd, onShift, onEdit}) {
  const vl = isLate(t), done = t.s==='afgerond'
  const streak = t.mp?C.pu:done?C.gr:vl?C.re:t.s==='actief'?C.pu:t.s==='geblokkeerd'?C.re:C.bm
  return (
    <div style={{display:'flex',alignItems:'stretch',borderRadius:5,marginBottom:3,
      background:done?'#FAFAFA':C.wh,border:'1px solid '+(vl&&!done?C.rB:C.bd),overflow:'hidden'}}>
      <div style={{width:3,flexShrink:0,background:streak}}/>
      <div style={{flex:1,display:'flex',alignItems:'center',gap:8,padding:'9px 11px',minWidth:0}}>
        {t.mp
          ? <span style={{color:C.pu,fontSize:12,flexShrink:0}}>◆</span>
          : <button onClick={()=>onUpd(t.id,{s:done?'niet_gestart':'afgerond'})}
              style={{width:17,height:17,borderRadius:'50%',border:'2px solid '+(done?C.gr:C.bm),
                background:done?C.gr:'transparent',cursor:'pointer',flexShrink:0,
                display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>
              {done&&<span style={{color:'#fff',fontSize:9}}>✓</span>}
            </button>
        }
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:t.mp?700:500,color:done?C.t3:C.t1,
            textDecoration:done?'line-through':'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {t.naam}
            {isRisk(t)&&!done&&<span style={{marginLeft:7,fontSize:10,color:C.am,fontWeight:700,
              background:C.aL,borderRadius:3,padding:'1px 5px'}}>risico</span>}
          </div>
          <div style={{fontSize:11,color:C.t3,marginTop:2,display:'flex',gap:8}}>
            {t.eig&&<span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:120}}>{t.eig}</span>}
            <span style={{color:vl&&!done?C.re:C.t3,whiteSpace:'nowrap'}}>
              {t.mp?fmt(t.eind):fmt(t.start)+' → '+fmt(t.eind)}
              {vl&&!done&&<strong style={{marginLeft:5,color:C.re}}> {Math.abs(dFrom(t.eind))}d te laat</strong>}
            </span>
          </div>
        </div>
        <SPill st={t.s}/>
        <div style={{display:'flex',gap:2,flexShrink:0,marginLeft:4}}>
          {!done&&!t.mp&&t.s==='niet_gestart'&&
            <button onClick={()=>onUpd(t.id,{s:'actief'})}
              style={{background:C.puL,border:'none',borderRadius:4,padding:'3px 7px',cursor:'pointer',fontSize:11,color:C.pu,fontWeight:700}}>
              Start
            </button>}
          {!done&&<button onClick={()=>onShift(t)}
            style={{background:'none',border:'1px solid '+C.bd,borderRadius:4,padding:'3px 7px',cursor:'pointer',fontSize:11,color:C.t3}}>
            Uitst.
          </button>}
          <button onClick={()=>onEdit({...t})}
            style={{background:'none',border:'1px solid '+C.bd,borderRadius:4,padding:'3px 7px',cursor:'pointer',fontSize:11,color:C.t3}}>
            Bew.
          </button>
        </div>
      </div>
    </div>
  )
}

function Taken({pid}) {
  const {tasks,updTask,addTask} = useApp()
  const pt = tasks.filter(t=>t.pid===pid)
  const [ef,setEf]       = useState('alle')
  const [zoek,setZoek]   = useState('')
  const [showK,setShowK] = useState(false)
  const [editT,setEditT] = useState(null)
  const [shT,setShT]     = useState(null)
  const [shW,setShW]     = useState(1)

  const eigs = useMemo(()=>[...new Set(pt.filter(t=>t.eig).map(t=>t.eig))]	,[pt])
  const gef  = pt.filter(t=>(ef==='alle'||t.eig===ef)&&(!zoek||t.naam.toLowerCase().includes(zoek.toLowerCase())))

  const bands = useMemo(()=>({
    verlaat:  gef.filter(t=>t.s!=='afgerond'&&isLate(t)).sort((a,b)=>a.eind.localeCompare(b.eind)),
    dezeweek: gef.filter(t=>{if(t.s==='afgerond'||isLate(t))return false;const n=dFrom(t.eind);return n>=0&&n<=7}).sort((a,b)=>a.eind.localeCompare(b.eind)),
    volgend:  gef.filter(t=>{if(t.s==='afgerond'||isLate(t))return false;const n=dFrom(t.eind);return n>7&&n<=21}).sort((a,b)=>a.eind.localeCompare(b.eind)),
    later:    gef.filter(t=>{if(t.s==='afgerond'||isLate(t))return false;return dFrom(t.eind)>21}).sort((a,b)=>a.eind.localeCompare(b.eind)),
    klaar:    gef.filter(t=>t.s==='afgerond').sort((a,b)=>b.eind.localeCompare(a.eind)),
  }),[gef])

  const aT  = pt.filter(t=>!t.mp).length
  const aK  = pt.filter(t=>!t.mp&&t.s==='afgerond').length
  const pct = aT>0?Math.round(aK/aT*100):0

  const BANDS = [
    {sl:'verlaat', label:'Verlaat',         kl:bands.verlaat.length>0?C.re:C.t3, de:TODAY,        first:true},
    {sl:'dezeweek',label:'Deze week',        kl:C.pu,                             de:shD(TODAY,5)       },
    {sl:'volgend', label:'Volgende 2 weken', kl:C.t2,                             de:shD(TODAY,14)      },
    {sl:'later',   label:'Later',            kl:C.t2,                             de:shD(TODAY,30)      },
  ]

  return (
    <div style={{display:'flex',height:'100%'}}>
      {/* Lijst */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Werkbalk */}
        <div style={{padding:'12px 20px',borderBottom:'1px solid '+C.bd,background:C.wh,
          display:'flex',alignItems:'center',gap:10,flexShrink:0,flexWrap:'wrap'}}>
          <svg width={34} height={34} viewBox="0 0 34 34" style={{flexShrink:0}}>
            <circle cx={17} cy={17} r={13} fill="none" stroke={C.bd} strokeWidth={4}/>
            <circle cx={17} cy={17} r={13} fill="none" stroke={pct===100?C.gr:C.pu} strokeWidth={4}
              strokeDasharray={`${2*Math.PI*13*pct/100} ${2*Math.PI*13}`}
              strokeLinecap="round" transform="rotate(-90 17 17)"/>
            <text x={17} y={21} textAnchor="middle" fontSize={8} fontWeight={800} fill={C.t1}>{pct}%</text>
          </svg>
          <span style={{fontSize:12,color:C.t2}}><strong style={{color:C.t1}}>{aK}</strong> / {aT} klaar</span>
          <div style={{width:1,height:24,background:C.bd,margin:'0 4px'}}/>
          <input value={zoek} onChange={e=>setZoek(e.target.value)} placeholder="Zoeken..."
            style={{flex:1,minWidth:120,background:C.bg,border:'1px solid '+C.bm,borderRadius:5,
              color:C.t1,fontSize:12,padding:'6px 10px',outline:'none',boxSizing:'border-box'}}/>
          <Sel val={ef} set={setEf} style={{width:150,fontSize:12,padding:'6px 10px'}}>
            <option value="alle">Alle eigenaren</option>
            {eigs.map(e=><option key={e} value={e}>{e}</option>)}
          </Sel>
        </div>
        {/* Bands */}
        <div style={{flex:1,overflowY:'auto',padding:'8px 20px 20px'}}>
          {BANDS.map(b=>(
            <div key={b.sl}>
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 0 5px',
                borderTop:b.first?'none':'2px solid '+C.bd,marginTop:b.first?0:16}}>
                <div style={{width:7,height:7,borderRadius:'50%',background:b.kl,flexShrink:0}}/>
                <span style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.08em',color:b.kl}}>{b.label}</span>
                <span style={{fontSize:11,color:C.t3}}>{bands[b.sl].length} taken</span>
              </div>
              {bands[b.sl].length===0&&b.sl!=='verlaat'
                ? <div style={{fontSize:12,color:C.t3,padding:'2px 0 2px 16px',fontStyle:'italic'}}>Geen taken</div>
                : bands[b.sl].map(t=><TaakRij key={t.id} t={t} onUpd={updTask} onShift={setShT} onEdit={setEditT}/>)
              }
              <AddRij defaultEind={b.de} onAdd={taak=>addTask({...taak,pid})}/>
            </div>
          ))}
          <div style={{borderTop:'1px solid '+C.bd,marginTop:18,paddingTop:8}}>
            <button onClick={()=>setShowK(v=>!v)}
              style={{display:'flex',alignItems:'center',gap:6,fontSize:11,fontWeight:700,
                color:C.t3,background:'none',border:'none',cursor:'pointer'}}>
              Afgerond ({bands.klaar.length}) {showK?'▲':'▼'}
            </button>
            {showK&&<div style={{marginTop:6}}>{bands.klaar.map(t=><TaakRij key={t.id} t={t} onUpd={updTask} onShift={setShT} onEdit={setEditT}/>)}</div>}
          </div>
        </div>
      </div>

      {/* Zijpaneel */}
      <div style={{width:196,flexShrink:0,borderLeft:'1px solid '+C.bd,background:C.bg,
        padding:16,overflowY:'auto',display:'flex',flexDirection:'column',gap:20}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:C.t3,marginBottom:8}}>Status</div>
          {[
            {label:'Verlaat',   n:bands.verlaat.length,                              kl:C.re,bg:C.rL},
            {label:'Actief',    n:pt.filter(t=>t.s==='actief'&&!isLate(t)).length,   kl:C.pu,bg:C.puL},
            {label:'Deze week', n:bands.dezeweek.length,                             kl:C.pu,bg:C.puL},
            {label:'Later',     n:bands.volgend.length+bands.later.length,           kl:C.t3,bg:C.bg},
            {label:'Afgerond',  n:aK,                                                kl:C.gr,bg:C.gL},
          ].filter(r=>r.n>0).map(r=>(
            <div key={r.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 0',borderBottom:'1px solid '+C.bd}}>
              <span style={{fontSize:11,color:C.t2}}>{r.label}</span>
              <span style={{fontSize:11,fontWeight:700,color:r.kl,background:r.bg,borderRadius:20,padding:'1px 7px',minWidth:22,textAlign:'center'}}>{r.n}</span>
            </div>
          ))}
        </div>
        {eigs.length>0&&(
          <div>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:C.t3,marginBottom:8}}>Per eigenaar</div>
            {eigs.map(e=>{
              const tot=pt.filter(t=>t.eig===e&&!t.mp)
              const kl=tot.filter(t=>t.s==='afgerond').length
              const la=tot.filter(t=>isLate(t)).length
              const pc=tot.length>0?Math.round(kl/tot.length*100):0
              return (
                <div key={e} style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:11,color:C.t1,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:110}}>{e}</span>
                    {la>0&&<span style={{fontSize:10,color:C.re,fontWeight:700}}>{la} laat</span>}
                  </div>
                  <div style={{height:4,background:C.bd,borderRadius:2,overflow:'hidden'}}>
                    <div style={{height:'100%',width:pc+'%',background:la>0?C.re:C.pu,borderRadius:2}}/>
                  </div>
                  <div style={{fontSize:10,color:C.t3,marginTop:2}}>{kl}/{tot.length} afgerond</div>
                </div>
              )
            })}
          </div>
        )}
        {pt.filter(t=>t.mp&&t.s!=='afgerond').length>0&&(
          <div>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:C.t3,marginBottom:8}}>Mijlpalen</div>
            {pt.filter(t=>t.mp&&t.s!=='afgerond').sort((a,b)=>a.eind.localeCompare(b.eind)).slice(0,5).map(t=>{
              const d=dFrom(t.eind),la=d<0
              return (
                <div key={t.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 0',borderBottom:'1px solid '+C.bd}}>
                  <span style={{fontSize:11,color:C.t1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:110}}>◆ {t.naam}</span>
                  <span style={{fontSize:10,fontWeight:700,color:la?C.re:d<=7?C.am:C.t3,whiteSpace:'nowrap',marginLeft:4}}>{la?Math.abs(d)+'d laat':d+'d'}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal: uitstellen */}
      {shT&&(
        <Modal title="Taak uitstellen" onClose={()=>setShT(null)} w={360}>
          <div style={{padding:'10px 14px',background:C.bg,borderRadius:6,marginBottom:16,fontSize:13,color:C.t2,borderLeft:'3px solid '+C.pu}}>{shT.naam}</div>
          <FR label="Uitstellen met">
            <Sel val={shW} set={v=>setShW(Number(v))}>
              {[1,2,3,4].map(w=><option key={w} value={w}>{w+' week'+(w>1?'en':'')}</option>)}
            </Sel>
          </FR>
          <div style={{background:C.gL,borderRadius:6,padding:'10px 14px',marginBottom:16,border:'1px solid '+C.gB}}>
            <div style={{fontSize:11,color:C.gr,marginBottom:2}}>Nieuwe einddatum</div>
            <div style={{fontSize:14,fontWeight:700,color:C.t1}}>{fmt(shD(shT.eind,shW*7))}</div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <Btn v="geest" onClick={()=>setShT(null)}>Annuleren</Btn>
            <Btn v="primair" onClick={()=>{updTask(shT.id,{start:shD(shT.start,shW*7),eind:shD(shT.eind,shW*7)});setShT(null);setShW(1)}}>Uitstellen</Btn>
          </div>
        </Modal>
      )}
      {/* Modal: bewerken */}
      {editT&&(
        <Modal title="Taak bewerken" onClose={()=>setEditT(null)}>
          <FR label="Naam"><Inp val={editT.naam} set={v=>setEditT(p=>({...p,naam:v}))}/></FR>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <FR label="Eigenaar"><Inp val={editT.eig||''} set={v=>setEditT(p=>({...p,eig:v}))}/></FR>
            <FR label="Status">
              <Sel val={editT.s} set={v=>setEditT(p=>({...p,s:v}))}>
                <option value="niet_gestart">Niet gestart</option>
                <option value="actief">Actief</option>
                <option value="geblokkeerd">Geblokkeerd</option>
                <option value="afgerond">Afgerond</option>
              </Sel>
            </FR>
            <FR label="Startdatum"><Inp type="date" val={editT.start||''} set={v=>setEditT(p=>({...p,start:v}))}/></FR>
            <FR label="Einddatum"><Inp type="date" val={editT.eind||''} set={v=>setEditT(p=>({...p,eind:v}))}/></FR>
          </div>
          <FR label="Type">
            <Sel val={editT.mp?'mijlpaal':'taak'} set={v=>setEditT(p=>({...p,mp:v==='mijlpaal'}))}>
              <option value="taak">Taak</option><option value="mijlpaal">Mijlpaal</option>
            </Sel>
          </FR>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <Btn v="geest" onClick={()=>setEditT(null)}>Annuleren</Btn>
            <Btn v="primair" onClick={()=>{updTask(editT.id,editT);setEditT(null)}}>Opslaan</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ── Tijdlijn (Gantt) ─────────────────────────────────────────────────── */
const LW=162, DW=22, RA=38, KH=32

function Tijdlijn({pid}) {
  const {tasks,updTask} = useApp()
  const pt = [...tasks.filter(t=>t.pid===pid)].sort((a,b)=>{
    if(a.mp&&!b.mp)return -1; if(!a.mp&&b.mp)return 1
    return(a.start||'').localeCompare(b.start||'')
  })
  const [ven,setVen] = useState(70)
  const [off,setOff] = useState(-7)
  const [slp,setSlp] = useState(null)
  const nul = useMemo(()=>shD(TODAY,off),[off])
  const W = LW+ven*DW, H = KH+pt.length*RA+16
  const d2x = useCallback(ds=>LW+diff(nul,ds)*DW,[nul])

  const dH = useMemo(()=>{
    const a=[]
    for(let i=0;i<ven;i++){
      const dt=new Date(nul+'T00:00:00'); dt.setDate(dt.getDate()+i)
      const ds=dt.toISOString().slice(0,10)
      a.push({ds,x:LW+i*DW,dag:dt.getDate(),mnd:dt.getMonth(),we:dt.getDay()===0||dt.getDay()===6,vd:ds===TODAY})
    }
    return a
  },[nul,ven])

  const mns = useMemo(()=>{
    const a=[]; let cur=null
    dH.forEach(d=>{
      if(!cur||d.mnd!==cur.mnd){
        cur={mnd:d.mnd,x:d.x,lbl:new Date(d.ds+'T00:00:00').toLocaleDateString('nl-NL',{month:'long',year:'2-digit'})}
        a.push(cur)
      }
      cur.w=(d.x+DW)-cur.x
    })
    return a
  },[dH])

  const tK = (t,act) => {
    if(t.mp) return C.pu
    if(t.s==='afgerond') return C.gr
    if(t.eind<TODAY||t.s==='geblokkeerd') return C.re
    return act?C.puD:C.pu
  }

  const onMD = useCallback((e,t)=>{e.stopPropagation();setSlp({id:t.id,x0:e.clientX,s0:t.start,e0:t.eind,delta:0})},[])
  const onMM = useCallback(e=>{if(!slp)return;setSlp(p=>({...p,delta:Math.round((e.clientX-p.x0)/DW)}))},[slp])
  const onMU = useCallback(()=>{
    if(!slp)return
    if(slp.delta!==0) updTask(slp.id,{start:shD(slp.s0,slp.delta),eind:shD(slp.e0,slp.delta)})
    setSlp(null)
  },[slp,updTask])

  const vX = d2x(TODAY)+DW/2
  const btnS = {padding:'6px 11px',borderRadius:4,background:C.wh,border:'1px solid '+C.bd,fontSize:12,color:C.t2,cursor:'pointer'}

  return (
    <div style={{padding:'20px 24px'}}>
      <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{display:'flex',gap:4}}>
          <button style={btnS} onClick={()=>setOff(v=>v-7)}>‹ Vorige week</button>
          <button style={{...btnS,background:C.pu,color:'#fff',border:'none'}} onClick={()=>setOff(-7)}>Vandaag</button>
          <button style={btnS} onClick={()=>setOff(v=>v+7)}>Volgende week ›</button>
        </div>
        <div style={{display:'flex',gap:4,marginLeft:'auto'}}>
          <button style={btnS} onClick={()=>setVen(v=>Math.max(28,v-14))}>Inzoomen</button>
          <button style={btnS} onClick={()=>setVen(v=>Math.min(112,v+14))}>Uitzoomen</button>
        </div>
      </div>
      <div style={{display:'flex',gap:14,marginBottom:12,flexWrap:'wrap'}}>
        {[{k:C.pu,l:'Gepland'},{k:C.gr,l:'Afgerond'},{k:C.re,l:'Verlaat'},{k:'#EDEBF7',l:'Weekend',r:C.bd}].map(l=>(
          <span key={l.l} style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{width:14,height:9,borderRadius:3,background:l.k,border:l.r?'1px solid '+l.r:undefined,display:'inline-block'}}/>
            <span style={{fontSize:11,color:C.t3}}>{l.l}</span>
          </span>
        ))}
        <span style={{fontSize:11,color:C.t3,marginLeft:'auto'}}>Sleep balkjes om te herschikken</span>
      </div>
      <div style={{overflowX:'auto',overflowY:'auto',maxHeight:'calc(100vh - 280px)',border:'1px solid '+C.bd,borderRadius:10,background:C.wh}}>
        <svg width={W} height={H} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
          style={{display:'block',cursor:slp?'grabbing':'default',userSelect:'none'}}>
          {dH.filter(d=>d.we).map(d=><rect key={d.ds} x={d.x} y={0} width={DW} height={H} fill="#F8F7FC"/>)}
          {pt.map((_,i)=><line key={i} x1={LW} y1={KH+i*RA+RA} x2={W} y2={KH+i*RA+RA} stroke={C.bd} strokeWidth={0.5}/>)}
          {vX>=LW&&vX<=W&&<>
            <line x1={vX} y1={0} x2={vX} y2={H} stroke={C.pu} strokeWidth={1.5} strokeDasharray="3 3" opacity={0.5}/>
            <rect x={vX-18} y={KH-18} width={36} height={16} rx={3} fill={C.pu}/>
            <text x={vX} y={KH-6} textAnchor="middle" fontSize={8} fill="#fff" fontWeight={800}>VANDAAG</text>
          </>}
          <rect x={LW} y={0} width={W-LW} height={13} fill={C.bg}/>
          {mns.map(mg=><text key={mg.lbl+mg.x} x={mg.x+4} y={10} fontSize={8} fill={C.t3} fontWeight={700}>{mg.lbl.toUpperCase()}</text>)}
          {dH.map(d=><g key={d.ds}>
            {d.vd&&<rect x={d.x} y={13} width={DW} height={19} fill={C.pu} rx={2}/>}
            <text x={d.x+DW/2} y={25} textAnchor="middle" fontSize={9}
              fill={d.vd?'#fff':d.we?C.t3:C.t2} fontWeight={d.vd?800:400}>{d.dag}</text>
          </g>)}
          <line x1={LW} y1={0} x2={LW} y2={H} stroke={C.bd} strokeWidth={1}/>
          {pt.map((t,i)=>{
            const y=KH+i*RA, act=slp&&slp.id===t.id, delta=act?slp.delta:0
            const sD=shD(t.start||TODAY,delta), eD=shD(t.eind||TODAY,delta)
            const x=d2x(sD), xe=d2x(eD), dur=Math.max(t.mp?0:DW,xe-x)
            const k=tK(t,act), inZ=xe>=LW&&x<=W, xs=Math.max(LW,x)
            return (
              <g key={t.id}>
                <clipPath id={'tl'+i}><rect x={2} y={y} width={LW-6} height={RA}/></clipPath>
                <text x={6} y={y+RA/2+4} fontSize={10} fill={t.s==='afgerond'?C.t3:C.t2}
                  fontWeight={t.mp?700:400} clipPath={'url(#tl'+i+')'}>
                  {t.mp?'◆ ':''}{t.naam}
                </text>
                {inZ&&!t.mp&&<rect x={xs} y={y+8} width={Math.max(4,dur)} height={RA-16} rx={4}
                  fill={k} opacity={t.s==='afgerond'?0.45:0.88}
                  style={{cursor:'grab'}} onMouseDown={e=>onMD(e,t)}/>}
                {inZ&&t.mp&&<polygon
                  points={`${xs+9},${y+8} ${xs+17},${y+RA/2} ${xs+9},${y+RA-8} ${xs},${y+RA/2}`}
                  fill={k} opacity={0.92}/>}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

/* ── Blokkades ────────────────────────────────────────────────────────── */
function Blokkades({pid}) {
  const {bls,addBl,oplosBl} = useApp()
  const pb   = bls.filter(b=>b.pid===pid)
  const open = pb.filter(b=>b.st==='open').sort((a,b)=>a.dag.localeCompare(b.dag))
  const opg  = pb.filter(b=>b.st==='opgelost')
  const [addO,setAddO]   = useState(false)
  const [opId,setOpId]   = useState(null)
  const [opl,setOpl]     = useState('')
  const [om,setOm]       = useState('')
  const [ei,setEi]       = useState('')
  const [showO,setShowO] = useState(false)

  function BKaart({b}) {
    const l=bAge(b.dag), lk=ageC(l), isO=b.st==='open'
    return (
      <div style={{background:C.wh,border:'1px solid '+C.bd,borderTop:'3px solid '+(isO?lk:C.gr),
        borderRadius:12,padding:'14px 16px',marginBottom:10}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
          <div style={{flex:1}}>
            <div style={{fontSize:14,color:C.t1,lineHeight:1.5,marginBottom:8}}>{b.txt}</div>
            <div style={{display:'flex',gap:12,fontSize:12,color:C.t3,flexWrap:'wrap'}}>
              {b.eig&&<span>Eigenaar: <strong style={{color:C.t2}}>{b.eig}</strong></span>}
              <span>Gemeld: {fmt(b.dag)}</span>
              {isO&&<span style={{color:lk,fontWeight:700}}>{l} dag{l!==1?'en':''} open</span>}
            </div>
            {b.opl&&<div style={{marginTop:10,padding:'8px 12px',background:C.gL,borderRadius:4,border:'1px solid '+C.gB,fontSize:12,color:C.gr}}>✓ {b.opl}</div>}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
            <span style={{fontSize:11,fontWeight:700,borderRadius:20,padding:'2px 9px',
              color:isO?lk:C.gr,background:isO?lk+'18':C.gL,border:'1px solid '+(isO?lk+'50':C.gB)}}>
              {isO?'Open':'Opgelost'}
            </span>
            {isO&&<Btn sm v={l>=8?'gevaar':'amber'} onClick={()=>{setOpId(b.id);setOpl('')}}>Oplossen</Btn>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{padding:28,maxWidth:800}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.t1,marginBottom:2}}>Blokkades</div>
          <div style={{fontSize:13,color:C.t2}}>{open.length} open · {opg.length} opgelost</div>
        </div>
        <Btn v="gevaar" onClick={()=>setAddO(true)}>+ Blokkade melden</Btn>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
        <span style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:open.length>0?C.re:C.gr}}>Open blokkades</span>
        {open.length>0&&<span style={{fontSize:10,fontWeight:700,background:C.re,color:'#fff',borderRadius:10,padding:'0 6px'}}>{open.length}</span>}
      </div>
      {open.length===0?<Empty text="Geen open blokkades"/>:open.map(b=><BKaart key={b.id} b={b}/>)}
      <div style={{marginTop:24}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
          <span style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:C.t3}}>Opgeloste blokkades</span>
          <button onClick={()=>setShowO(v=>!v)} style={{fontSize:12,color:C.t3,background:'none',border:'none',cursor:'pointer'}}>{showO?'Verbergen':'Tonen'}</button>
        </div>
        {showO&&(opg.length===0?<Empty text="Nog geen opgeloste blokkades"/>:opg.map(b=><BKaart key={b.id} b={b}/>))}
      </div>
      {addO&&(
        <Modal title="Blokkade melden" onClose={()=>setAddO(false)} w={460}>
          <FR label="Wat wordt er geblokkeerd?" req><Inp val={om} set={setOm} ph="Beschrijf de blokkade..." rows={3}/></FR>
          <FR label="Eigenaar"><Inp val={ei} set={setEi} ph="Naam of team"/></FR>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <Btn v="geest" onClick={()=>setAddO(false)}>Annuleren</Btn>
            <Btn v="gevaar" onClick={()=>{if(!om.trim())return;addBl({txt:om,eig:ei,pid});setOm('');setEi('');setAddO(false)}}>Melden</Btn>
          </div>
        </Modal>
      )}
      {opId&&(
        <Modal title="Blokkade oplossen" onClose={()=>setOpId(null)} w={460}>
          <div style={{fontSize:13,color:C.t2,marginBottom:16,padding:'10px 12px',background:C.rL,borderRadius:4,border:'1px solid '+C.rB}}>
            {bls.find(b=>b.id===opId)?.txt}
          </div>
          <FR label="Hoe is dit opgelost?"><Inp val={opl} set={setOpl} ph="Beschrijf de oplossing..." rows={3}/></FR>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <Btn v="geest" onClick={()=>setOpId(null)}>Annuleren</Btn>
            <Btn v="succes" onClick={()=>{oplosBl(opId,opl);setOpId(null);setOpl('')}}>Opgelost</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ── Besluiten ────────────────────────────────────────────────────────── */
function Besluiten({pid}) {
  const {decs,addDec,sluitDec,updDec} = useApp()
  const pb   = decs.filter(d=>d.pid===pid)
  const open = pb.filter(d=>d.st==='open').sort((a,b)=>(a.dl||'').localeCompare(b.dl||''))
  const gesl = pb.filter(d=>d.st!=='open')
  const [addO,setAddO]   = useState(false)
  const [slId,setSlId]   = useState(null)
  const [uitk,setUitk]   = useState('')
  const [bI,setBI]       = useState(null)
  const [showG,setShowG] = useState(false)
  const [vr,setVr]       = useState('')
  const [ctx,setCtx]     = useState('')
  const [ei,setEi]       = useState('')
  const [dl,setDl]       = useState('')

  function BKaart({d}) {
    const isO=d.st==='open', vl=isO&&d.dl&&d.dl<TODAY, dr=d.dl?dFrom(d.dl):null
    return (
      <div style={{background:C.wh,border:'1px solid '+C.bd,borderTop:'3px solid '+(vl?C.am:isO?C.pu:C.gr),
        borderRadius:12,padding:'14px 16px',marginBottom:10}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:C.t1,marginBottom:4}}>{d.vr}</div>
            {d.ctx&&<div style={{fontSize:12,color:C.t2,marginBottom:8,lineHeight:1.5}}>{d.ctx}</div>}
            <div style={{display:'flex',gap:14,fontSize:12,color:C.t3,flexWrap:'wrap'}}>
              {d.eig&&<span>Eigenaar: <strong style={{color:C.t2}}>{d.eig}</strong></span>}
              {d.dl&&<span style={{color:vl?C.am:C.t3,fontWeight:vl?700:400}}>
                {isO?(vl?'Verlaat '+Math.abs(dr)+'d':'Voor '+fmt(d.dl)):'Besloten'}
              </span>}
            </div>
            {d.uit&&<div style={{marginTop:10,padding:'8px 12px',background:C.gL,borderRadius:4,border:'1px solid '+C.gB,fontSize:12,color:C.gr}}>✓ {d.uit}</div>}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
            <span style={{fontSize:11,fontWeight:700,borderRadius:20,padding:'2px 9px',
              color:isO?C.am:C.gr,background:isO?C.aL:C.gL,border:'1px solid '+(isO?C.aB:C.gB)}}>
              {isO?'Open':'Besloten'}
            </span>
            {isO&&<div style={{display:'flex',gap:4}}>
              <Btn sm v="sec" onClick={()=>setBI({...d})}>Bewerken</Btn>
              <Btn sm v="primair" onClick={()=>{setSlId(d.id);setUitk('')}}>Vastleggen</Btn>
            </div>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{padding:28,maxWidth:800}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.t1,marginBottom:2}}>Besluiten</div>
          <div style={{fontSize:13,color:C.t2}}>{open.length} open · {gesl.length} vastgelegd</div>
        </div>
        <Btn v="primair" onClick={()=>setAddO(true)}>+ Besluit toevoegen</Btn>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
        <span style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:open.some(d=>d.dl<TODAY)?C.am:C.pu}}>Openstaande besluiten</span>
        {open.length>0&&<span style={{fontSize:10,fontWeight:700,background:C.pu,color:'#fff',borderRadius:10,padding:'0 6px'}}>{open.length}</span>}
      </div>
      {open.length===0?<Empty text="Geen openstaande besluiten"/>:open.map(d=><BKaart key={d.id} d={d}/>)}
      <div style={{marginTop:24}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
          <span style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:C.t3}}>Besluitenlog</span>
          <button onClick={()=>setShowG(v=>!v)} style={{fontSize:12,color:C.t3,background:'none',border:'none',cursor:'pointer'}}>{showG?'Verbergen':'Tonen'}</button>
        </div>
        {showG&&(gesl.length===0?<Empty text="Nog geen besluiten vastgelegd"/>:gesl.map(d=><BKaart key={d.id} d={d}/>))}
      </div>
      {addO&&(
        <Modal title="Besluit toevoegen" onClose={()=>setAddO(false)}>
          <FR label="Wat moet er besloten worden?" req><Inp val={vr} set={setVr} ph="Beslissingsvraag..."/></FR>
          <FR label="Context"><Inp val={ctx} set={setCtx} ph="Achtergrond, opties..." rows={2}/></FR>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <FR label="Eigenaar"><Inp val={ei} set={setEi} ph="Wie beslist?"/></FR>
            <FR label="Deadline"><Inp type="date" val={dl} set={setDl}/></FR>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <Btn v="geest" onClick={()=>setAddO(false)}>Annuleren</Btn>
            <Btn v="primair" onClick={()=>{if(!vr.trim())return;addDec({vr,ctx,eig:ei,dl:dl||null,pid});setVr('');setCtx('');setEi('');setDl('');setAddO(false)}}>Toevoegen</Btn>
          </div>
        </Modal>
      )}
      {slId&&(
        <Modal title="Besluit vastleggen" onClose={()=>setSlId(null)} w={480}>
          <div style={{fontSize:14,fontWeight:700,color:C.t1,marginBottom:4}}>{decs.find(d=>d.id===slId)?.vr}</div>
          <FR label="Wat is er besloten?" req><Inp val={uitk} set={setUitk} ph="Leg de beslissing vast..." rows={3}/></FR>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <Btn v="geest" onClick={()=>setSlId(null)}>Annuleren</Btn>
            <Btn v="primair" onClick={()=>{sluitDec(slId,uitk);setSlId(null);setUitk('')}}>Vastleggen</Btn>
          </div>
        </Modal>
      )}
      {bI&&(
        <Modal title="Besluit bewerken" onClose={()=>setBI(null)}>
          <FR label="Vraag"><Inp val={bI.vr} set={v=>setBI(p=>({...p,vr:v}))}/></FR>
          <FR label="Context"><Inp val={bI.ctx||''} set={v=>setBI(p=>({...p,ctx:v}))} rows={2}/></FR>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <FR label="Eigenaar"><Inp val={bI.eig||''} set={v=>setBI(p=>({...p,eig:v}))}/></FR>
            <FR label="Deadline"><Inp type="date" val={bI.dl||''} set={v=>setBI(p=>({...p,dl:v}))}/></FR>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <Btn v="geest" onClick={()=>setBI(null)}>Annuleren</Btn>
            <Btn v="primair" onClick={()=>{updDec(bI.id,bI);setBI(null)}}>Opslaan</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ── Historie ─────────────────────────────────────────────────────────── */
function Historie({pid}) {
  const {gesch} = useApp()
  const items = gesch.filter(g=>g.pid===pid).sort((a,b)=>b.dag.localeCompare(a.dag))
  const IC = {
    'Blokkade gemeld':   {ic:'⊗',k:C.re},
    'Blokkade opgelost': {ic:'✓',k:C.gr},
    'Taak afgerond':     {ic:'✓',k:C.gr},
    'Taak gestart':      {ic:'○',k:C.pu},
    'Besluit vastgelegd':{ic:'✓',k:C.gr},
    'Besluit toegevoegd':{ic:'◈',k:C.am},
    'Fase gewijzigd':    {ic:'→',k:'#7C3AED'},
    'Project bijgewerkt':{ic:'✎',k:C.pu},
  }
  return (
    <div style={{padding:28,maxWidth:700}}>
      <div style={{fontSize:20,fontWeight:800,color:C.t1,marginBottom:4}}>Historie</div>
      <div style={{fontSize:13,color:C.t2,marginBottom:20}}>Alle activiteit op dit project</div>
      {items.length===0
        ? <div style={{color:C.t3,fontSize:13}}>Nog geen activiteit.</div>
        : <div style={{position:'relative'}}>
            <div style={{position:'absolute',left:17,top:0,bottom:0,width:2,background:C.bd}}/>
            {items.map(item=>{
              const m=IC[item.actie]||{ic:'○',k:C.t3}
              return (
                <div key={item.id} style={{display:'flex',gap:16,marginBottom:16,position:'relative'}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:m.k+'20',border:'2px solid '+m.k,
                    display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,zIndex:1,fontSize:13,color:m.k,fontWeight:700}}>
                    {m.ic}
                  </div>
                  <div style={{flex:1,paddingTop:6}}>
                    <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
                      <span style={{fontSize:13,fontWeight:600,color:C.t1}}>{item.actie}</span>
                      <span style={{fontSize:11,color:C.t3,whiteSpace:'nowrap'}}>{rel(item.dag)}</span>
                    </div>
                    {item.det&&<div style={{fontSize:12,color:C.t2,marginTop:2}}>{item.det}</div>}
                  </div>
                </div>
              )
            })}
          </div>
      }
    </div>
  )
}

/* ── Beheer ───────────────────────────────────────────────────────────── */
function Beheer() {
  const [themas,setThemas] = useState(['Digitalisering','Klantgericht','Operationele excellentie','Duurzaamheid'])
  const [types,setTypes]   = useState(['IT-project','Bedrijfsverandering','Infrastructuur','Onderzoek'])
  const [nT,setNT] = useState('')
  const [nTy,setNTy] = useState('')

  function Lijst({items, onAdd, onRem, nw, setNw, label, ph}) {
    return (
      <div style={{background:C.wh,border:'1px solid '+C.bd,borderRadius:12,padding:'16px 18px',marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:C.t3,marginBottom:10}}>{label}</div>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <input value={nw} onChange={e=>setNw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onAdd()} placeholder={ph}
            style={{flex:1,background:C.bg,border:'1px solid '+C.bm,borderRadius:4,color:C.t1,fontSize:13,padding:'7px 10px',outline:'none'}}/>
          <Btn v="primair" onClick={onAdd}>+ Toevoegen</Btn>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
          {items.map(item=>(
            <div key={item} style={{display:'flex',alignItems:'center',gap:6,background:C.puL,borderRadius:20,padding:'4px 10px 4px 12px',border:'1px solid '+C.bd}}>
              <span style={{fontSize:12,fontWeight:600,color:C.pu}}>{item}</span>
              <button onClick={()=>onRem(item)} style={{background:'none',border:'none',color:C.t3,cursor:'pointer',fontSize:14,lineHeight:1,padding:0}}>×</button>
            </div>
          ))}
          {items.length===0&&<span style={{fontSize:12,color:C.t3}}>Nog niets toegevoegd.</span>}
        </div>
      </div>
    )
  }

  return (
    <div style={{padding:28,maxWidth:800}}>
      <div style={{fontSize:26,fontWeight:800,color:C.t1,letterSpacing:'-0.02em',marginBottom:2}}>Beheer</div>
      <div style={{fontSize:13,color:C.t2,marginBottom:24}}>Stamdata en configuratie</div>
      <div style={{background:C.wh,border:'1px solid '+C.bd,borderRadius:12,padding:'16px 18px',marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:C.t3,marginBottom:10}}>Projectfases</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {PHASES.map((f,i)=>(
            <div key={f.key} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',background:f.bg,borderRadius:4,border:'1px solid '+f.rd}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:f.kl}}/>
              <span style={{fontSize:12,fontWeight:700,color:f.kl}}>{i+1}. {f.key}</span>
            </div>
          ))}
        </div>
      </div>
      <Lijst items={themas} onAdd={()=>{if(nT.trim()){setThemas(v=>[...v,nT]);setNT('')}}} onRem={n=>setThemas(v=>v.filter(x=>x!==n))} nw={nT} setNw={setNT} label="Strategische thema's" ph="Nieuw thema..."/>
      <Lijst items={types}  onAdd={()=>{if(nTy.trim()){setTypes(v=>[...v,nTy]);setNTy('')}}} onRem={n=>setTypes(v=>v.filter(x=>x!==n))} nw={nTy} setNw={setNTy} label="Projecttypes" ph="Nieuw type..."/>
    </div>
  )
}

/* ── Zijbalk ──────────────────────────────────────────────────────────── */
function Zijbalk() {
  const {view,setView,active,setActive,projs} = useApp()
  return (
    <div style={{width:218,flexShrink:0,background:C.wh,borderRight:'1px solid '+C.bd,
      display:'flex',flexDirection:'column',height:'100vh',overflowY:'auto'}}>
      <div style={{padding:'18px 18px 14px',borderBottom:'1px solid '+C.bd}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:30,height:30,background:C.pu,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:C.li,fontSize:15,fontWeight:900}}>P</span>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:C.t1}}>Planner<span style={{color:C.pu}}>++</span></div>
            <div style={{fontSize:9,color:C.t3,letterSpacing:'0.06em',textTransform:'uppercase'}}>Project Cockpit</div>
          </div>
        </div>
      </div>
      <div style={{padding:'12px 10px'}}>
        {[{v:'board',l:'Projectenboard',ic:'▦'},{v:'beheer',l:'Beheer',ic:'⚙'}].map(item=>{
          const a = view===item.v
          return (
            <div key={item.v} onClick={()=>setView(item.v)} style={{
              display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:4,
              fontSize:13,fontWeight:a?700:400,background:a?C.puL:'transparent',
              color:a?C.pu:C.t2,marginBottom:2,cursor:'pointer'
            }}>
              <span style={{fontSize:14}}>{item.ic}</span>{item.l}
            </div>
          )
        })}
        {active&&(
          <>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',
              color:C.t3,padding:'14px 8px 6px',borderTop:'1px solid '+C.bd,marginTop:10}}>
              Huidig project
            </div>
            <select value={active} onChange={e=>{setActive(e.target.value);setView('cockpit')}}
              style={{width:'100%',background:C.bg,border:'1px solid '+C.bm,borderRadius:4,
                color:C.t1,fontSize:12,padding:'6px 10px',outline:'none',cursor:'pointer',marginBottom:8}}>
              {projs.filter(p=>p.fase!=='Archief').map(p=><option key={p.id} value={p.id}>{p.naam}</option>)}
            </select>
          </>
        )}
      </div>
      <div style={{marginTop:'auto',borderTop:'1px solid '+C.bd,padding:'12px 10px'}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:C.t3,marginBottom:6,paddingLeft:6}}>Projecten</div>
        {projs.map(p=>{
          const sel=p.id===active&&view==='cockpit'
          return (
            <div key={p.id} onClick={()=>{setActive(p.id);setView('cockpit')}}
              style={{display:'flex',alignItems:'center',gap:7,padding:'6px 8px',borderRadius:4,
                fontSize:11,fontWeight:sel?700:400,background:sel?C.puL:'transparent',
                color:sel?C.pu:C.t2,cursor:'pointer',marginBottom:1}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:hC(p.h),flexShrink:0}}/>
              <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.naam}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Nieuw project modal ──────────────────────────────────────────────── */
function NieuwProjectModal({onClose, onSave}) {
  const [naam,setNaam]     = useState('')
  const [eig,setEig]       = useState('')
  const [fase,setFase]     = useState('Ideeën')
  const [h,setH]           = useState('groen')
  const [omschr,setOmschr] = useState('')
  const [themas,setThemas] = useState('')
  const [type,setType]     = useState('')

  return (
    <Modal title="Nieuw project aanmaken" onClose={onClose} w={540}>
      <FR label="Projectnaam" req><Inp val={naam} set={setNaam} ph="Naam van het project"/></FR>
      <FR label="Omschrijving"><Inp val={omschr} set={setOmschr} ph="Korte omschrijving" rows={2}/></FR>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <FR label="Eigenaar / PM"><Inp val={eig} set={setEig} ph="Naam projectmanager"/></FR>
        <FR label="Fase"><Sel val={fase} set={setFase}>{PHASES.map(f=><option key={f.key} value={f.key}>{f.key}</option>)}</Sel></FR>
        <FR label="Gezondheid"><Sel val={h} set={setH}><option value="groen">Op schema</option><option value="oranje">Aandacht vereist</option><option value="rood">Kritiek</option></Sel></FR>
        <FR label="Projecttype"><Inp val={type} set={setType} ph="Bijv. IT-project"/></FR>
      </div>
      <FR label="Strategische thema's"><Inp val={themas} set={setThemas} ph="Bijv. Digitalisering, Klantgericht"/></FR>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:4}}>
        <Btn v="geest" onClick={onClose}>Annuleren</Btn>
        <Btn v="primair" onClick={()=>{
          if(!naam.trim()) return
          onSave({naam,eig,fase,h,omschr,themas,type,bij:TODAY})
          onClose()
        }}>Project aanmaken</Btn>
      </div>
    </Modal>
  )
}

/* ── Root App ─────────────────────────────────────────────────────────── */
export default function App() {
  const [view,setView]     = useState('board')
  const [active,setActive] = useState(null)
  const [projs,setProjs]   = useState(P0)
  const [tasks,setTasks]   = useState(T0)
  const [bls,setBls]       = useState(B0)
  const [decs,setDecs]     = useState(D0)
  const [gesch,setGesch]   = useState(G0)
  const [nieuw,setNieuw]   = useState(false)
  const [tab,setTab]       = useState('overzicht')

  const log = useCallback((pid,actie,det='')=>setGesch(p=>[{id:uid(),pid,actie,det,dag:TODAY},...p]),[])

  const setFase  = useCallback((id,f)=>{setProjs(p=>p.map(x=>x.id===id?{...x,fase:f,bij:TODAY}:x));log(id,'Fase gewijzigd','→ '+f)},[log])
  const setProj  = useCallback((id,w)=>{setProjs(p=>p.map(x=>x.id===id?{...x,...w,bij:TODAY}:x));log(id,'Project bijgewerkt')},[log])
  const addProj  = useCallback(p=>setProjs(v=>[{...p,id:uid()},...v]),[])
  const updTask  = useCallback((id,w)=>setTasks(p=>p.map(t=>{
    if(t.id!==id)return t
    const u={...t,...w}
    if(w.s==='afgerond') log(t.pid,'Taak afgerond',t.naam)
    if(w.s==='actief'&&t.s!=='actief') log(t.pid,'Taak gestart',t.naam)
    return u
  })),[log])
  const addTask  = useCallback(t=>setTasks(p=>[...p,{...t,id:uid()}]),[])
  const addBl    = useCallback(b=>{const n={...b,id:uid(),st:'open',dag:TODAY,opl:''};setBls(p=>[...p,n]);log(b.pid,'Blokkade gemeld',(b.txt||'').slice(0,50))},[log])
  const oplosBl  = useCallback((id,opl)=>{setBls(p=>p.map(b=>b.id===id?{...b,st:'opgelost',opl}:b));const b=bls.find(x=>x.id===id);if(b)log(b.pid,'Blokkade opgelost')},[bls,log])
  const addDec   = useCallback(d=>{const n={...d,id:uid(),st:'open',uit:''};setDecs(p=>[...p,n]);log(d.pid,'Besluit toegevoegd',(d.vr||'').slice(0,50))},[log])
  const sluitDec = useCallback((id,uit)=>{setDecs(p=>p.map(d=>d.id===id?{...d,st:'besloten',uit}:d));const d=decs.find(x=>x.id===id);if(d)log(d.pid,'Besluit vastgelegd')},[decs,log])
  const updDec   = useCallback((id,w)=>setDecs(p=>p.map(d=>d.id===id?{...d,...w}:d)),[])

  const ctx = {view,setView,active,setActive,projs,tasks,bls,decs,gesch,setFase,setProj,addProj,updTask,addTask,addBl,oplosBl,addDec,sluitDec,updDec}

  const proj = projs.find(x=>x.id===active)
  const ob = proj ? bls.filter(b=>b.pid===active&&b.st==='open').length : 0
  const od = proj ? decs.filter(d=>d.pid===active&&d.st==='open').length : 0
  const vl = proj ? tasks.filter(t=>t.pid===active&&isLate(t)).length : 0

  return (
    <Ctx.Provider value={ctx}>
      <div style={{display:'flex',height:'100vh',background:C.bg,overflow:'hidden'}}>
        <Zijbalk/>
        {nieuw&&<NieuwProjectModal onClose={()=>setNieuw(false)} onSave={addProj}/>}

        <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0,overflow:'hidden'}}>

          {/* Board */}
          {view==='board'&&<>
            <div style={{background:C.wh,borderBottom:'1px solid '+C.bd,padding:'0 28px',height:52,
              display:'flex',alignItems:'center',flexShrink:0}}>
              <span style={{fontSize:11,fontWeight:700,color:C.pu,letterSpacing:'0.07em',textTransform:'uppercase'}}>PORTFOLIO</span>
              <div style={{marginLeft:'auto'}}>
                <Btn v="primair" onClick={()=>setNieuw(true)}>+ Nieuw project</Btn>
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:28}}>
              <div style={{fontSize:26,fontWeight:800,color:C.t1,letterSpacing:'-0.02em',marginBottom:2}}>Projectenboard</div>
              <div style={{fontSize:13,color:C.t2,marginBottom:20}}>Sleep kaarten naar een andere fase · klik om de cockpit te openen</div>
              <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
                {[
                  {ic:'▦',w:projs.filter(p=>p.fase!=='Archief').length,l:'Actief'},
                  {ic:'⊗',w:projs.filter(p=>p.h==='rood').length,l:'Kritiek',k:projs.filter(p=>p.h==='rood').length>0?C.re:undefined},
                  {ic:'✓',w:projs.filter(p=>p.fase==='Archief').length,l:'Gearchiveerd'},
                ].map(kpi=>(
                  <div key={kpi.l} style={{background:C.wh,border:'1px solid '+C.bd,borderRadius:8,padding:'16px 20px',flex:1,minWidth:120}}>
                    <div style={{width:32,height:32,borderRadius:8,background:C.puL,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:C.pu,marginBottom:8}}>{kpi.ic}</div>
                    <div style={{fontSize:24,fontWeight:800,color:kpi.k||C.t1,marginBottom:2}}>{kpi.w}</div>
                    <div style={{fontSize:12,color:C.t2}}>{kpi.l}</div>
                  </div>
                ))}
              </div>
              <Board/>
            </div>
          </>}

          {/* Cockpit */}
          {view==='cockpit'&&proj&&<>
            <div style={{background:C.wh,borderBottom:'1px solid '+C.bd,padding:'0 28px',height:44,
              display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
              <span onClick={()=>setView('board')} style={{fontSize:13,color:C.pu,fontWeight:600,cursor:'pointer'}}>Projectenboard</span>
              <span style={{color:C.t3}}>›</span>
              <span style={{fontSize:13,color:C.t1,fontWeight:600}}>{proj.naam}</span>
            </div>
            <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
              <CHdr proj={proj} ob={ob} od={od} vl={vl} tab={tab} setTab={setTab}/>
              <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column'}}>
                {tab==='overzicht' &&<Overzicht pid={active}/>}
                {tab==='taken'     &&<div style={{flex:1,display:'flex',overflow:'hidden'}}><Taken pid={active}/></div>}
                {tab==='tijdlijn'  &&<Tijdlijn  pid={active}/>}
                {tab==='blokkades' &&<Blokkades pid={active}/>}
                {tab==='besluiten' &&<Besluiten pid={active}/>}
                {tab==='historie'  &&<Historie  pid={active}/>}
              </div>
            </div>
          </>}

          {view==='cockpit'&&!proj&&(
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:C.t3,gap:12}}>
              <div style={{fontSize:40}}>⊙</div>
              <div style={{fontSize:16}}>Selecteer een project om de cockpit te openen</div>
              <Btn v="primair" onClick={()=>setView('board')}>Naar projectenboard</Btn>
            </div>
          )}

          {/* Beheer */}
          {view==='beheer'&&<>
            <div style={{background:C.wh,borderBottom:'1px solid '+C.bd,padding:'0 28px',height:52,display:'flex',alignItems:'center',flexShrink:0}}>
              <span style={{fontSize:13,fontWeight:700,color:C.t1}}>Beheer</span>
            </div>
            <div style={{flex:1,overflowY:'auto'}}><Beheer/></div>
          </>}

        </div>
      </div>
    </Ctx.Provider>
  )
}
