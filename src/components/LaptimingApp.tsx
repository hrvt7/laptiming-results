"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Result } from "@/app/page";

/* ─── Utilities ─── */

function getBrand(car: string): string {
  const map: Record<string, string[]> = {
    BMW: ["BMW", "BFR BMW"], Audi: ["Audi"], Mercedes: ["Mercedes"],
    Volkswagen: ["VW", "Volkswagen"], Porsche: ["Porsche"], Honda: ["Honda"],
    Toyota: ["Toyota"], Mazda: ["Mazda"], Ford: ["Ford"], Renault: ["Renault"],
    Opel: ["Opel"], Subaru: ["Subaru"], Mitsubishi: ["Mitsubishi"],
    Nissan: ["Nissan"], Hyundai: ["Hyundai"], Skoda: ["Skoda"],
    Seat: ["Seat", "Cupra", "Ateca"], Alfa: ["Alfa"], Suzuki: ["Suzuki"],
    Mini: ["Mini", "MINI"], Peugeot: ["Peugeot"],
    Chevrolet: ["Chevy", "Chevrolet", "Corvette"], Ferrari: ["Ferrari"],
    Lexus: ["Lexus"], Kia: ["Kia"], Dodge: ["Dodge"], Citroen: ["Citroen"],
    Fiat: ["Fiat", "Abarth"], Lada: ["Lada"], Volvo: ["Volvo"],
    Maserati: ["Maserati"], Tesla: ["Tesla"], Dacia: ["Dacia"],
    Smart: ["Smart"], Trabant: ["Trabant"], Pontiac: ["Pontiac"],
    Infinity: ["Infinity"],
  };
  for (const [brand, prefixes] of Object.entries(map)) {
    for (const p of prefixes) { if (car.startsWith(p)) return brand; }
  }
  return "Egyéb";
}

const dc = (d: string) => d === "Jani" ? "#00e5ff" : d === "Csabi" ? "#ff3547" : "#849396";

/* ─── Main App ─── */

export function LaptimingApp({ results }: { results: Result[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const compareRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [driverFilter, setDriverFilter] = useState<"all" | "Jani" | "Csabi">("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState<"pilots" | "compare">("pilots");
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    const cp = searchParams.get("compare");
    if (cp) {
      const pos = cp.split(",").map(Number).filter((n) => !isNaN(n) && n > 0);
      if (pos.length >= 2) { setSelectedPositions(pos.slice(0, 3)); setActiveTab("compare"); }
    }
  }, [searchParams]);

  const updateURL = useCallback((pos: number[]) => {
    router.replace(pos.length >= 2 ? `?compare=${pos.join(",")}` : "/", { scroll: false });
  }, [router]);

  const toggleCompare = useCallback((pos: number) => {
    setSelectedPositions((prev) => {
      const next = prev.includes(pos) ? prev.filter((p) => p !== pos) : prev.length >= 3 ? [...prev.slice(1), pos] : [...prev, pos];
      updateURL(next);
      return next;
    });
  }, [updateURL]);

  const clearCompare = useCallback(() => { setSelectedPositions([]); updateURL([]); }, [updateURL]);

  const selectedCars = useMemo(() => selectedPositions.map((p) => results.find((r) => r.pos === p)).filter(Boolean) as Result[], [selectedPositions, results]);

  const brands = useMemo(() => {
    const s = new Set<string>();
    results.forEach((r) => s.add(getBrand(r.car)));
    return Array.from(s).sort();
  }, [results]);

  const filtered = useMemo(() => results.filter((r) => {
    if (search && !r.car.toLowerCase().includes(search.toLowerCase())) return false;
    if (driverFilter !== "all" && r.driver !== driverFilter) return false;
    if (brandFilter !== "all" && getBrand(r.car) !== brandFilter) return false;
    return true;
  }), [results, search, driverFilter, brandFilter]);

  const displayed = showAll ? filtered : filtered.slice(0, 50);
  const fastestMs = results[0]?.bestMs ?? 42200;
  const janiCars = results.filter((r) => r.driver === "Jani");
  const csabiCars = results.filter((r) => r.driver === "Csabi");

  return (
    <>
      {/* Fixed Top Nav */}
      <header className="fixed top-0 z-50 w-full h-14 flex justify-between items-center px-6"
        style={{ background: "rgba(19,19,23,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-black tracking-tighter uppercase bg-gradient-to-r from-white to-[#00e5ff] bg-clip-text text-transparent"
            style={{ fontFamily: "var(--font-orbitron)" }}>LAPTIMING</h1>
          <nav className="hidden md:flex items-center gap-6">
            {(["pilots", "compare"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="py-1 text-xs uppercase tracking-[0.2em] transition-all"
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  color: activeTab === tab ? "#00e5ff" : "#849396",
                  borderBottom: activeTab === tab ? "2px solid #00e5ff" : "2px solid transparent",
                  fontWeight: activeTab === tab ? 700 : 400,
                }}>
                {tab === "pilots" ? "Eredmények" : "Összehasonlítás"}
              </button>
            ))}
          </nav>
        </div>
        {/* Mobile tab toggle */}
        <div className="flex md:hidden gap-1">
          {(["pilots", "compare"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-3 py-1.5 text-[10px] uppercase tracking-wider"
              style={{
                fontFamily: "var(--font-space-grotesk)",
                background: activeTab === tab ? "#00e5ff" : "transparent",
                color: activeTab === tab ? "#001f24" : "#849396",
                fontWeight: 700,
              }}>
              {tab === "pilots" ? "Lista" : "VS"}
            </button>
          ))}
        </div>
      </header>

      {/* Floating comparison bar */}
      {selectedPositions.length >= 2 && (
        <div className="fixed top-14 left-0 right-0 z-40 px-6 py-2"
          style={{ background: "rgba(14,14,18,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-wider shrink-0" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>
                {selectedCars.length} autó:
              </span>
              {selectedCars.map((c, i) => (
                <span key={c.pos} className="flex items-center gap-1 shrink-0">
                  {i > 0 && <span style={{ color: "#353439" }}>vs</span>}
                  <span className="text-xs font-bold truncate max-w-[140px]" style={{ fontFamily: "var(--font-space-grotesk)", color: dc(c.driver) }}>{c.car}</span>
                </span>
              ))}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setActiveTab("compare"); compareRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider"
                style={{ background: "linear-gradient(135deg, #c3f5ff, #00e5ff)", color: "#001f24" }}>
                <span className="hidden sm:inline">Összehasonlítás</span><span className="sm:hidden">VS</span>
              </button>
              <button onClick={clearCompare}
                className="px-3 py-1.5 text-[10px] uppercase tracking-wider"
                style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#849396" }}>
                Törlés
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pt-20 pb-20 px-4 sm:px-6 max-w-[1600px] mx-auto grid-bg min-h-screen">
        {/* Page Title */}
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ fontFamily: "var(--font-space-grotesk)", color: "#00e5ff" }}>
            Kakucs Ring Circuit
          </p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight" style={{ fontFamily: "var(--font-orbitron)", color: "#e4e1e8" }}>
            KAKUCS RING
          </h2>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Best Lap</p>
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#e4e1e8" }}>
              {results[0]?.best ?? "-"}<span className="text-sm" style={{ color: "#849396" }}>s</span>
            </p>
          </div>
          <div className="glass-panel p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Total Cars</p>
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#e4e1e8" }}>{results.length}</p>
          </div>
          <div className="glass-panel p-5" style={{ borderLeft: "4px solid #00e5ff" }}>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "var(--font-space-grotesk)", color: "#00e5ff" }}>Jani Cars</p>
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#e4e1e8" }}>{janiCars.length}</p>
          </div>
          <div className="glass-panel p-5" style={{ borderLeft: "4px solid #ff3547" }}>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "var(--font-space-grotesk)", color: "#ff3547" }}>Csabi Cars</p>
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#e4e1e8" }}>{csabiCars.length}</p>
          </div>
        </div>

        {/* Pilots / Compare section */}
        <div ref={compareRef}>
          {activeTab === "pilots" && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <DriverHUD name="Jani" color="#00e5ff" label="Team Leader" results={janiCars} glowClass="glow-cyan" textGlowClass="text-glow-cyan" />
              <DriverHUD name="Csabi" color="#ff3547" label="Challenger" results={csabiCars} glowClass="glow-red" textGlowClass="text-glow-red" />
            </section>
          )}
          {activeTab === "compare" && (
            <CompareSection results={results} selectedCars={selectedCars} toggleCompare={toggleCompare} />
          )}
        </div>

        {/* Filter Bar */}
        <div className="glass-panel p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH CAR OR DRIVER..."
              className="bg-[#1b1b20] border-b border-[#3b494c] focus:border-[#00e5ff] text-sm w-full md:w-64 px-4 py-2 text-[#e4e1e8] placeholder:text-[#849396]"
              style={{ fontFamily: "var(--font-space-grotesk)" }} />
            <div className="flex shrink-0" style={{ border: "1px solid #3b494c" }}>
              {(["all", "Jani", "Csabi"] as const).map((d) => (
                <button key={d} onClick={() => setDriverFilter(d)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    background: driverFilter === d ? (d === "Jani" ? "#00e5ff" : d === "Csabi" ? "#ff3547" : "#00e5ff") : "transparent",
                    color: driverFilter === d ? (d === "all" ? "#001f24" : d === "Jani" ? "#001f24" : "#fff") : "#849396",
                  }}>
                  {d === "all" ? "Mind" : d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}
              className="bg-[#1b1b20] border-b border-[#3b494c] text-sm py-2 px-4 text-[#849396] appearance-none"
              style={{ fontFamily: "var(--font-space-grotesk)" }}>
              <option value="all">ALL BRANDS</option>
              {brands.map((b) => <option key={b} value={b}>{b.toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        {/* Results Table Header */}
        <div className="px-4 sm:px-6 grid grid-cols-12 gap-4 text-[10px] font-black uppercase tracking-[0.2em] mb-4"
          style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>
          <div className="col-span-1 text-center">Pos</div>
          <div className="col-span-5 sm:col-span-4">Machine &amp; Driver</div>
          <div className="col-span-3 hidden sm:block">Pace Visualization</div>
          <div className="col-span-6 sm:col-span-4 text-right">Lap Time</div>
        </div>

        {/* Result count */}
        <p className="text-[10px] uppercase tracking-wider px-4 mb-3" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>
          {filtered.length} találat{!showAll && filtered.length > 50 && " · Top 50"}
        </p>

        {/* Results */}
        <div className="space-y-3">
          {displayed.map((r, idx) => (
            <ResultRow key={`${r.pos}-${r.car}`} result={r} fastestMs={fastestMs} index={idx}
              isSelected={selectedPositions.includes(r.pos)} onToggleCompare={() => toggleCompare(r.pos)}
              isExpanded={expandedRow === r.pos} onToggleExpand={() => setExpandedRow(expandedRow === r.pos ? null : r.pos)} />
          ))}
        </div>

        {filtered.length > 50 && (
          <div className="text-center mt-8">
            <button onClick={() => setShowAll(!showAll)}
              className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-white hover:text-[#131317]"
              style={{ fontFamily: "var(--font-space-grotesk)", background: "#353439", color: "#e4e1e8" }}>
              {showAll ? "Top 50 mutatása" : `Összes mutatása (${filtered.length})`}
            </button>
          </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 w-full flex justify-around items-center h-14 md:hidden z-50"
        style={{ background: "rgba(19,19,23,0.9)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button onClick={() => setActiveTab("pilots")} className="flex flex-col items-center py-2"
          style={{ color: activeTab === "pilots" ? "#00e5ff" : "#849396" }}>
          <span className="text-lg">&#9776;</span>
          <span className="text-[9px] uppercase" style={{ fontFamily: "var(--font-space-grotesk)" }}>Lista</span>
        </button>
        <button onClick={() => setActiveTab("compare")} className="flex flex-col items-center py-2"
          style={{ color: activeTab === "compare" ? "#00e5ff" : "#849396" }}>
          <span className="text-lg">&#8596;</span>
          <span className="text-[9px] uppercase" style={{ fontFamily: "var(--font-space-grotesk)" }}>Compare</span>
        </button>
      </nav>
    </>
  );
}

/* ─── Driver HUD Card ─── */

function DriverHUD({ name, color, label, results, glowClass, textGlowClass }: {
  name: string; color: string; label: string; results: Result[]; glowClass: string; textGlowClass: string;
}) {
  const best = results[0];
  return (
    <div className={`glass-panel p-6 sm:p-8 relative overflow-hidden ${glowClass} group`}>
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-tighter inline-block"
            style={{ background: color, color: name === "Csabi" ? "#fff" : "#001f24" }}>{label}</span>
          <h3 className="text-4xl sm:text-5xl font-black mt-2 text-white" style={{ fontFamily: "var(--font-orbitron)" }}>{name.toUpperCase()}</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1" style={{ fontFamily: "var(--font-jetbrains)", color }}>
            {best?.car ?? "-"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase mb-1" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Session Best</p>
          <p className={`text-3xl sm:text-5xl font-bold tracking-tighter ${textGlowClass}`}
            style={{ fontFamily: "var(--font-jetbrains)", color }}>
            {best?.best ?? "-"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <p className="text-[10px] uppercase" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Autók</p>
          <p style={{ fontFamily: "var(--font-jetbrains)", color: "#e4e1e8" }}>{results.length}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Top 10</p>
          <p style={{ fontFamily: "var(--font-jetbrains)", color: "#e4e1e8" }}>
            {results.filter((r) => r.pos <= 10).length}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Átlag</p>
          <p style={{ fontFamily: "var(--font-jetbrains)", color: "#e4e1e8" }}>
            {results.length > 0 ? `${(results.reduce((s, r) => s + r.bestMs, 0) / results.length / 1000).toFixed(1)}s` : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Compare Section ─── */

function CompareSection({ results, selectedCars, toggleCompare }: {
  results: Result[]; selectedCars: Result[]; toggleCompare: (pos: number) => void;
}) {
  return (
    <div className="mb-10 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[0, 1, 2].map((slot) => (
          <CarCombobox key={slot} results={results} selected={selectedCars[slot] ?? null}
            onSelect={(r) => toggleCompare(r.pos)}
            onClear={selectedCars[slot] ? () => toggleCompare(selectedCars[slot].pos) : undefined}
            placeholder={slot === 2 ? "3. autó (opcionális)" : `${slot + 1}. autó kiválasztása...`} />
        ))}
      </div>
      {selectedCars.length >= 2 && <ComparisonPanel cars={selectedCars} />}
    </div>
  );
}

/* ─── Combobox ─── */

function CarCombobox({ results, selected, onSelect, onClear, placeholder }: {
  results: Result[]; selected: Result | null; onSelect: (r: Result) => void; onClear?: () => void; placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [hlIdx, setHlIdx] = useState(0);

  const filtered = useMemo(() => {
    if (!query) return results.slice(0, 8);
    return results.filter((r) => r.car.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  }, [results, query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => setHlIdx(0), [filtered]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setHlIdx((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHlIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && filtered[hlIdx]) { e.preventDefault(); onSelect(filtered[hlIdx]); setQuery(""); setOpen(false); }
    else if (e.key === "Escape") setOpen(false);
  }

  if (selected) {
    return (
      <div className="glass-panel flex items-center gap-2 px-4 py-3" style={{ borderLeft: `4px solid ${dc(selected.driver)}` }}>
        <span className="text-xs w-8 text-right shrink-0" style={{ fontFamily: "var(--font-jetbrains)", color: "#849396" }}>
          {String(selected.pos).padStart(2, "0")}
        </span>
        <span className="text-sm font-bold flex-1 truncate" style={{ fontFamily: "var(--font-orbitron)", color: "#fff" }}>{selected.car}</span>
        <span className="text-[10px] px-2 py-0.5 shrink-0 font-black uppercase tracking-wider"
          style={{ background: dc(selected.driver) + "22", color: dc(selected.driver), fontFamily: "var(--font-jetbrains)" }}>
          {selected.driver || "?"}
        </span>
        <span className="text-xs shrink-0" style={{ fontFamily: "var(--font-jetbrains)", color: "#849396" }}>{selected.best}</span>
        {onClear && <button onClick={onClear} className="ml-1 text-xs" style={{ color: "#849396" }}>&#x2715;</button>}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} onKeyDown={handleKey} placeholder={placeholder}
        className="w-full px-4 py-3 text-sm bg-[#1b1b20] border-b border-[#3b494c] text-[#e4e1e8] placeholder:text-[#849396]"
        style={{ fontFamily: "var(--font-space-grotesk)" }} />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-40 overflow-hidden" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
          {filtered.map((r, i) => (
            <button key={r.pos} onClick={() => { onSelect(r); setQuery(""); setOpen(false); }}
              onMouseEnter={() => setHlIdx(i)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
              style={{ background: i === hlIdx ? "#2a292e" : "transparent" }}>
              <span className="text-[10px] w-6 text-right shrink-0" style={{ fontFamily: "var(--font-jetbrains)", color: "#849396" }}>
                {String(r.pos).padStart(2, "0")}
              </span>
              <span className="text-sm flex-1 truncate font-bold" style={{ fontFamily: "var(--font-space-grotesk)", color: "#e4e1e8" }}>{r.car}</span>
              {r.driver && r.driver !== "?" && (
                <span className="text-[9px] px-2 py-0.5 font-black uppercase" style={{ background: dc(r.driver) + "22", color: dc(r.driver) }}>{r.driver}</span>
              )}
              <span className="text-xs shrink-0" style={{ fontFamily: "var(--font-jetbrains)", color: "#849396" }}>{r.best}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Comparison Panel ─── */

function ComparisonPanel({ cars }: { cars: Result[] }) {
  const fastest = Math.min(...cars.map((c) => c.bestMs));
  const barColors = ["#00e5ff", "#ff3547", "#ffe16d"];

  return (
    <div className="glass-panel p-5 sm:p-8 animate-fade-in">
      {/* Headers */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8">
        {cars.map((c, i) => (
          <div key={c.pos} className="flex items-center gap-3">
            {i > 0 && <span className="text-2xl font-black mx-2" style={{ fontFamily: "var(--font-orbitron)", color: "#353439" }}>VS</span>}
            <div className="text-center">
              <p className="text-lg sm:text-xl font-black" style={{ fontFamily: "var(--font-orbitron)", color: "#fff" }}>{c.car}</p>
              {c.driver && c.driver !== "?" && (
                <span className="text-[10px] px-3 py-0.5 inline-block mt-1 font-black uppercase tracking-wider"
                  style={{ background: dc(c.driver), color: c.driver === "Csabi" ? "#fff" : "#001f24" }}>{c.driver}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lap times */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] mb-4" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Best Lap</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          {cars.map((c) => {
            const isFast = c.bestMs === fastest;
            const diff = c.bestMs - fastest;
            return (
              <div key={c.pos} className="text-center">
                <p className={`text-3xl sm:text-5xl font-bold tracking-tighter ${isFast ? "text-glow-cyan" : ""}`}
                  style={{ fontFamily: "var(--font-jetbrains)", color: isFast ? "#00e5ff" : "#849396" }}>{c.best}</p>
                {diff > 0 && (
                  <span className="text-xs px-3 py-0.5 inline-block mt-2 font-bold"
                    style={{ background: "rgba(255,53,71,0.15)", color: "#ff3547", fontFamily: "var(--font-jetbrains)" }}>
                    +{(diff / 1000).toFixed(3)}s
                  </span>
                )}
                {isFast && (
                  <span className="text-[10px] px-3 py-0.5 inline-block mt-2 font-black uppercase tracking-wider"
                    style={{ background: "rgba(0,229,255,0.15)", color: "#00e5ff", fontFamily: "var(--font-space-grotesk)" }}>FASTEST</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pace bars */}
      <div className="space-y-3 mb-8">
        {cars.map((c, i) => {
          const barW = (fastest / c.bestMs) * 100;
          return (
            <div key={c.pos} className="flex items-center gap-4">
              <span className="text-xs w-28 truncate text-right font-bold" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>
                {c.car.length > 16 ? c.car.slice(0, 16) + "…" : c.car}
              </span>
              <div className="flex-1 h-2 relative" style={{ background: "#353439" }}>
                <div className="speed-bar h-full absolute"
                  style={{ "--bar-width": `${barW}%`, "--delay": `${i * 200}ms`, background: barColors[i],
                    boxShadow: i === 0 ? "0 0 15px rgba(0,229,255,0.6)" : i === 1 ? "0 0 10px rgba(255,53,71,0.4)" : "none" } as React.CSSProperties} />
              </div>
              <span className="text-xs w-16" style={{ fontFamily: "var(--font-jetbrains)", color: "#849396" }}>{c.best}</span>
            </div>
          );
        })}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cars.map((c) => (
          <div key={c.pos} className="p-3" style={{ background: "#0e0e12" }}>
            <p className="text-[9px] uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Pozíció</p>
            <p className="text-xl font-black" style={{ fontFamily: "var(--font-jetbrains)", color: "#e4e1e8" }}>
              {String(c.pos).padStart(2, "0")}
            </p>
          </div>
        ))}
        {cars.length === 2 && (
          <>
            <div className="p-3" style={{ background: "#0e0e12" }}>
              <p className="text-[9px] uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Különbség</p>
              <p className="text-xl font-black" style={{ fontFamily: "var(--font-jetbrains)", color: "#ffe16d" }}>
                {((Math.abs(cars[0].bestMs - cars[1].bestMs)) / 1000).toFixed(3)}s
              </p>
            </div>
            <div className="p-3" style={{ background: "#0e0e12" }}>
              <p className="text-[9px] uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Helykül.</p>
              <p className="text-xl font-black" style={{ fontFamily: "var(--font-jetbrains)", color: "#c3f5ff" }}>
                {Math.abs(cars[0].pos - cars[1].pos)} hely
              </p>
            </div>
            <div className="p-3" style={{ background: "#0e0e12" }}>
              <p className="text-[9px] uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Százalék</p>
              <p className="text-xl font-black" style={{ fontFamily: "var(--font-jetbrains)", color: "#00e5ff" }}>
                {((Math.abs(cars[0].bestMs - cars[1].bestMs) / Math.min(cars[0].bestMs, cars[1].bestMs)) * 100).toFixed(1)}%
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Result Row ─── */

function ResultRow({ result, fastestMs, index, isSelected, onToggleCompare, isExpanded, onToggleExpand }: {
  result: Result; fastestMs: number; index: number; isSelected: boolean;
  onToggleCompare: () => void; isExpanded: boolean; onToggleExpand: () => void;
}) {
  const isTop3 = result.pos <= 3;
  const isFastest = result.pos === 1;
  const barWidth = (fastestMs / result.bestMs) * 100;
  const color = dc(result.driver);
  const diff = result.bestMs - fastestMs;

  return (
    <div>
      <div
        className={`animate-row glass-panel p-3 sm:p-4 grid grid-cols-12 gap-2 sm:gap-4 items-center relative cursor-pointer transition-all group
          ${isTop3 ? "glow-gold" : ""} ${isSelected ? "!border-[#a855f7] !border-opacity-50" : ""}`}
        style={{
          "--row-delay": `${Math.min(index * 30, 1500)}ms`,
          borderLeft: `4px solid ${isSelected ? "#a855f7" : isTop3 ? (result.driver === "Csabi" ? "#ff3547" : "#00e5ff") : "#353439"}`,
          opacity: isTop3 ? 1 : 0.85,
        } as React.CSSProperties}
        onClick={onToggleExpand}
      >
        {/* Compare checkbox - visible on hover */}
        <button onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
          className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ background: isSelected ? "#a855f7" : "#353439", color: isSelected ? "#fff" : "#849396" }}
          title="Összehasonlítás">
          <span className="text-[10px]">{isSelected ? "✓" : "+"}</span>
        </button>

        {/* Position */}
        <div className="col-span-1 text-center">
          <span className={`font-black text-lg sm:text-2xl ${isTop3 ? "italic" : ""}`}
            style={{ fontFamily: "var(--font-jetbrains)", color: isTop3 ? "#ffe16d" : "#849396" }}>
            {String(result.pos).padStart(2, "0")}
          </span>
        </div>

        {/* Car + Driver */}
        <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
          <div className="hidden sm:flex w-10 h-10 items-center justify-center shrink-0"
            style={{ background: color + "15", border: `1px solid ${color}30` }}>
            <span className="text-xs font-black" style={{ color, fontFamily: "var(--font-jetbrains)" }}>
              {result.driver ? result.driver[0] : "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm sm:text-base text-white leading-tight truncate" style={{ fontFamily: "var(--font-orbitron)" }}>
              {result.car}
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-0.5" style={{ fontFamily: "var(--font-jetbrains)", color }}>
              {result.driver || "N/A"}
            </p>
          </div>
        </div>

        {/* Pace bar */}
        <div className="col-span-3 hidden sm:block">
          <div className="h-1.5 w-full relative" style={{ background: "#353439" }}>
            <div className="speed-bar absolute h-full"
              style={{
                "--bar-width": `${barWidth}%`, "--delay": `${Math.min(index * 30 + 200, 1700)}ms`,
                background: color,
                boxShadow: isFastest ? `0 0 15px ${color}99` : "none",
              } as React.CSSProperties} />
          </div>
        </div>

        {/* Lap Time */}
        <div className="col-span-6 sm:col-span-4 text-right">
          <p className="font-black text-lg sm:text-2xl" style={{ fontFamily: "var(--font-jetbrains)", color: "#e4e1e8" }}>
            {result.best}
          </p>
          <p className="text-[10px] tracking-wider" style={{ fontFamily: "var(--font-jetbrains)", color: isFastest ? "#00e5ff" : "#ff3547" }}>
            {isFastest ? "FASTEST" : `+${(diff / 1000).toFixed(3)}`}
          </p>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="ml-4 sm:ml-8 mr-2 mb-1 p-4 animate-fade-in" style={{ background: "#0e0e12", borderLeft: `2px solid ${color}44` }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Best Lap</p>
              <p className="text-xl font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#e4e1e8" }}>{result.best}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Total</p>
              <p className="text-xl font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: result.total ? "#e4e1e8" : "#353439" }}>{result.total || "N/A"}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Pilóta</p>
              <p className="text-xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)", color }}>{result.driver || "?"}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "var(--font-space-grotesk)", color: "#849396" }}>Pozíció</p>
              <p className="text-xl font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#e4e1e8" }}>{String(result.pos).padStart(2, "0")}</p>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
            className="mt-4 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              background: isSelected ? "rgba(168,85,247,0.15)" : "linear-gradient(135deg, #c3f5ff, #00e5ff)",
              color: isSelected ? "#a855f7" : "#001f24",
              border: isSelected ? "1px solid rgba(168,85,247,0.3)" : "none",
            }}>
            {isSelected ? "Eltávolítás" : "Összehasonlítás ezzel"}
          </button>
        </div>
      )}
    </div>
  );
}
