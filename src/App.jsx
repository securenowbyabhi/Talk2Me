import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate, useParams } from "react-router-dom";

/* ---------- utils ---------- */
const useLocalStorage = (key, initial) => {
  const [v, setV] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(v)), [key, v]);
  return [v, setV];
};
const cn = (...a) => a.filter(Boolean).join(" ");

/* ---------- constants ---------- */
const COUNTRIES = [
  "India", "China", "Colombia", "Mexico", "Brazil",
  "Nigeria", "Pakistan", "Bangladesh", "Vietnam", "South Korea",
  "Japan", "Indonesia", "Egypt", "Germany", "France"
];
const COPING_PREFS = ["Journaling", "Breathing", "Walking", "Music", "Calling Family/Friends", "Prayer/Meditation", "Exercise"];
const COMM_STYLES = ["Gentle", "Direct", "Encouraging", "Humorous"];

/* Minimal Colombian‑inspired avatar (offline SVG data URI) */
const DEFAULT_COACH_AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#20254A"/>
      <stop offset="1" stop-color="#1FB8A6"/>
    </linearGradient>
  </defs>
  <rect width="96" height="96" rx="16" fill="url(#bg)"/>
  <!-- hair -->
  <circle cx="48" cy="40" r="22" fill="#2f2a2a"/>
  <rect x="26" y="50" width="44" height="20" rx="10" fill="#2f2a2a"/>
  <!-- face -->
  <circle cx="48" cy="42" r="16" fill="#f2c4a1"/>
  <!-- eyes -->
  <circle cx="42" cy="40" r="2" fill="#2b2b2b"/>
  <circle cx="54" cy="40" r="2" fill="#2b2b2b"/>
  <!-- smile -->
  <path d="M40 47 q8 6 16 0" stroke="#b76e79" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- shirt -->
  <rect x="32" y="58" width="32" height="20" rx="6" fill="#fefefe"/>
  <!-- small flag band (Colombia) -->
  <rect x="34" y="60" width="28" height="4" fill="#F7E017"/>
  <rect x="34" y="64" width="28" height="2" fill="#0039A6"/>
  <rect x="34" y="66" width="28" height="2" fill="#CE1126"/>
</svg>
`);

/* ---------- chrome ---------- */
const Nav = ({ children }) => {
  const loc = useLocation();
  const hide = loc.pathname.startsWith("/onboarding");
  if (hide) return null;
  return (
    <nav className="nav">
      <Link to="/" className="brand">Talk2Me</Link>
      {children}
    </nav>
  );
};

const TopActions = ({ profile, lang, setLang, communities, onNotifClick }) => {
  const [commOpen, setCommOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  return (
    <div className="top-actions">
      <button className="icon-btn" title="Notifications" onClick={onNotifClick}>🔔</button>
      <select className="icon-select" value={lang} onChange={e => setLang(e.target.value)} title="Language">
        {["English", "Spanish", "Hindi", "Mandarin", "Arabic"].map(l => <option key={l}>{l}</option>)}
      </select>

      <div className="menu">
        <button className="icon-btn" onClick={() => setCommOpen(s => !s)} title="Communities">👥</button>
        {commOpen && (
          <div className="menu-pop">
            <div className="menu-title">Your Communities</div>
            <ul>
              {communities.filter(c => c.joined).map(c => <li key={c.id}>{c.name}</li>)}
              {communities.filter(c => c.joined).length === 0 && <li className="muted">No communities yet</li>}
            </ul>
          </div>
        )}
      </div>

      <div className="menu">
        <button className="icon-btn" onClick={() => setAcctOpen(s => !s)} title="Account">👤</button>
        {acctOpen && (
          <div className="menu-pop">
            <div className="menu-title">{profile?.name || "Account"}</div>
            <Link to="/settings" className="menu-link">Settings</Link>
            <button className="menu-link" onClick={() => {
              if (confirm("Clear all data and restart onboarding?")) { localStorage.clear(); location.href = "/"; }
            }}>Reset app</button>
          </div>
        )}
      </div>
    </div>
  );
};

const PrivacyNote = () => <div className="note"><strong>Privacy:</strong> Demo only. Data stays in your browser.</div>;

/* ---------- Onboarding: 1) Sign Up ---------- */
const SignUp = ({ profile, setProfile }) => {
  const nav = useNavigate();
  const [form, setForm] = useState(profile || {
    name: "", country: "Colombia", dob: "", email: "",
    anonymousDefault: true,
    accessibility: { largeText: false, highContrast: false, reducedMotion: false }
  });
  const submit = (e) => { e.preventDefault(); setProfile(form); nav("/onboarding/questionnaire"); };

  return (
    <div className="center-wrap">
      <div className="card narrow">
        <h1>Create your Talk2Me account</h1>
        <form onSubmit={submit} className="grid">
          <label>Preferred name
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>Email
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>Country
            <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Date of birth
            <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
          </label>

          <div className="row">
            <label className="chip">
              <input type="checkbox" checked={form.anonymousDefault}
                     onChange={e => setForm({ ...form, anonymousDefault: e.target.checked })} />
              Post anonymously by default
            </label>
          </div>

          {/* Accessibility toggles as buttons for reliable click behavior */}
          <div className="row">
            <span>Accessibility:</span>
            <button type="button"
              className={`chip ${form.accessibility.largeText ? "chip-on" : ""}`}
              onClick={() => setForm({ ...form, accessibility: { ...form.accessibility, largeText: !form.accessibility.largeText }})}>
              Large text
            </button>
            <button type="button"
              className={`chip ${form.accessibility.highContrast ? "chip-on" : ""}`}
              onClick={() => setForm({ ...form, accessibility: { ...form.accessibility, highContrast: !form.accessibility.highContrast }})}>
              High contrast
            </button>
            <button type="button"
              className={`chip ${form.accessibility.reducedMotion ? "chip-on" : ""}`}
              onClick={() => setForm({ ...form, accessibility: { ...form.accessibility, reducedMotion: !form.accessibility.reducedMotion }})}>
              Reduced motion
            </button>
          </div>

          <button className="btn primary">Next: Questionnaire</button>
        </form>
        <PrivacyNote />
      </div>
    </div>
  );
};

/* ---------- Onboarding: 2) Questionnaire ---------- */
const OnboardingQuestionnaire = ({ profile, setProfile }) => {
  const nav = useNavigate();
  const [q, setQ] = useState(profile?.questionnaire || {
    emotionalHistory: "", stressLevel: "Medium", copingPrefs: [], communicationStyle: "Gentle"
  });

  const togglePref = (p) => setQ(s => {
    const has = s.copingPrefs.includes(p);
    return { ...s, copingPrefs: has ? s.copingPrefs.filter(x => x !== p) : [...s.copingPrefs, p] };
  });

  const submit = (e) => {
    e.preventDefault();
    setProfile({ ...profile, questionnaire: q });
    nav("/onboarding/coach");
  };

  return (
    <div className="center-wrap">
      <div className="card narrow">
        <h1>Your wellness profile</h1>
        <form onSubmit={submit} className="grid">
          <label>Emotional history (optional)
            <textarea rows="4" value={q.emotionalHistory}
                      onChange={e => setQ({ ...q, emotionalHistory: e.target.value })}
                      placeholder="Anything you'd like your AI coach to know…" />
          </label>
          <label>Current stress level
            <select value={q.stressLevel} onChange={e => setQ({ ...q, stressLevel: e.target.value })}>
              {["Low", "Medium", "High", "Very high"].map(x => <option key={x}>{x}</option>)}
            </select>
          </label>
          <div>
            <div className="lbl">Coping preferences</div>
            <div className="chips">
              {COPING_PREFS.map(p => (
                <button type="button" key={p}
                  className={`chip ${q.copingPrefs.includes(p) ? "chip-on" : ""}`}
                  onClick={() => togglePref(p)}>{p}</button>
              ))}
            </div>
          </div>
          <label>Communication style
            <select value={q.communicationStyle} onChange={e => setQ({ ...q, communicationStyle: e.target.value })}>
              {COMM_STYLES.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <button className="btn primary">Next: Choose your AI coach</button>
        </form>
      </div>
    </div>
  );
};

/* ---------- Onboarding: 3) Choose AI Coach ---------- */
const CoachPicker = ({ profile, setProfile }) => {
  const nav = useNavigate();
  const [coach, setCoach] = useState(profile?.coach || {
    gender: "Female", country: profile?.country || "Colombia", hair: "Straight",
    language: "English", style: profile?.questionnaire?.communicationStyle || "Gentle",
    avatarUrl: ""
  });
  const submit = (e) => { e.preventDefault(); setProfile({ ...profile, coach }); nav("/home"); };

  return (
    <div className="center-wrap">
      <div className="card narrow">
        <h1>Choose your AI coach</h1>
        <form onSubmit={submit} className="grid">
          <label>Country
            <select value={coach.country} onChange={e => setCoach({ ...coach, country: e.target.value })}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Language
            <select value={coach.language} onChange={e => setCoach({ ...coach, language: e.target.value })}>
              {["English", "Spanish", "Hindi", "Mandarin", "Arabic"].map(l => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label>Gender
            <select value={coach.gender} onChange={e => setCoach({ ...coach, gender: e.target.value })}>
              <option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option>
            </select>
          </label>
          <label>Hair
            <select value={coach.hair} onChange={e => setCoach({ ...coach, hair: e.target.value })}>
              <option>Straight</option><option>Wavy</option><option>Curly</option><option>Short</option><option>Covered</option>
            </select>
          </label>
          <label>Communication style
            <select value={coach.style} onChange={e => setCoach({ ...coach, style: e.target.value })}>
              {COMM_STYLES.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>Avatar image URL (optional)
            <input placeholder="Paste a portrait URL…" value={coach.avatarUrl}
                   onChange={e => setCoach({ ...coach, avatarUrl: e.target.value })} />
          </label>
          <button className="btn primary">Finish</button>
        </form>
        <PrivacyNote />
      </div>
    </div>
  );
};

/* ---------- Home ---------- */
const ActionCard = ({ to, title, sub }) => (
  <Link to={to} className="action-card">
    <div className="action-title">{title}</div>
    <div className="action-sub">{sub}</div>
  </Link>
);

const DailyReads = () => {
  const reads = [
    "You’re not behind—different path, same goal.",
    "2‑minute breath reset.",
    "Visa stress ≠ your identity.",
    "Short walk = mood boost."
  ];
  return <div className="reads">{reads.map((r, i) => <div key={i} className="read-card">{r}</div>)}</div>;
};

const MoodMeter = ({ onSave }) => {
  const [v, setV] = useState(3);
  const [note, setNote] = useState("");
  const label = ["😞", "🙁", "😐", "🙂", "😄"][v - 1];
  return (
    <div className="mood-box">
      <div className="mood-scale">
        <input type="range" min="1" max="5" value={v} onChange={e => setV(+e.target.value)} />
        <div className="mood-bar" />
        <div className="mood-emoji">{label}</div>
      </div>
      <div className="row">
        <input className="grow" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note…" />
        <button className="btn primary" onClick={() => onSave({ value: v, note, ts: Date.now() })}>Save</button>
      </div>
    </div>
  );
};

const Home = ({ profile, moods, addMood, manualOffline, setManualOffline, openHelp }) => {
  const name = profile?.name || "there";
  return (
    <div className="card home">
      <div className="home-head">
        <h1>Hello {name}, what do you feel like doing?</h1>
      </div>

      <div className="actions4">
        <ActionCard to="/journal" title="Daily Journal" sub="Reflect in 60 seconds" />
        <ActionCard to="/coach" title="Talk to AI Coach" sub="Private, 24/7 support" />
        <ActionCard to="/therapists" title="Talk to Real Therapist" sub="When you’re ready" />
        <ActionCard to="/community" title="Join Community" sub="Connect with peers" />
      </div>

      <div className="grid-2 gap mt">
        <div>
          <h3>Mood check‑in</h3>
          <MoodMeter onSave={addMood} />
          <h4 className="mt">Recent moods</h4>
          <ul className="list">
            {moods.slice(-5).reverse().map((m, i) => (
              <li key={i}>{new Date(m.ts).toLocaleString()} — {["Very low","Low","OK","Good","Great"][m.value-1]}{m.note ? ` — ${m.note}` : ""}</li>
            ))}
            {moods.length === 0 && <li className="muted">No entries yet</li>}
          </ul>
        </div>
        <div>
          <h3>Daily reads</h3>
          <DailyReads />
        </div>
      </div>

      {/* floating controls */}
      <button className={cn("fab left")} onClick={() => setManualOffline(x => !x)} title="Toggle offline">
        {manualOffline ? "🟧 Offline" : "🟢 Online"}
      </button>
      <div className="fab-right">
        <button className="fab" onClick={openHelp} title="Get assistance">🆘</button>
        <button className="fab" title="Accessibility options" onClick={() => alert("Open accessibility center (demo)")}>&#9855;</button>
      </div>
    </div>
  );
};

/* ---------- Journal ---------- */
const Journal = ({ entries, setEntries }) => {
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    setEntries([...entries, { id: crypto.randomUUID(), ts: Date.now(), text }]);
    setText("");
  };
  return (
    <div className="card">
      <h1>Daily journal</h1>
      <textarea rows="8" value={text} onChange={e => setText(e.target.value)} placeholder="Free write. Stored locally." />
      <div className="row end">
        <button className="btn" onClick={() => setText("")}>Clear</button>
        <button className="btn primary" onClick={add}>Save</button>
      </div>
      <h3 className="mt">Entries</h3>
      {!entries.length ? <div className="muted">Nothing yet.</div> :
        <ul className="list">{entries.slice().reverse().map(e => <li key={e.id}><strong>{new Date(e.ts).toLocaleString()}</strong><br />{e.text}</li>)}</ul>}
    </div>
  );
};

/* ---------- AI Coach (with avatar) ---------- */
const styleTone = (style) =>
  style === "Direct" ? "Here’s the straight take:" :
  style === "Encouraging" ? "You’ve got this—" :
  style === "Humorous" ? "Tiny joke break 🚀:" :
  "Gently:";

const coachReply = (msg, mood = 3, style = "Gentle", language = "English") => {
  let body = "Thanks for sharing. One grounding action, then a 10‑minute next step.";
  const t = msg.toLowerCase();
  if (t.includes("visa") || t.includes("opt") || t.includes("h1b")) body = "Immigration worry is heavy. Pick one controllable step (email ISSS, list docs, 10‑min plan).";
  else if (t.includes("family")) body = "Family pressure mixes with care. Try a boundary script for today.";
  const map = { English: body, Spanish: "Un paso pequeño ahora: " + body, Hindi: "Ek chhota agla kadam: " + body, Mandarin: "选择一个小的下一步：" + body, Arabic: "خطوة صغيرة تالية: " + body };
  return `${styleTone(style)} ${map[language] || body}`;
};

const AICoach = ({ profile }) => {
  const [moods] = useLocalStorage("moods", []);
  const last = moods[moods.length - 1]?.value ?? 3;
  const avatar = "/avatars/coach_colombia_female.png";
  const [chat, setChat] = useLocalStorage("coach-chat", [{ who: "bot", text: "Hi—this is a stigma‑free space. What’s on your mind?" }]);
  const [msg, setMsg] = useState("");
  const send = () => {
    if (!msg.trim()) return;
    const u = { who: "me", text: msg.trim() };
    const b = { who: "bot", text: coachReply(msg.trim(), last, profile?.coach?.style, profile?.coach?.language) };
    setChat([...chat, u, b]);
    setMsg("");
  };
  return (
    <div className="card">
        <div className="coach-header" style={{flexDirection: "column", alignItems: "center"}}>
        <img src={avatar} alt="AI Coach" className="coach-avatar" style={{width:"200px", height:"200px", marginBottom:"12px"}} />
        <div className="coach-name">Your Talk2Me Coach</div>
        <div className="coach-sub">{profile?.coach?.country} • {profile?.coach?.language} • {profile?.coach?.style}</div>
      </div>
      <div className="chat">
        {chat.map((c, i) =>
          <div key={i} className={cn("bubble", c.who === "me" ? "me" : "bot")}>
            {c.who === "bot" && <img src={avatar} className="bubble-avatar" alt="bot" />}
            <div>{c.text}</div>
          </div>
        )}
      </div>
      <div className="row">
        <input className="grow" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type here…" />
        <button className="btn primary" onClick={send}>Send</button>
      </div>
      <div className="muted mt">Demo logic only—front‑end stub.</div>
    </div>
  );
};

/* ---------- Communities ---------- */
const Community = ({ circles, setCircles, anonFeed, setAnonFeed, defaultAnon }) => {
  const [post, setPost] = useState("");
  const [asAnon, setAsAnon] = useState(defaultAnon);
  const toggleJoin = id => setCircles(circles.map(c => c.id === id ? ({ ...c, joined: !c.joined }) : c));
  const moderate = t => t.replace(/(suicide|hate|kill)/ig, "⚠️");
  const submit = () => {
    if (!post.trim()) return;
    setAnonFeed([{ id: crypto.randomUUID(), ts: Date.now(), who: asAnon ? "Anonymous" : "You", text: moderate(post) }, ...anonFeed]);
    setPost("");
  };
  return (
    <div className="grid-2 gap">
      <div className="card">
        <h1>Communities</h1>
        <ul className="list">
          {circles.map(c => (
            <li key={c.id} className="row between">
              <span><Link to={`/community/${c.id}`} className="menu-link">{c.name}</Link></span>
              <button className="btn small" onClick={() => toggleJoin(c.id)}>{c.joined ? "Leave" : "Join"}</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h1>Anonymous Expression Wall</h1>
        <div className="row">
          <input className="grow" value={post} onChange={e => setPost(e.target.value)} placeholder="Share something supportive…" />
          <label className="chip"><input type="checkbox" checked={asAnon} onChange={e => setAsAnon(e.target.checked)} /> Post anonymously</label>
          <button className="btn primary" onClick={submit}>Post</button>
        </div>
        {!anonFeed.length ? <div className="muted mt">No posts yet.</div> :
          <ul className="list mt">{anonFeed.map(a => <li key={a.id}><strong>{a.who}</strong> • {new Date(a.ts).toLocaleString()}<br />{a.text}</li>)}</ul>}
      </div>
    </div>
  );
};

/* Community detail (mock) */
const CommunityDetail = ({ circles }) => {
  const { id } = useParams();
  const c = circles.find(x => x.id === id);
  if (!c) return (
    <div className="card">
      <h1>Community not found</h1>
      <Link to="/community" className="btn">Back to communities</Link>
    </div>
  );
  return (
    <div className="card">
      <h1>{c.name}</h1>
      <div className="muted">Demo page. Here you’d list posts, events, and resources scoped to this group.</div>
      <div className="mt"><Link to="/community" className="btn">← Back</Link></div>
    </div>
  );
};

/* ---------- Therapist Finder (mock) ---------- */
const TherapistFinder = ({ profile, moods, entries }) => {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  const data = [
    { id: "t1", name: "Dr. Ana López", specialty: "Cross‑cultural counseling", location: "Austin, TX", email:"ana@example.com" },
    { id: "t2", name: "Dr. Sameer Patel", specialty: "Stress & Adjustment", location: "Austin, TX", email:"sameer@example.com" },
    { id: "t3", name: "Casa Esperanza", specialty: "Spanish‑speaking support", location: "Austin, TX", email:"frontdesk@casa.org" },
  ].filter(t => !q || (t.name+t.specialty+t.location).toLowerCase().includes(q.toLowerCase()));

  const handleExport = () => {
    const summary = buildAISummary({ profile, moods, entries });
    const safeName = (profile?.name || "student").replace(/\s+/g,"_");
    downloadText(`Talk2Me_Summary_${safeName}.txt`, summary);
  };

  const handleCopy = async () => {
    const summary = buildAISummary({ profile, moods, entries });
    try { await navigator.clipboard.writeText(summary); alert("Summary copied to clipboard."); }
    catch { alert("Copy failed. Export the .txt instead."); }
  };

  const sel = data.find(d => d.id === selected);

  return (
    <div className="card">
      <h1>Find a therapist</h1>
      <div className="row">
        <input className="grow" placeholder="Search by location or specialty…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <ul className="list mt">
        {data.map((t) => (
          <li key={t.id} className="row between">
            <div>
              <strong>{t.name}</strong> — {t.specialty} • {t.location}
              <div className="muted">{t.email}</div>
            </div>
            <div className="row">
              <button className="btn small" onClick={() => setSelected(t.id)}>{selected===t.id ? "Selected" : "Select"}</button>
              <button className="btn small">Contact</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt">
        <h3>AI‑Powered Therapist Summary</h3>
        <div className="muted">Export a concise, culturally aware overview of your mood trends, coping patterns, and key themes.</div>
        <div className="row mt">
          <button className="btn primary" onClick={handleExport}>Export .txt</button>
          <button className="btn" onClick={handleCopy}>Copy to clipboard</button>
          {sel && <div className="muted">Ready to share with: <strong>{sel.name}</strong></div>}
        </div>
      </div>

      <div className="muted mt">Demo only — no real transmission. Use the exported file or paste the copied text into an email to your therapist.</div>
    </div>
  );
};

/* ---------- Settings ---------- */
const Settings = ({ profile, setProfile }) => {
  const [p, setP] = useState(profile);
  useEffect(() => {
    document.documentElement.dataset.large = p?.accessibility?.largeText ? "1" : "0";
    document.documentElement.dataset.contrast = p?.accessibility?.highContrast ? "1" : "0";
  }, [p]);

  return (
    <div className="card">
      <h1>Settings</h1>
      <h3>Profile</h3>
      <div className="grid">
        <label>Name<input value={p.name} onChange={e => setP({ ...p, name: e.target.value })} /></label>
        <label>Country
          <select value={p.country} onChange={e => setP({ ...p, country: e.target.value })}>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Date of birth<input type="date" value={p.dob} onChange={e => setP({ ...p, dob: e.target.value })} /></label>
      </div>

      <h3 className="mt">Coach</h3>
      <div className="grid">
        <label>Language
          <select value={p.coach?.language} onChange={e => setP({ ...p, coach: { ...p.coach, language: e.target.value } })}>
            {["English", "Spanish", "Hindi", "Mandarin", "Arabic"].map(l => <option key={l}>{l}</option>)}
          </select>
        </label>
        <label>Communication style
          <select value={p.coach?.style} onChange={e => setP({ ...p, coach: { ...p.coach, style: e.target.value } })}>
            {COMM_STYLES.map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Avatar URL
          <input value={p.coach?.avatarUrl || ""} onChange={e => setP({ ...p, coach: { ...p.coach, avatarUrl: e.target.value } })} placeholder="Paste a portrait URL…" />
        </label>
      </div>

      <div className="row end mt">
        <button className="btn" onClick={() => setP(profile)}>Discard</button>
        <button className="btn primary" onClick={() => setProfile(p)}>Save</button>
      </div>

      <div className="row mt">
        <button className="btn danger" onClick={() => { if (confirm("Clear all data and restart?")) { localStorage.clear(); location.href = "/"; } }}>Reset App & Clear Data</button>
      </div>
    </div>
  );
};

/* ---------- root ---------- */
export default function App() {
  const [profile, setProfile] = useLocalStorage("profile", null);
  const [entries, setEntries] = useLocalStorage("journal", []);
  const [moods, setMoods] = useLocalStorage("moods", []);
  const [circles, setCircles] = useLocalStorage("circles", [
    { id: "c1", name: "First‑year CS – International", joined: true },
    { id: "c2", name: "Women in STEM (Grad)", joined: true },
    { id: "c3", name: "Mindful Mondays – Short Breaths", joined: false },
  ]);
  const [anonFeed, setAnonFeed] = useLocalStorage("anon-feed", []);
  const [lang, setLang] = useLocalStorage("ui-lang", "English");
  const [manualOffline, setManualOffline] = useLocalStorage("manual-offline", false);
  const [showNotif, setShowNotif] = useState(false);
  const location = useLocation();
  const hideNav = location.pathname.startsWith("/onboarding");

  useEffect(() => {
    document.documentElement.dataset.large = profile?.accessibility?.largeText ? "1" : "0";
    document.documentElement.dataset.contrast = profile?.accessibility?.highContrast ? "1" : "0";
  }, [profile]);

  const addMood = m => setMoods([...moods, m]);

  return (
    <div className="wrap">
      <Nav>
        {!hideNav && (
          <TopActions
            profile={profile}
            lang={lang}
            setLang={setLang}
            communities={circles}
            onNotifClick={() => setShowNotif(s => !s)}
          />
        )}
      </Nav>

      {showNotif && !hideNav && (
        <div className="notif">
          <div className="notif-title">Notifications</div>
          <div className="notif-item">Tea & Talk starts in 30 min near ISSS.</div>
          <div className="notif-item">New post in “Women in STEM (Grad)”.</div>
        </div>
      )}

      <Routes>
        <Route path="/" element={profile ? (
          <Home profile={profile} moods={moods} addMood={addMood}
            manualOffline={manualOffline} setManualOffline={setManualOffline}
            openHelp={() => alert("Assistance (demo)")} />
        ) : <SignUp profile={profile} setProfile={setProfile} />} />

        {/* Onboarding */}
        <Route path="/onboarding/questionnaire" element={<OnboardingQuestionnaire profile={profile} setProfile={setProfile} />} />
        <Route path="/onboarding/coach" element={<CoachPicker profile={profile} setProfile={setProfile} />} />

        {/* Main pages */}
        <Route path="/home" element={<Home profile={profile} moods={moods} addMood={addMood}
          manualOffline={manualOffline} setManualOffline={setManualOffline}
          openHelp={() => alert("Assistance (demo)")} />} />
        <Route path="/journal" element={<Journal entries={entries} setEntries={setEntries} />} />
        <Route path="/coach" element={<AICoach profile={profile} />} />
        <Route path="/community" element={<Community circles={circles} setCircles={setCircles}
          anonFeed={anonFeed} setAnonFeed={setAnonFeed}
          defaultAnon={profile?.anonymousDefault ?? true} />} />
        <Route path="/community/:id" element={<CommunityDetail circles={circles} />} />
        <Route path="/therapists" element={<TherapistFinder />} />
        <Route path="/settings" element={<Settings profile={profile} setProfile={setProfile} />} />
      </Routes>

      {!hideNav && <footer className="footer"><PrivacyNote /></footer>}
    </div>
  );
}
