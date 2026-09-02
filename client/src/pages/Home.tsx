// Orbital Command reminder: the map is the instrument; amber signals active state; never fabricate scientific output.
import { useEffect, useMemo, useRef, useState } from "react";
import { MapView } from "@/components/Map";
import { requestInference } from "@/lib/api";
import { demoResponseFor, demoScenes } from "@/lib/demoData";
import { coordinateErrors, isValidCoordinates } from "@/lib/validation";
import type { InferenceResponse, ProcessingStage, ResultMode } from "@/types/inference";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  Check,
  ChevronDown,
  Crosshair,
  Expand,
  Gauge,
  Globe2,
  Layers3,
  LocateFixed,
  Minus,
  MousePointer2,
  Plus,
  RefreshCcw,
  Satellite,
  SlidersHorizontal,
  Sparkles,
  Target,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";

const asset = {
  mark: "/manus-storage/sudo-aeris-mark_8f547daa.png",
  contour: "/manus-storage/sudo-aeris-contour-texture_d5f2c335.png",
  orbit: "/manus-storage/sudo-aeris-orbit-grid_bc5161d0.png",
  signal: "/manus-storage/sudo-aeris-signal-dots_f32513be.png",
  sentinel: "/manus-storage/sudo-aeris-sentinel-reference_d2553e33.jpg",
};

const stages = [
  "LOCATION LOCKED",
  "SEARCHING SENTINEL-2",
  "ACQUIRING SATELLITE DATA",
  "PREPROCESSING",
  "S2DR3 SUPER-RESOLUTION",
  "GENERATING ANALYSIS",
  "COMPLETE",
];

const fmt = (value?: number | string | null) => value === undefined || value === null || value === "" ? "—" : String(value);

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
      <div className="relative grid size-10 place-items-center border border-amber-400/40 bg-[#151a22] shadow-[0_0_0_3px_rgba(244,185,66,0.04)]">
        <img src={asset.mark} alt="SUDO AERIS mark" className="size-7 object-contain" />
        <span className="absolute -right-px -top-px size-1.5 bg-amber-400" />
      </div>
      {!compact && <div><div className="font-display text-sm font-bold tracking-[0.22em] text-slate-100">SUDO AERIS</div><div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">Remote sensing / 01</div></div>}
    </div>
  );
}

function SectionLabel({ index, children, action }: { index: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <div className="mb-3 flex items-center justify-between border-b border-white/8 pb-2"><div className="flex items-center gap-2"><span className="font-mono text-[10px] text-amber-400">{index}</span><span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{children}</span></div>{action}</div>;
}

function MapSurface({ latitude, longitude, onSelect }: { latitude: number; longitude: number; onSelect: (lat: number, lon: number) => void }) {
  const markerRef = useRef<google.maps.Marker | null>(null);
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const handleMapReady = (map: google.maps.Map) => {
    listenersRef.current.forEach((listener) => listener.remove());
    markerRef.current?.setMap(null);
    const marker = new google.maps.Marker({ map, position: { lat: latitude, lng: longitude }, draggable: true, title: "SUDO AERIS location lock" });
    markerRef.current = marker;
    listenersRef.current = [
      map.addListener("click", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) onSelect(event.latLng.lat(), event.latLng.lng());
      }),
      marker.addListener("dragend", () => {
        const position = marker.getPosition();
        if (position) onSelect(position.lat(), position.lng());
      }),
    ];
  };
  useEffect(() => () => { listenersRef.current.forEach((listener) => listener.remove()); markerRef.current?.setMap(null); }, []);
  return (
    <div className="relative h-full min-h-[390px] overflow-hidden bg-[#0e141b]">
      <div className="absolute inset-0 bg-[#0d151c]" style={{ backgroundImage: `url(${asset.contour})`, backgroundSize: "cover", opacity: 0.62 }} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(116,145,165,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(116,145,165,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_0,rgba(6,9,13,0.04)_48%,rgba(6,9,13,0.58)_100%)]" />
      <MapView className="absolute inset-0 z-20 h-full opacity-[0.88] mix-blend-screen [filter:saturate(0.45)_contrast(1.1)]" initialCenter={{ lat: latitude, lng: longitude }} initialZoom={5} onMapReady={handleMapReady} />
      <div className="pointer-events-none absolute inset-0 z-30">
        <div className="absolute left-5 top-5 flex items-center gap-2 bg-[#0b1118]/80 px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-300 backdrop-blur-sm"><MousePointer2 className="size-3 text-amber-400" /> Click map to lock location</div>
        <div className="absolute right-5 top-5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400"><span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_#34d399]" /> Tiles online</div>
        <div className="absolute bottom-5 left-5 font-mono text-[9px] leading-5 text-slate-400"><div>BASEMAP // SATELLITE HYBRID</div><div>ZOOM 05 · WGS84 · EPSG:4326</div></div>
        <div className="absolute bottom-5 right-5 flex flex-col items-end gap-1 font-mono text-[9px] text-slate-400"><div className="flex items-center gap-2"><span className="h-px w-8 bg-slate-400" /> 100 km</div><div>© MAP DATA PROVIDERS</div></div>
      </div>
      <div className="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none"><div className="relative size-16 border border-amber-400/45"><span className="absolute left-1/2 top-[-10px] h-5 w-px bg-amber-400/70" /><span className="absolute bottom-[-10px] left-1/2 h-5 w-px bg-amber-400/70" /><span className="absolute left-[-10px] top-1/2 h-px w-5 bg-amber-400/70" /><span className="absolute right-[-10px] top-1/2 h-px w-5 bg-amber-400/70" /><div className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400 shadow-[0_0_16px_#f4b942]" /></div></div>
    </div>
  );
}

function Pipeline({ stageIndex, status }: { stageIndex: number; status: ProcessingStage }) {
  return <div className="space-y-2">{stages.map((stage, index) => { const complete = stageIndex > index || status === "complete"; const active = stageIndex === index && status === "running"; return <div key={stage} className={`flex items-center gap-3 font-mono text-[10px] tracking-[0.08em] transition-colors ${active ? "text-amber-300" : complete ? "text-slate-300" : "text-slate-600"}`}><span className={`grid size-4 place-items-center border ${complete ? "border-amber-400/70 bg-amber-400 text-[#0c1117]" : active ? "border-amber-400 text-amber-400" : "border-slate-700"}`}>{complete ? <Check className="size-3" /> : active ? <span className="size-1.5 animate-pulse bg-amber-400" /> : <span className="size-1" />}</span><span>{String(index + 1).padStart(2, "0")}</span><span className="flex-1">{stage}</span>{active && <span className="text-[9px] text-amber-400">ACTIVE</span>}</div>; })}</div>;
}

function ComparisonViewer({ result }: { result: InferenceResponse | null }) {
  const [split, setSplit] = useState(50);
  const [zoom, setZoom] = useState(1);
  const viewerRef = useRef<HTMLDivElement>(null);
  const inputUrl = result?.inputImageUrl || asset.sentinel;
  const outputUrl = result?.superResolvedImageUrl;
  const placeholder = (label: string, url?: string) => <div className="relative h-full min-h-[250px] overflow-hidden bg-[#121b22]" style={url ? { backgroundImage: `url(${url})`, backgroundSize: `${zoom * 100}%`, backgroundPosition: "center" } : {}}>{!url && <div className="absolute inset-0 bg-[linear-gradient(rgba(97,122,137,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(97,122,137,0.12)_1px,transparent_1px)] bg-[size:24px_24px]" />}<div className="absolute inset-0 grid place-items-center"><div className="text-center"><UploadCloud className="mx-auto mb-2 size-5 text-slate-600" /><div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div><div className="mt-1 font-mono text-[9px] text-slate-700">BACKEND IMAGE URL PENDING</div></div></div></div>;
  return <div ref={viewerRef} className="relative overflow-hidden border border-white/10 bg-black">
    <div className="relative h-[350px] select-none overflow-hidden" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
      {placeholder("SENTINEL-2 / 10 M INPUT", inputUrl)}
      <div className="absolute inset-y-0 right-0 overflow-hidden" style={{ width: `${100 - split}%` }}>{placeholder("S2DR3 / 1 M OUTPUT", outputUrl)}</div>
      <div className="absolute inset-y-0 z-20 w-px bg-amber-400 shadow-[0_0_18px_rgba(244,185,66,0.7)]" style={{ left: `${split}%` }}><div className="absolute left-1/2 top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-amber-300 bg-[#0b1118] text-amber-300"><SlidersHorizontal className="size-3.5" /></div></div>
    </div>
    <div className="absolute left-3 top-3 z-30 bg-[#0b1118]/85 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-300">INPUT // SENTINEL-2 REFERENCE</div><div className="absolute right-3 top-3 z-30 bg-[#0b1118]/85 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-amber-300">OUTPUT // S2DR3</div>
    <div className="flex items-center gap-3 border-t border-white/8 bg-[#0d141b] px-3 py-2"><Minus className="size-3.5 text-slate-500" /><input aria-label="Comparison slider" type="range" min="5" max="95" value={split} onChange={(event) => setSplit(Number(event.target.value))} className="h-1 flex-1 accent-[#f4b942]" /><Plus className="size-3.5 text-slate-500" /><button onClick={() => setZoom((value) => Math.min(2, Number((value + 0.2).toFixed(1))))} className="border-l border-white/10 pl-3 font-mono text-[9px] text-slate-400 hover:text-amber-300">ZOOM {zoom.toFixed(1)}×</button><button onClick={() => setZoom(1)} className="font-mono text-[9px] text-slate-500 hover:text-slate-200">RESET</button><button onClick={() => viewerRef.current?.requestFullscreen?.()} aria-label="Fullscreen comparison" className="ml-auto text-slate-500 hover:text-amber-300"><Expand className="size-3.5" /></button></div>
  </div>;
}

export default function Home() {
  const [latitude, setLatitude] = useState("27.9881");
  const [longitude, setLongitude] = useState("86.9250");
  const [date, setDate] = useState("2024-05-18");
  const [aoiSize, setAoiSize] = useState("1");
  const [mode, setMode] = useState<ResultMode>("demo");
  const [sceneId, setSceneId] = useState("scene-01");
  const [status, setStatus] = useState<ProcessingStage>("idle");
  const [stageIndex, setStageIndex] = useState(-1);
  const [result, setResult] = useState<InferenceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const errors = useMemo(() => coordinateErrors(latitude, longitude), [latitude, longitude]);
  const selectedScene = demoScenes.find((scene) => scene.id === sceneId) ?? demoScenes[0];

  useEffect(() => { if (!startedAt || status !== "running") return; const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000); return () => window.clearInterval(timer); }, [startedAt, status]);
  useEffect(() => { setLatitude(String(selectedScene.latitude)); setLongitude(String(selectedScene.longitude)); setDate(selectedScene.date); setAoiSize(String(selectedScene.aoiSize)); }, [selectedScene]);

  const selectLocation = (lat: number, lon: number) => { setLatitude(lat.toFixed(4)); setLongitude(lon.toFixed(4)); setError(null); };
  const run = async () => {
    if (!isValidCoordinates(latitude, longitude)) { setError("INVALID_COORDINATES"); return; }
    setError(null); setResult(null); setStatus("running"); setStageIndex(0); setStartedAt(Date.now()); setElapsed(0);
    if (mode === "demo") {
      for (let index = 1; index < stages.length; index += 1) { await new Promise((resolve) => window.setTimeout(resolve, 500)); setStageIndex(index); }
      await new Promise((resolve) => window.setTimeout(resolve, 450)); setResult(demoResponseFor(sceneId)); setStatus("complete");
    } else {
      try { const response = await requestInference({ latitude: Number(latitude), longitude: Number(longitude), date, aoiSize: Number(aoiSize) }); setResult(response); setStageIndex(stages.length - 1); setStatus(response.status === "success" ? "complete" : "error"); if (response.status === "error") setError(response.error?.code || "INFERENCE_FAILURE"); } catch { setStatus("error"); setError("INFERENCE_BACKEND_UNAVAILABLE"); }
    }
  };
  const reset = () => { setStatus("idle"); setStageIndex(-1); setResult(null); setError(null); setStartedAt(null); setElapsed(0); };

  return <div className="min-h-screen bg-[#080c11] text-slate-200">
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#080c11]/95 backdrop-blur-xl"><div className="flex min-h-[70px] items-center justify-between px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-7"><BrandMark /><div className="hidden h-8 w-px bg-white/10 sm:block" /><div className="hidden sm:block"><div className="font-display text-[11px] font-semibold tracking-[0.16em] text-slate-300">AI-POWERED SATELLITE SUPER-RESOLUTION</div><div className="mt-1 font-mono text-[9px] tracking-[0.08em] text-slate-600">TECHNICAL DEMONSTRATION // SIH 2026</div></div></div><div className="flex items-center gap-4"><div className="hidden items-center gap-2 border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 font-mono text-[9px] tracking-[0.15em] text-emerald-300 sm:flex"><span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" /> SYSTEM ONLINE</div><div className="hidden font-mono text-[9px] text-slate-600 md:block">UTC+05:30 · SESSION 014</div><BrandMark compact /></div></div></header>
    <aside className="fixed bottom-0 left-0 top-[70px] z-40 hidden w-[64px] border-r border-white/8 bg-[#080c11] lg:flex lg:flex-col lg:items-center lg:justify-between lg:py-5"><div className="flex flex-col items-center gap-6"><div className="grid size-10 place-items-center border border-amber-400/40 bg-[#151a22]"><img src={asset.mark} alt="SUDO AERIS" className="size-7 object-contain" /></div><div className="h-px w-6 bg-white/10" /><div className="flex flex-col items-center gap-5 text-slate-600"><Activity className="size-4 text-amber-400" /><Crosshair className="size-4" /><Satellite className="size-4" /><Gauge className="size-4" /></div></div><div className="font-mono text-[8px] tracking-[0.18em] text-slate-700 [writing-mode:vertical-rl]">ORBITAL COMMAND</div></aside>
    <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7 lg:pl-[88px]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500"><span className="h-px w-8 bg-slate-600" /> Mission workspace / analysis</div><h1 className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-100 sm:text-3xl">Resolve the scene. Keep the evidence.</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Location lock → Sentinel-2 acquisition → S2DR3 output. GPU inference remains staged behind this interface.</p></div><div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.13em] text-slate-500"><span className="border border-white/10 px-2 py-1.5">WGS84</span><span className="border border-white/10 px-2 py-1.5">GPU INFERENCE STAGED</span></div></div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_360px]">
        <section className="relative overflow-hidden border border-white/10 bg-[#0c1219] shadow-2xl"><div className="absolute right-0 top-0 h-24 w-80 bg-cover opacity-25" style={{ backgroundImage: `url(${asset.orbit})` }} /><div className="relative flex items-center justify-between border-b border-white/8 px-4 py-3"><div className="flex items-center gap-2"><Globe2 className="size-4 text-amber-400" /><span className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">Interactive location lock</span></div><div className="font-mono text-[9px] text-slate-600">MAP REF / 001</div></div><div className="relative h-[390px] sm:h-[500px]"><MapSurface latitude={Number(latitude) || 0} longitude={Number(longitude) || 0} onSelect={selectLocation} /></div><div className="grid grid-cols-2 border-t border-white/8 sm:grid-cols-4"><div className="border-r border-white/8 px-4 py-3"><div className="font-mono text-[9px] text-slate-600">LATITUDE</div><div className="mt-1 font-mono text-sm text-amber-300">{Number(latitude || 0).toFixed(4)}°</div></div><div className="border-r border-white/8 px-4 py-3"><div className="font-mono text-[9px] text-slate-600">LONGITUDE</div><div className="mt-1 font-mono text-sm text-amber-300">{Number(longitude || 0).toFixed(4)}°</div></div><div className="border-r border-white/8 px-4 py-3"><div className="font-mono text-[9px] text-slate-600">DATUM</div><div className="mt-1 font-mono text-sm text-slate-300">WGS84</div></div><div className="px-4 py-3"><div className="font-mono text-[9px] text-slate-600">LOCK STATE</div><div className="mt-1 flex items-center gap-2 font-mono text-sm text-emerald-300"><LocateFixed className="size-3.5" /> LOCKED</div></div></div></section>
        <aside className="border border-white/10 bg-[#0c1219] shadow-2xl"><div className="border-b border-white/8 px-5 py-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Target className="size-4 text-amber-400" /><span className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">Acquisition controls</span></div><span className={`border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] ${mode === "demo" ? "border-amber-400/25 text-amber-300" : "border-sky-400/25 text-sky-300"}`}>{mode === "demo" ? "DEMO / CACHED" : "LIVE INFERENCE"}</span></div><p className="mt-2 text-xs leading-5 text-slate-500">Select a scene or enter a coordinate. The GPU workload remains backend-side.</p></div><div className="space-y-5 p-5"><div><SectionLabel index="01">Operating mode</SectionLabel><div className="grid grid-cols-2 gap-2">{(["demo", "live"] as ResultMode[]).map((item) => <button key={item} onClick={() => { setMode(item); reset(); }} className={`border px-3 py-2.5 text-left transition ${mode === item ? "border-amber-400/55 bg-amber-400/8 text-amber-300" : "border-white/10 bg-[#101821] text-slate-500 hover:border-white/20"}`}><div className="font-mono text-[10px] uppercase tracking-[0.13em]">{item === "demo" ? "Demo / cached" : "Live inference"}</div><div className="mt-1 text-[10px] text-slate-600">{item === "demo" ? "Instant staged scene" : "POST /api/inference"}</div></button>)}</div></div>{mode === "demo" && <div><SectionLabel index="02" action={<span className="font-mono text-[9px] text-slate-600">{demoScenes.length} AVAILABLE</span>}>Cached scenes</SectionLabel><div className="relative"><select value={sceneId} onChange={(event) => { setSceneId(event.target.value); reset(); }} className="w-full appearance-none border border-white/10 bg-[#101821] px-3 py-3 pr-8 font-mono text-[10px] uppercase tracking-[0.1em] text-slate-300 outline-none focus:border-amber-400/60"><option value="scene-01">Himalayan foothill / Scene 01</option><option value="scene-02">Coastal delta / Scene 02</option><option value="scene-03">Deccan plateau / Scene 03</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-4 text-slate-500" /></div></div>}
          <div><SectionLabel index={mode === "demo" ? "03" : "02"}>Coordinates</SectionLabel><div className="grid grid-cols-2 gap-3"><label className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">Latitude<input value={latitude} onChange={(event) => setLatitude(event.target.value)} inputMode="decimal" className={`mt-2 w-full border bg-[#101821] px-3 py-2.5 font-mono text-sm text-slate-200 outline-none transition focus:border-amber-400/60 ${errors.latitude ? "border-red-400/70" : "border-white/10"}`} /></label><label className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">Longitude<input value={longitude} onChange={(event) => setLongitude(event.target.value)} inputMode="decimal" className={`mt-2 w-full border bg-[#101821] px-3 py-2.5 font-mono text-sm text-slate-200 outline-none transition focus:border-amber-400/60 ${errors.longitude ? "border-red-400/70" : "border-white/10"}`} /></label></div>{(errors.latitude || errors.longitude) && <div className="mt-2 flex items-start gap-2 font-mono text-[9px] leading-4 text-red-300"><AlertTriangle className="mt-0.5 size-3 shrink-0" /> INVALID COORDINATES · {errors.latitude || errors.longitude}</div>}</div>
          <div><SectionLabel index={mode === "demo" ? "04" : "03"}>Acquisition</SectionLabel><div className="grid grid-cols-2 gap-3"><label className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full border border-white/10 bg-[#101821] px-3 py-2.5 font-mono text-[11px] text-slate-300 outline-none focus:border-amber-400/60" /></label><label className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">AOI size<select value={aoiSize} onChange={(event) => setAoiSize(event.target.value)} className="mt-2 w-full border border-white/10 bg-[#101821] px-3 py-2.5 font-mono text-[11px] text-slate-300 outline-none focus:border-amber-400/60"><option value="1">1 × 1 km</option><option value="2">2 × 2 km</option><option value="5">5 × 5 km</option><option value="10">10 × 10 km</option></select></label></div></div>
          <button onClick={run} disabled={status === "running"} className="group flex w-full items-center justify-between border border-amber-400/70 bg-amber-400 px-4 py-3.5 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[#10151b] transition hover:bg-amber-300 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"><span className="flex items-center gap-2">{status === "running" ? <Activity className="size-4 animate-pulse" /> : <Zap className="size-4" />}{status === "running" ? "Processing staged workload" : "Run SUDO AERIS"}</span><ArrowDownToLine className="size-4 rotate-[-90deg] transition-transform group-hover:translate-x-1" /></button>
          <div className="border-t border-white/8 pt-4"><div className="mb-3 flex items-center justify-between"><div className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500">Processing pipeline</div>{status === "running" && <div className="font-mono text-[9px] text-amber-300">{elapsed}s elapsed</div>}{status === "complete" && <button onClick={reset} className="flex items-center gap-1 font-mono text-[9px] text-slate-500 hover:text-amber-300"><RefreshCcw className="size-3" /> RESET</button>}</div><Pipeline stageIndex={stageIndex} status={status} /></div>
          {error && <div className="flex items-start gap-2 border border-red-400/25 bg-red-400/5 p-3 font-mono text-[10px] leading-5 text-red-300"><X className="mt-0.5 size-3 shrink-0" /><div><div className="font-bold tracking-[0.12em]">{error}</div><div className="mt-1 text-red-200/60">{error === "INVALID_COORDINATES" ? "Review the location lock before requesting inference." : "No raw backend trace is exposed. Retry or return to analysis."}</div></div></div>}
        </div></aside>
      </div>
      <section className="mt-5 border border-white/10 bg-[#0c1219] shadow-2xl"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-3"><div className="flex items-center gap-2"><Layers3 className="size-4 text-amber-400" /><span className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">Before / after comparison</span><span className="ml-2 border border-white/10 px-2 py-1 font-mono text-[9px] text-slate-500">RESULT VIEW</span></div><div className="font-mono text-[9px] text-slate-600">{result ? (mode === "demo" ? "DEMO / CACHED RESULT" : "LIVE INFERENCE") : "AWAITING RESULT"}</div></div><div className="p-4"><ComparisonViewer result={result} /></div></section>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_1fr]"><section className="border border-white/10 bg-[#0c1219] p-5"><SectionLabel index="05" action={<Gauge className="size-3.5 text-slate-600" />}>Technical metrics</SectionLabel><div className="grid grid-cols-2 gap-px bg-white/8 sm:grid-cols-3">{[["INPUT RESOLUTION", fmt(result?.metrics?.inputResolution || "10 m")],["OUTPUT RESOLUTION", fmt(result?.metrics?.outputResolution || "1 m")],["MODEL", fmt(result?.metrics?.model || "S2DR3")],["PSNR", fmt(result?.metrics?.psnr)],["SSIM", fmt(result?.metrics?.ssim)],["PROCESSING TIME", result?.metrics?.processingTime ? `${result.metrics.processingTime}s` : "—"]].map(([label, value]) => <div key={label} className="bg-[#0c1219] px-3 py-3"><div className="font-mono text-[9px] text-slate-600">{label}</div><div className="mt-1 font-mono text-sm text-slate-200">{value}</div></div>)}</div></section><section className="border border-white/10 bg-[#0c1219] p-5"><SectionLabel index="06" action={<Sparkles className="size-3.5 text-slate-600" />}>Analysis output</SectionLabel><div className="relative min-h-[126px] overflow-hidden border border-white/8 bg-[#101821] p-4"><div className="absolute inset-0 bg-cover opacity-10" style={{ backgroundImage: `url(${asset.signal})` }} /><div className="relative flex h-full min-h-[90px] flex-col justify-center"><div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] text-slate-400"><Satellite className="size-3.5 text-amber-400" /> ANALYSIS DATA NOT AVAILABLE</div><p className="mt-2 max-w-md text-xs leading-5 text-slate-600">Detected features, candidate change regions, and confidence overlays will populate only when supplied by the inference backend.</p></div></div></section></div>
      <footer className="mt-7 flex flex-col justify-between gap-3 border-t border-white/8 py-5 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600 sm:flex-row"><div>© SUDO AERIS · SIH TECHNICAL DEMONSTRATION</div><div className="flex gap-4"><span>FRONTEND LAYER</span><span>·</span><span>INFERENCE BACKEND REPLACEABLE</span></div></footer>
    </main>
  </div>;
}
