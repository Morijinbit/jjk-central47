// ================================================================
//  JJK – Central 47 Database Terminal
//  FoundryVTT Module  |  Compatible: v11 / v12
//  Adds a button to the Journal sidebar that opens the
//  Jujutsu Sorcery Commission database in a floating window.
// ================================================================

(function () {
  "use strict";

  const MODULE_ID  = "jjk-central47";
  const ASSET_PATH = `modules/${MODULE_ID}/assets/central47.html`;

  // ── Application Window ────────────────────────────────────────
  class Central47App extends Application {

    constructor(...args) {
      super(...args);
      this._isFullscreen = false;
    }

    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id:          "central-47-database",
        title:       "CENTRAL 47  //  JUJUTSU SORCERY COMMISSION",
        width:       1140,
        height:      740,
        resizable:   true,
        minimizable: true,
        classes:     ["central47-window"]
      });
    }

    // Render entirely from JS – no Handlebars template needed
    async _renderInner(/* data */) {
      const wrap = document.createElement("div");
      wrap.style.cssText = [
        "display:flex",
        "flex-direction:column",
        "height:100%",
        "background:#000",
        "font-family:monospace"
      ].join(";");

      // ── toolbar ──
      const bar = document.createElement("div");
      bar.style.cssText = [
        "display:flex",
        "justify-content:space-between",
        "align-items:center",
        "padding:5px 12px",
        "background:#070707",
        "border-bottom:1px solid #1c1c1c",
        "flex-shrink:0"
      ].join(";");

      const label = document.createElement("span");
      label.style.cssText = "color:#444;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;";
      label.textContent   = "Classified Network  ·  Authorized Personnel Only";

      const fsBtn = document.createElement("button");
      fsBtn.id            = "c47-fs-btn";
      fsBtn.textContent   = "⛶  FULLSCREEN";
      fsBtn.style.cssText = [
        "background:#0e0e0e",
        "border:1px solid #2a2a2a",
        "color:#666",
        "padding:3px 14px",
        "cursor:pointer",
        "font-size:10px",
        "letter-spacing:0.12em",
        "border-radius:2px",
        "font-family:monospace",
        "transition:color 0.15s,border-color 0.15s"
      ].join(";");

      fsBtn.addEventListener("mouseenter", () => {
        fsBtn.style.color       = "#aaa";
        fsBtn.style.borderColor = "#555";
      });
      fsBtn.addEventListener("mouseleave", () => {
        fsBtn.style.color       = "#666";
        fsBtn.style.borderColor = "#2a2a2a";
      });
      fsBtn.addEventListener("click", () => this._toggleFullscreen());

      bar.appendChild(label);
      bar.appendChild(fsBtn);

      // ── iframe ──
      const frame = document.createElement("iframe");
      frame.src             = ASSET_PATH;
      frame.style.cssText   = "flex:1;border:none;width:100%;height:100%;display:block;";
      frame.setAttribute("allowfullscreen", "true");
      this._frameEl = frame;

      wrap.appendChild(bar);
      wrap.appendChild(frame);

      return $(wrap);
    }

    // ── Fullscreen toggle ──────────────────────────────────────
    _toggleFullscreen() {
      const win = this.element?.[0];
      if (!win) return;

      const fsBtn = win.querySelector("#c47-fs-btn");

      if (this._isFullscreen) {
        // Restore
        this._isFullscreen = false;
        win.style.cssText  = "";
        if (fsBtn) fsBtn.textContent = "⛶  FULLSCREEN";
        this.setPosition({ width: 1140, height: 740 });
      } else {
        // Go fullscreen
        this._isFullscreen = true;
        Object.assign(win.style, {
          position:  "fixed",
          top:       "0px",
          left:      "0px",
          width:     "100vw",
          height:    "100vh",
          maxWidth:  "100vw",
          maxHeight: "100vh",
          zIndex:    "99999",
          margin:    "0",
          transform: "none"
        });
        if (fsBtn) fsBtn.textContent = "✕  EXIT FULLSCREEN";
      }
    }
  }

  // ── Singleton ─────────────────────────────────────────────────
  let _instance = null;

  function openTerminal() {
    if (!_instance || !_instance.rendered) {
      _instance = new Central47App();
    }
    _instance.render(true);
    _instance.bringToTop?.();
  }

  // ── Journal Sidebar Button ────────────────────────────────────
  Hooks.on("renderJournalDirectory", (_app, html) => {
    if (html.find(".c47-sidebar-btn").length) return; // no duplicates

    const btn = $(`
      <div class="c47-sidebar-btn" style="
        padding: 2px 8px 6px;
      ">
        <button style="
          width: 100%;
          padding: 7px 10px;
          background: #0a0a0a;
          border: 1px solid #1e1e1e;
          border-left: 2px solid #3a5a2a;
          color: #5a7a4a;
          font-family: monospace;
          font-size: 10.5px;
          letter-spacing: 0.14em;
          cursor: pointer;
          text-align: left;
          text-transform: uppercase;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <span style="color:#4a6a3a;font-size:13px;">▸</span>
          Central 47 Database Terminal
        </button>
      </div>
    `);

    btn.find("button")
      .on("mouseenter", function () {
        $(this).css({
          background:   "#111",
          borderColor:  "#2e4e1e",
          borderLeft:   "2px solid #6aaa4a",
          color:        "#8acc6a"
        });
      })
      .on("mouseleave", function () {
        $(this).css({
          background:   "#0a0a0a",
          borderColor:  "#1e1e1e",
          borderLeft:   "2px solid #3a5a2a",
          color:        "#5a7a4a"
        });
      })
      .on("click", openTerminal);

    // Insert just below the directory header / search bar
    const header = html.find(".directory-header");
    if (header.length) {
      header.after(btn);
    } else {
      html.prepend(btn);
    }
  });

  // ── Ready hook – expose on module object + RFC-003 sync layer ─
  Hooks.once("ready", () => {
    const mod = game.modules.get(MODULE_ID);
    if (mod) mod.openTerminal = openTerminal;

    // ══════════════════════════════════════════════════════════════
    //  RFC-003 — DISTRIBUTED SYNCHRONISATION LAYER
    //  The forum exists once. Every client observes the same forum.
    //
    //  Authoritative Forum State Object (FSO, §1.5): a flag on a
    //  world-level JournalEntry every player owns. Document updates
    //  persist in the world database AND replicate to all connected
    //  clients in real time — which gives us both halves of the bug:
    //  fresh opens hydrate from the journal, live clients get pushed.
    //
    //  Event flow (§1.4):
    //   iframe mutation ─▶ c47_forum_sync ─▶ socket relay (instant)
    //                                     └▶ merge into journal FSO
    //   journal update  ─▶ updateJournalEntry hook on every client
    //                                     └▶ c47_forum_receive ─▶ iframe
    //   iframe opens    ─▶ c47_forum_hello ─▶ full FSO snapshot back
    //
    //  This layer transports state only (§1.10): all forum content is
    //  generated inside the terminal by the Intelligence Core.
    // ══════════════════════════════════════════════════════════════
    const S        = window.C47SYNC;
    const FSO_FLAG = "fso";
    if (!S) console.error("Central 47 | c47-sync-core.js missing — forum sync disabled");

    const getFsoDoc = () =>
      game.journal?.find?.((j) => !!j.getFlag?.(MODULE_ID, FSO_FLAG));

    const readFso = () => {
      const f = getFsoDoc()?.getFlag(MODULE_ID, FSO_FLAG);
      return f && typeof f === "object"
        ? foundry.utils.deepClone(f)
        : S.emptyFSO();
    };

    // GM-side, once: create the FSO journal + make every player an owner,
    // so any client can commit forum mutations directly (no GM proxy).
    async function ensureFsoDoc() {
      if (!game.user.isGM) return getFsoDoc();
      let doc = getFsoDoc();
      const OWNER = CONST.DOCUMENT_OWNERSHIP_LEVELS?.OWNER ?? 3;
      if (!doc) {
        doc = await JournalEntry.create({
          name: "Central 47 — Forum State (module data, do not delete)",
          ownership: { default: OWNER },
          flags: { [MODULE_ID]: { [FSO_FLAG]: S.emptyFSO() } }
        });
        console.log("Central 47 | created authoritative Forum State journal");
      } else if ((doc.ownership?.default ?? 0) < OWNER) {
        await doc.update({ ownership: { default: OWNER } });
      }
      return doc;
    }

    // Debounced authoritative write (§1.7): bursts (vote ramps, staggered NPC
    // replies) merge locally and land as one document update.
    let _pendingSnap = null, _writeT = null;
    function queueFsoWrite(snap) {
      if (!S) return;
      const base = _pendingSnap || { threads: [], adds: {}, dead: null };
      _pendingSnap = S.mergeSnapshot(base, snap);
      clearTimeout(_writeT);
      _writeT = setTimeout(flushFso, 1200);
    }
    async function flushFso() {
      const doc = getFsoDoc();
      if (!doc || !_pendingSnap) return; // no FSO yet (GM hasn't loaded the world since updating) — socket relay still covers live clients
      const cur  = readFso();
      const snap = _pendingSnap; _pendingSnap = null;
      const m    = S.mergeSnapshot(cur, snap);
      if (!m.changed) return;
      try {
        await doc.setFlag(MODULE_ID, FSO_FLAG, {
          v: 1, seq: (cur.seq || 0) + 1,
          threads: m.threads, adds: m.adds, dead: m.dead,
          updated: Date.now()
        });
      } catch (err) {
        console.warn("Central 47 | FSO write failed", err);
      }
    }

    const pushToFrame = (payload) => {
      if (_instance && _instance.rendered && _instance._frameEl?.contentWindow) {
        _instance._frameEl.contentWindow.postMessage(
          Object.assign({ type: "c47_forum_receive" }, payload), "*");
      }
    };
    const pushFso = () => {
      const f = readFso();
      pushToFrame({ threads: f.threads || [], adds: f.adds || {}, dead: f.dead || null, seq: f.seq || 0, fso: true });
    };

    // iframe → layer: hello (hydrate me) + sync (publish my mutation)
    window.addEventListener("message", (e) => {
      if (!e.data) return;
      if (_instance && _instance._frameEl &&
          e.source !== _instance._frameEl.contentWindow) return; // our terminal only
      if (e.data.type === "c47_forum_hello") {
        pushFso();
        return;
      }
      if (e.data.type !== "c47_forum_sync") return;
      const snap = { threads: e.data.threads || [], adds: e.data.adds || {}, dead: e.data.dead || null };
      queueFsoWrite(snap);                        // authoritative persistence
      game.socket.emit("module." + MODULE_ID, {   // instant live relay (§1.7)
        type: "c47_forum_sync", _from: game.user?.id,
        threads: snap.threads, adds: snap.adds, dead: snap.dead
      });
    });

    // socket → iframe: another player's mutation, delivered live
    game.socket.on("module." + MODULE_ID, (data) => {
      if (!data || data.type !== "c47_forum_sync") return;
      if (data._from === game.user?.id) return;   // own echo
      pushToFrame({ threads: data.threads || [], adds: data.adds || {}, dead: data.dead || null });
      // redundancy: if the originator's write raced or failed, the GM client
      // also folds the event into the FSO (merge is idempotent — no dupes)
      if (game.user.isGM) queueFsoWrite({ threads: data.threads || [], adds: data.adds || {}, dead: data.dead || null });
    });

    // journal replication → iframe: the document update IS the broadcast (§1.7)
    Hooks.on("updateJournalEntry", (doc, changes) => {
      if (!doc.getFlag?.(MODULE_ID, FSO_FLAG)) return;
      pushFso();
    });

    ensureFsoDoc();

    console.log(
      "%c⚡ Central 47 Database Terminal v3.0.1 | Intelligence Core V3 + Forum Sync (RFC-003)",
      "color:#5a8a3a;font-family:monospace;font-weight:bold;"
    );
  });

})();
