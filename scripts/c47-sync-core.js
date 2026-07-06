// ============================================================================
//  C47SYNC — CENTRAL 47 DISTRIBUTED SYNCHRONISATION LAYER (shared core)  v1.0
//  ---------------------------------------------------------------------------
//  RFC-003 implementation. This file is the SINGLE merge implementation used
//  by every party in the sync topology:
//    · the terminal client (bundled into the DC / forum HTML)
//    · the Foundry module bridge (scripts/central47.js)
//    · the sync test harness
//
//  It is pure state logic. Per RFC-003 §1.10 it generates no content, invokes
//  no cognitive engines, and never reorders published discussions — it only
//  reconciles two observations of the same forum into one.
//
//  DATA SHAPES
//    snapshot: { threads:[threadNode], adds:{ parentKey:[replyNode] }, dead }
//    dead:     { t:{ threadId:ts }, n:{ nodeId:ts } }   (tombstones; PostDeleted)
//    FSO:      { v:1, seq, threads, adds, dead, updated }  (authoritative state)
//
//  MERGE RULES (deterministic, commutative up to node preference):
//    · union by id — nothing is ever dropped because a peer hadn't seen it yet
//    · same id twice → keep the more-evolved copy (higher up+down vote total;
//      the originating client animates votes, so its copy is always ahead)
//    · tombstones union and always win: a dead id never resurrects (§1.9 —
//      deletions are permanent, not divergence)
//    · `changed` reports whether BASE gained anything — callers use it to
//      break echo loops (an event applied twice is a no-op, §1.8)
// ============================================================================
(function(){
'use strict';

function isObj(o){ return !!o && typeof o==='object'; }
function nscore(n){ return n ? ((n.up||0)+(n.down||0)) : 0; }
function normDead(d){
  d=isObj(d)?d:{};
  return { t:isObj(d.t)?d.t:{}, n:isObj(d.n)?d.n:{} };
}
function emptyFSO(){ return { v:1, seq:0, threads:[], adds:{}, dead:{t:{},n:{}}, updated:0 }; }

// does this adds-key live under a tombstoned thread?
function keyIsDead(key, deadT){
  for(var tid in deadT){ if(key===tid || key.indexOf(tid+':')===0) return true; }
  return false;
}

// mergeSnapshot(base, incoming) -> { threads, adds, dead, changed }
// `changed` is true iff the result differs from BASE (new/updated/purged).
function mergeSnapshot(base, inc){
  base=base||{}; inc=inc||{};
  var changed=false, k;

  // ---- tombstones union ----------------------------------------------------
  var bd=normDead(base.dead), nd=normDead(inc.dead);
  var dead={t:{},n:{}};
  for(k in bd.t) dead.t[k]=bd.t[k];
  for(k in nd.t){ if(!dead.t[k]){ dead.t[k]=nd.t[k]; changed=true; } }
  for(k in bd.n) dead.n[k]=bd.n[k];
  for(k in nd.n){ if(!dead.n[k]){ dead.n[k]=nd.n[k]; changed=true; } }

  // ---- threads: union by id, prefer the more-evolved copy -------------------
  var tmap={}, order=[];
  var baseT=Array.isArray(base.threads)?base.threads:[];
  var incT=Array.isArray(inc.threads)?inc.threads:[];
  baseT.forEach(function(t){
    if(!t||!t.id) return;
    if(dead.t[t.id]){ changed=true; return; }     // purge just-tombstoned
    if(!tmap[t.id]){ tmap[t.id]=t; order.push(t.id); }
  });
  incT.forEach(function(t){
    if(!t||!t.id||dead.t[t.id]) return;
    var cur=tmap[t.id];
    if(!cur){ tmap[t.id]=t; order.push(t.id); changed=true; }
    else if(nscore(t)>nscore(cur) || (nscore(t)===nscore(cur) && (t.replies||0)>(cur.replies||0))){
      tmap[t.id]=t; changed=true;
    }
  });
  var threads=order.map(function(id){ return tmap[id]; });

  // ---- adds: per-key union by node id ---------------------------------------
  var adds={};
  function fold(src, isIncoming){
    if(!isObj(src)) return;
    for(var key in src){
      if(!Object.prototype.hasOwnProperty.call(src,key)) continue;
      if(keyIsDead(key,dead.t) || dead.n[key]){ if(!isIncoming) changed=true; continue; }
      var list=Array.isArray(src[key])?src[key]:[];
      var out=adds[key];
      var byId, i, n;
      if(!out){ out=adds[key]=[]; }
      byId={}; for(i=0;i<out.length;i++){ if(out[i]&&out[i].id) byId[out[i].id]=i; }
      for(i=0;i<list.length;i++){
        n=list[i];
        if(!n||!n.id) continue;
        if(dead.n[n.id]){ if(!isIncoming) changed=true; continue; }
        var at=byId[n.id];
        if(at==null){ byId[n.id]=out.length; out.push(n); if(isIncoming) changed=true; }
        else if(nscore(n)>nscore(out[at])){ out[at]=n; if(isIncoming) changed=true; }
      }
    }
  }
  fold(base.adds,false);
  fold(inc.adds,true);
  for(k in adds){ if(!adds[k].length) delete adds[k]; }

  return { threads:threads, adds:adds, dead:dead, changed:changed };
}

var API={ emptyFSO:emptyFSO, mergeSnapshot:mergeSnapshot, normDead:normDead };
if(typeof window!=='undefined') window.C47SYNC=API;
if(typeof module!=='undefined' && module.exports) module.exports=API;
})();
