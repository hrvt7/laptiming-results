"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Result } from "@/app/page";

function getBrand(car: string): string {
  const brandMap: Record<string, string[]> = {
    BMW: ["BMW", "BFR BMW"],
    Audi: ["Audi"],
    Mercedes: ["Mercedes"],
    Volkswagen: ["VW", "Volkswagen"],
    Porsche: ["Porsche"],
    Honda: ["Honda"],
    Toyota: ["Toyota"],
    Mazda: ["Mazda"],
    Ford: ["Ford"],
    Renault: ["Renault"],
    Opel: ["Opel"],
    Subaru: ["Subaru"],
    Mitsubishi: ["Mitsubishi"],
    Nissan: ["Nissan"],
    Hyundai: ["Hyundai"],
    Skoda: ["Skoda"],
    Seat: ["Seat", "Cupra", "Ateca"],
    Alfa: ["Alfa"],
    Suzuki: ["Suzuki"],
    Mini: ["Mini", "MINI"],
    Peugeot: ["Peugeot"],
    Chevrolet: ["Chevy", "Chevrolet", "Corvette"],
    Ferrari: ["Ferrari"],
    Lexus: ["Lexus"],
    Kia: ["Kia"],
    Dodge: ["Dodge"],
    Citroen: ["Citroen"],
    Fiat: ["Fiat", "Abarth"],
    Lada: ["Lada"],
    Volvo: ["Volvo"],
    Maserati: ["Maserati"],
    Tesla: ["Tesla"],
    Dacia: ["Dacia"],
    Smart: ["Smart"],
    Trabant: ["Trabant"],
    Pontiac: ["Pontiac"],
    Infinity: ["Infinity"],
  };
  for (const [brand, prefixes] of Object.entries(brandMap)) {
    for (const prefix of prefixes) {
      if (car.startsWith(prefix)) return brand;
    }
  }
  return "Egyéb";
}

function driverColor(driver: string) {
  return driver === "Jani" ? "#00e5ff" : driver === "Csabi" ? "#ff3547" : "#555";
}

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

  // URL sync: read ?compare= on mount
  useEffect(() => {
    const cp = searchParams.get("compare");
    if (cp) {
      const positions = cp.split(",").map(Number).filter((n) => !isNaN(n) && n > 0);
      if (positions.length >= 2) {
        setSelectedPositions(positions.slice(0, 3));
        setActiveTab("compare");
      }
    }
  }, [searchParams]);

  // URL sync: write ?compare= on change
  const updateURL = useCallback(
    (positions: number[]) => {
      if (positions.length >= 2) {
        router.replace(`?compare=${positions.join(",")}`, { scroll: false });
      } else {
        router.replace("/", { scroll: false });
      }
    },
    [router]
  );

  const toggleCompare = useCallback(
    (pos: number) => {
      setSelectedPositions((prev) => {
        let next: number[];
        if (prev.includes(pos)) {
          next = prev.filter((p) => p !== pos);
        } else if (prev.length >= 3) {
          next = [...prev.slice(1), pos];
        } else {
          next = [...prev, pos];
        }
        updateURL(next);
        return next;
      });
    },
    [updateURL]
  );

  const clearCompare = useCallback(() => {
    setSelectedPositions([]);
    updateURL([]);
  }, [updateURL]);

  const selectedCars = useMemo(
    () => selectedPositions.map((p) => results.find((r) => r.pos === p)).filter(Boolean) as Result[],
    [selectedPositions, results]
  );

  const brands = useMemo(() => {
    const s = new Set<string>();
    results.forEach((r) => s.add(getBrand(r.car)));
    return Array.from(s).sort();
  }, [results]);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (search && !r.car.toLowerCase().includes(search.toLowerCase())) return false;
      if (driverFilter !== "all" && r.driver !== driverFilter) return false;
      if (brandFilter !== "all" && getBrand(r.car) !== brandFilter) return false;
      return true;
    });
  }, [results, search, driverFilter, brandFilter]);

  const displayed = showAll ? filtered : filtered.slice(0, 50);
  const fastestMs = results[0]?.bestMs ?? 42200;
  const janiCars = results.filter((r) => r.driver === "Jani");
  const csabiCars = results.filter((r) => r.driver === "Csabi");
  const janiBest = janiCars[0];
  const csabiBest = csabiCars[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Floating comparison bar */}
      {selectedPositions.length >= 2 && (
        <div
          className="fixed top-0 left-0 right-0 z-50 px-4 py-2.5"
          style={{
            background: "rgba(8,8,12,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #2a2a3a",
          }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs shrink-0" style={{ color: "#888", fontFamily: "var(--font-barlow-condensed)" }}>
                {selectedCars.length} autó:
              </span>
              <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                {selectedCars.map((c, i) => (
                  <span key={c.pos} className="flex items-center gap-1 shrink-0">
                    {i > 0 && <span style={{ color: "#333" }}>vs</span>}
                    <span
                      className="text-xs font-medium truncate max-w-[120px] sm:max-w-[200px]"
                      style={{ color: driverColor(c.driver), fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      {c.car}
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  setActiveTab("compare");
                  compareRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "#00e5ff", color: "#000", fontFamily: "var(--font-barlow-condensed)" }}
              >
                <span className="hidden sm:inline">Összehasonlítás</span>
                <span className="sm:hidden">&#x2194;</span>
              </button>
              <button
                onClick={clearCompare}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ background: "#1a1a24", color: "#888", border: "1px solid #2a2a3a", fontFamily: "var(--font-barlow-condensed)" }}
              >
                <span className="hidden sm:inline">Törlés</span>
                <span className="sm:hidden">&#x2715;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="text-center mb-8">
        <h1
          className="text-4xl sm:text-6xl font-bold tracking-wider"
          style={{
            fontFamily: "var(--font-orbitron)",
            background: "linear-gradient(135deg, #ffffff 0%, #00e5ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          LAPTIMING
        </h1>
        <p className="text-lg sm:text-xl mt-2 tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#888" }}>
          Kakucs Ring
        </p>
        <p className="text-sm mt-1" style={{ color: "#555" }}>
          {results.length} autó tesztelve
        </p>
      </header>

      {/* Tabs */}
      <div className="flex justify-center gap-1 mb-6" ref={compareRef}>
        {(["pilots", "compare"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              fontFamily: "var(--font-barlow-condensed)",
              background: activeTab === tab ? "#1a1a24" : "transparent",
              color: activeTab === tab ? "#e8e8ec" : "#555",
              border: activeTab === tab ? "1px solid #2a2a3a" : "1px solid transparent",
            }}
          >
            {tab === "pilots" ? "Pilóták" : "Autók összehasonlítása"}
          </button>
        ))}
      </div>

      {/* Pilots tab */}
      {activeTab === "pilots" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <DriverCard name="Jani" color="#00e5ff" bestTime={janiBest?.best ?? "-"} bestCar={janiBest?.car ?? "-"} totalCars={janiCars.length} />
          <div className="flex items-center justify-center">
            <span className="text-3xl sm:text-5xl font-bold" style={{ fontFamily: "var(--font-orbitron)", color: "#333" }}>VS</span>
          </div>
          <DriverCard name="Csabi" color="#ff3547" bestTime={csabiBest?.best ?? "-"} bestCar={csabiBest?.car ?? "-"} totalCars={csabiCars.length} />
        </div>
      )}

      {/* Compare tab */}
      {activeTab === "compare" && (
        <CompareSection results={results} selectedCars={selectedCars} toggleCompare={toggleCompare} />
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Legjobb köridő" value={results[0]?.best ?? "-"} sub={`${results[0]?.car ?? ""} • ${results[0]?.driver || "?"}`} accent="#ffd600" />
        <StatCard label="Összes autó" value={String(results.length)} sub="tesztelve" accent="#a855f7" />
        <StatCard label="Jani autók" value={String(janiCars.length)} sub="tesztelés" accent="#00e5ff" />
        <StatCard label="Csabi autók" value={String(csabiCars.length)} sub="tesztelés" accent="#ff3547" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Keresés autó neve alapján..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg border text-sm"
          style={{ fontFamily: "var(--font-barlow)", background: "#111118", borderColor: "#2a2a3a", color: "#e8e8ec" }}
        />
        <div className="flex gap-2">
          {(["all", "Jani", "Csabi"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDriverFilter(d)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                fontFamily: "var(--font-barlow-condensed)",
                background: driverFilter === d ? (d === "Jani" ? "#00e5ff" : d === "Csabi" ? "#ff3547" : "#333") : "#1a1a24",
                color: driverFilter === d ? (d === "all" ? "#fff" : "#000") : "#888",
                border: "1px solid",
                borderColor: driverFilter === d ? "transparent" : "#2a2a3a",
              }}
            >
              {d === "all" ? "Mind" : d}
            </button>
          ))}
        </div>
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border text-sm"
          style={{ fontFamily: "var(--font-barlow)", background: "#111118", borderColor: "#2a2a3a", color: "#e8e8ec" }}
        >
          <option value="all">Minden márka</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <p className="text-xs mb-3" style={{ color: "#555", fontFamily: "var(--font-barlow)" }}>
        {filtered.length} találat{!showAll && filtered.length > 50 && ` (Top 50 megjelenítve)`}
      </p>

      {/* Results List */}
      <div className="space-y-1.5">
        {displayed.map((r, idx) => (
          <ResultRow
            key={`${r.pos}-${r.car}`}
            result={r}
            fastestMs={fastestMs}
            index={idx}
            isSelected={selectedPositions.includes(r.pos)}
            onToggleCompare={() => toggleCompare(r.pos)}
            isExpanded={expandedRow === r.pos}
            onToggleExpand={() => setExpandedRow(expandedRow === r.pos ? null : r.pos)}
          />
        ))}
      </div>

      {filtered.length > 50 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ fontFamily: "var(--font-barlow-condensed)", background: "#1a1a24", border: "1px solid #2a2a3a", color: "#00e5ff" }}
          >
            {showAll ? "Top 50 mutatása" : `Összes mutatása (${filtered.length})`}
          </button>
        </div>
      )}

      <footer className="mt-16 pb-8 text-center border-t" style={{ borderColor: "#1a1a24" }}>
        <p className="mt-6 text-sm tracking-[0.3em]" style={{ fontFamily: "var(--font-orbitron)", color: "#333" }}>LAPTIMING</p>
        <p className="text-xs mt-1" style={{ color: "#444" }}>Kakucs Ring • {results.length} autó</p>
      </footer>
    </div>
  );
}

/* ─── Compare Section ─── */

function CompareSection({
  results,
  selectedCars,
  toggleCompare,
}: {
  results: Result[];
  selectedCars: Result[];
  toggleCompare: (pos: number) => void;
}) {
  return (
    <div className="mb-8 space-y-4">
      {/* Car selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[0, 1, 2].map((slot) => (
          <CarCombobox
            key={slot}
            results={results}
            selected={selectedCars[slot] ?? null}
            onSelect={(r) => toggleCompare(r.pos)}
            onClear={selectedCars[slot] ? () => toggleCompare(selectedCars[slot].pos) : undefined}
            placeholder={slot === 2 ? "3. autó (opcionális)" : `${slot + 1}. autó kiválasztása...`}
          />
        ))}
      </div>

      {/* Comparison panel */}
      {selectedCars.length >= 2 && <ComparisonPanel cars={selectedCars} />}
    </div>
  );
}

/* ─── Car Combobox ─── */

function CarCombobox({
  results,
  selected,
  onSelect,
  onClear,
  placeholder,
}: {
  results: Result[];
  selected: Result | null;
  onSelect: (r: Result) => void;
  onClear?: () => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [highlightIdx, setHighlightIdx] = useState(0);

  const filtered = useMemo(() => {
    if (!query) return results.slice(0, 8);
    return results.filter((r) => r.car.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  }, [results, query]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => setHighlightIdx(0), [filtered]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[highlightIdx]) {
      e.preventDefault();
      onSelect(filtered[highlightIdx]);
      setQuery("");
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  if (selected) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border"
        style={{ background: "#111118", borderColor: driverColor(selected.driver) + "44" }}
      >
        <span className="text-sm font-medium flex-1 truncate" style={{ fontFamily: "var(--font-barlow)", color: "#e8e8ec" }}>
          #{String(selected.pos).padStart(3, "0")} {selected.car}
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
          style={{ background: driverColor(selected.driver) + "22", color: driverColor(selected.driver), fontFamily: "var(--font-barlow-condensed)" }}
        >
          {selected.driver || "?"}
        </span>
        <span className="text-xs shrink-0" style={{ fontFamily: "var(--font-jetbrains)", color: "#888" }}>
          {selected.best}
        </span>
        {onClear && (
          <button onClick={onClear} className="text-xs ml-1 shrink-0" style={{ color: "#555" }}>
            &#x2715;
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg border text-sm"
        style={{ fontFamily: "var(--font-barlow)", background: "#111118", borderColor: "#2a2a3a", color: "#e8e8ec" }}
      />
      {open && filtered.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg border overflow-hidden z-40"
          style={{ background: "#111118", borderColor: "#2a2a3a" }}
        >
          {filtered.map((r, i) => (
            <button
              key={r.pos}
              onClick={() => { onSelect(r); setQuery(""); setOpen(false); }}
              onMouseEnter={() => setHighlightIdx(i)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
              style={{ background: i === highlightIdx ? "#1a1a24" : "transparent" }}
            >
              <span className="text-[10px] w-8 text-right shrink-0" style={{ fontFamily: "var(--font-jetbrains)", color: "#444" }}>
                #{String(r.pos).padStart(3, "0")}
              </span>
              <span className="text-sm flex-1 truncate" style={{ fontFamily: "var(--font-barlow)", color: "#e8e8ec" }}>
                {r.car}
              </span>
              {r.driver && r.driver !== "?" && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: driverColor(r.driver) + "22", color: driverColor(r.driver) }}>
                  {r.driver}
                </span>
              )}
              <span className="text-xs shrink-0" style={{ fontFamily: "var(--font-jetbrains)", color: "#666" }}>
                {r.best}
              </span>
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

  return (
    <div
      className="rounded-xl p-5 sm:p-6 border animate-fade-in"
      style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Header: Car names + VS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-6">
        {cars.map((c, i) => (
          <div key={c.pos} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-xl font-bold mx-2" style={{ fontFamily: "var(--font-orbitron)", color: "#333" }}>
                VS
              </span>
            )}
            <div className="text-center">
              <p className="text-base sm:text-lg font-bold" style={{ fontFamily: "var(--font-barlow)", color: "#e8e8ec" }}>
                {c.car}
              </p>
              {c.driver && c.driver !== "?" && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full inline-block mt-1"
                  style={{ background: driverColor(c.driver) + "22", color: driverColor(c.driver), fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {c.driver}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Best lap comparison */}
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#555" }}>
          Legjobb köridő
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          {cars.map((c) => {
            const isFastest = c.bestMs === fastest;
            const diff = c.bestMs - fastest;
            return (
              <div key={c.pos} className="text-center">
                <p
                  className="text-2xl sm:text-4xl font-bold"
                  style={{
                    fontFamily: "var(--font-jetbrains)",
                    color: isFastest ? "#22c55e" : "#888",
                  }}
                >
                  {c.best}
                </p>
                {diff > 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
                    style={{ background: "#ff354722", color: "#ff3547", fontFamily: "var(--font-jetbrains)" }}
                  >
                    +{(diff / 1000).toFixed(3)}s
                  </span>
                )}
                {isFastest && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
                    style={{ background: "#22c55e22", color: "#22c55e", fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    GYORSABB
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Speed bars */}
      <div className="space-y-2 mb-6">
        {cars.map((c, i) => {
          const barW = (fastest / c.bestMs) * 100;
          const colors = ["#00e5ff", "#ff3547", "#a855f7"];
          return (
            <div key={c.pos} className="flex items-center gap-3">
              <span className="text-xs w-24 truncate text-right" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#888" }}>
                {c.car.length > 14 ? c.car.slice(0, 14) + "…" : c.car}
              </span>
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "#1a1a24" }}>
                <div
                  className="speed-bar h-full rounded-full"
                  style={{ "--bar-width": `${barW}%`, "--delay": `${i * 200}ms`, background: colors[i] } as React.CSSProperties}
                />
              </div>
              <span className="text-xs w-16" style={{ fontFamily: "var(--font-jetbrains)", color: "#888" }}>
                {c.best}
              </span>
            </div>
          );
        })}
      </div>

      {/* Total comparison if available */}
      {cars.filter((c) => c.total).length >= 2 && (
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#555" }}>
            Total Laptime
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            {cars.map((c) => (
              <div key={c.pos} className="text-center">
                <p className="text-lg font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: c.total ? "#e8e8ec" : "#333" }}>
                  {c.total || "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {cars.map((c) => (
          <div key={c.pos} className="rounded-lg p-3" style={{ background: "#0d0d14" }}>
            <p className="text-[9px] uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#444" }}>
              Pozíció
            </p>
            <p className="text-lg font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#e8e8ec" }}>
              #{String(c.pos).padStart(3, "0")}
            </p>
          </div>
        ))}
        {cars.length === 2 && (
          <>
            <div className="rounded-lg p-3" style={{ background: "#0d0d14" }}>
              <p className="text-[9px] uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#444" }}>
                Különbség
              </p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#ffd600" }}>
                {((Math.abs(cars[0].bestMs - cars[1].bestMs)) / 1000).toFixed(3)}s
              </p>
            </div>
            <div className="rounded-lg p-3" style={{ background: "#0d0d14" }}>
              <p className="text-[9px] uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#444" }}>
                Pozíció kül.
              </p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#a855f7" }}>
                {Math.abs(cars[0].pos - cars[1].pos)} hely
              </p>
            </div>
            <div className="rounded-lg p-3" style={{ background: "#0d0d14" }}>
              <p className="text-[9px] uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#444" }}>
                Százalék
              </p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#00e5ff" }}>
                {((Math.abs(cars[0].bestMs - cars[1].bestMs) / Math.min(cars[0].bestMs, cars[1].bestMs)) * 100).toFixed(1)}%
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Subcomponents ─── */

function DriverCard({ name, color, bestTime, bestCar, totalCars }: { name: string; color: string; bestTime: string; bestCar: string; totalCars: number }) {
  return (
    <div className="rounded-xl p-5 border" style={{ background: "#111118", borderColor: color + "33" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
        <h3 className="text-lg font-bold tracking-wider" style={{ fontFamily: "var(--font-orbitron)", color }}>{name}</h3>
      </div>
      <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-jetbrains)", color }}>{bestTime}</p>
      <p className="text-xs mt-1 truncate" style={{ color: "#666" }}>{bestCar}</p>
      <p className="text-xs mt-2" style={{ color: "#555" }}>
        <span className="font-semibold" style={{ color: "#888" }}>{totalCars}</span> autó tesztelve
      </p>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: "#111118", borderColor: "#1a1a24" }}>
      <p className="text-[10px] uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#555" }}>{label}</p>
      <p className="text-xl font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: accent }}>{value}</p>
      <p className="text-[10px] mt-1 truncate" style={{ color: "#444" }}>{sub}</p>
    </div>
  );
}

function ResultRow({
  result,
  fastestMs,
  index,
  isSelected,
  onToggleCompare,
  isExpanded,
  onToggleExpand,
}: {
  result: Result;
  fastestMs: number;
  index: number;
  isSelected: boolean;
  onToggleCompare: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const isTop3 = result.pos <= 3;
  const isFastest = result.pos === 1;
  const barWidth = (fastestMs / result.bestMs) * 100;
  const dc = driverColor(result.driver);

  return (
    <div>
      <div
        className="animate-row flex items-center gap-2 sm:gap-4 rounded-lg px-2 sm:px-4 py-2.5 transition-colors hover:bg-[#1a1a24] group cursor-pointer"
        style={{
          "--row-delay": `${Math.min(index * 30, 1500)}ms`,
          background: isSelected ? "#111118" : isTop3 ? "#0f0f18" : "transparent",
          borderLeft: isSelected ? "3px solid #a855f7" : isTop3 ? "3px solid #ffd600" : "3px solid transparent",
        } as React.CSSProperties}
        onClick={onToggleExpand}
      >
        {/* Compare checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
          className="w-5 h-5 rounded border flex items-center justify-center shrink-0 opacity-30 group-hover:opacity-100 transition-opacity"
          style={{
            borderColor: isSelected ? "#a855f7" : "#2a2a3a",
            background: isSelected ? "#a855f722" : "transparent",
            color: isSelected ? "#a855f7" : "#555",
          }}
          title="Összehasonlításhoz hozzáadás"
        >
          {isSelected ? "✓" : ""}
        </button>

        {/* Position */}
        <span className="w-10 sm:w-12 text-right shrink-0" style={{ fontFamily: "var(--font-jetbrains)", fontSize: "0.75rem", color: isTop3 ? "#ffd600" : "#444" }}>
          #{String(result.pos).padStart(3, "0")}
        </span>

        {/* Car name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate" style={{ fontFamily: "var(--font-barlow)", color: isTop3 ? "#ffd600" : "#e8e8ec" }}>
              {result.car}
            </span>
            {isFastest && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0" style={{ fontFamily: "var(--font-barlow-condensed)", background: "#a855f7", color: "#fff" }}>
                FASTEST
              </span>
            )}
          </div>
          <div className="hidden sm:block mt-1">
            <div className="h-1 rounded-full bg-[#1a1a24] overflow-hidden">
              <div
                className="speed-bar h-full rounded-full"
                style={{
                  "--bar-width": `${barWidth}%`,
                  "--delay": `${Math.min(index * 30 + 200, 1700)}ms`,
                  background: result.driver === "Jani" ? "linear-gradient(90deg, #00e5ff88, #00e5ff)" : result.driver === "Csabi" ? "linear-gradient(90deg, #ff354788, #ff3547)" : "linear-gradient(90deg, #55555588, #555)",
                } as React.CSSProperties}
              />
            </div>
          </div>
        </div>

        {/* Driver badge */}
        {result.driver && result.driver !== "?" && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ fontFamily: "var(--font-barlow-condensed)", background: dc + "22", color: dc, border: `1px solid ${dc}44` }}>
            {result.driver}
          </span>
        )}

        {/* Best time */}
        <span className="text-sm sm:text-base font-bold shrink-0" style={{ fontFamily: "var(--font-jetbrains)", color: isTop3 ? "#ffd600" : "#e8e8ec" }}>
          {result.best}
        </span>

        {/* Total */}
        <span className="hidden sm:inline text-xs shrink-0 w-16 text-right" style={{ fontFamily: "var(--font-jetbrains)", color: "#444" }}>
          {result.total || "—"}
        </span>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="ml-8 sm:ml-16 mr-2 mb-2 p-3 rounded-lg" style={{ background: "#0d0d14", border: "1px solid #1a1a24" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "#444", fontFamily: "var(--font-barlow-condensed)" }}>Best Lap</p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#e8e8ec" }}>{result.best}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "#444", fontFamily: "var(--font-barlow-condensed)" }}>Total</p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: result.total ? "#e8e8ec" : "#333" }}>{result.total || "N/A"}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "#444", fontFamily: "var(--font-barlow-condensed)" }}>Pilóta</p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-barlow)", color: dc }}>{result.driver || "?"}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "#444", fontFamily: "var(--font-barlow-condensed)" }}>Pozíció</p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#e8e8ec" }}>#{String(result.pos).padStart(3, "0")}</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
            className="mt-3 px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              fontFamily: "var(--font-barlow-condensed)",
              background: isSelected ? "#a855f722" : "#1a1a24",
              color: isSelected ? "#a855f7" : "#00e5ff",
              border: "1px solid",
              borderColor: isSelected ? "#a855f744" : "#2a2a3a",
            }}
          >
            {isSelected ? "Eltávolítás az összehasonlításból" : "Összehasonlítás ezzel"}
          </button>
        </div>
      )}
    </div>
  );
}
