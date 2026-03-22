"use client";

import { useState, useMemo } from "react";
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

export function LaptimingApp({ results }: { results: Result[] }) {
  const [search, setSearch] = useState("");
  const [driverFilter, setDriverFilter] = useState<"all" | "Jani" | "Csabi">("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    results.forEach((r) => brandSet.add(getBrand(r.car)));
    return Array.from(brandSet).sort();
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
      {/* Header */}
      <header className="text-center mb-10">
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
        <p
          className="text-lg sm:text-xl mt-2 tracking-[0.3em] uppercase"
          style={{
            fontFamily: "var(--font-barlow-condensed)",
            color: "#888",
          }}
        >
          Kakucs Ring
        </p>
        <p className="text-sm mt-1" style={{ color: "#555" }}>
          {results.length} autó tesztelve
        </p>
      </header>

      {/* Jani vs Csabi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <DriverCard
          name="Jani"
          color="#00e5ff"
          bestTime={janiBest?.best ?? "-"}
          bestCar={janiBest?.car ?? "-"}
          totalCars={janiCars.length}
        />
        <div className="flex items-center justify-center">
          <span
            className="text-3xl sm:text-5xl font-bold"
            style={{
              fontFamily: "var(--font-orbitron)",
              color: "#333",
            }}
          >
            VS
          </span>
        </div>
        <DriverCard
          name="Csabi"
          color="#ff3547"
          bestTime={csabiBest?.best ?? "-"}
          bestCar={csabiBest?.car ?? "-"}
          totalCars={csabiCars.length}
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Legjobb köridő"
          value={results[0]?.best ?? "-"}
          sub={`${results[0]?.car ?? ""} • ${results[0]?.driver || "?"}`}
          accent="#ffd600"
        />
        <StatCard
          label="Összes autó"
          value={String(results.length)}
          sub="tesztelve"
          accent="#a855f7"
        />
        <StatCard
          label="Jani autók"
          value={String(janiCars.length)}
          sub="tesztelés"
          accent="#00e5ff"
        />
        <StatCard
          label="Csabi autók"
          value={String(csabiCars.length)}
          sub="tesztelés"
          accent="#ff3547"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Keresés autó neve alapján..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg border text-sm"
          style={{
            fontFamily: "var(--font-barlow)",
            background: "#111118",
            borderColor: "#2a2a3a",
            color: "#e8e8ec",
          }}
        />
        <div className="flex gap-2">
          {(["all", "Jani", "Csabi"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDriverFilter(d)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                fontFamily: "var(--font-barlow-condensed)",
                background:
                  driverFilter === d
                    ? d === "Jani"
                      ? "#00e5ff"
                      : d === "Csabi"
                        ? "#ff3547"
                        : "#333"
                    : "#1a1a24",
                color:
                  driverFilter === d
                    ? d === "all"
                      ? "#fff"
                      : "#000"
                    : "#888",
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
          style={{
            fontFamily: "var(--font-barlow)",
            background: "#111118",
            borderColor: "#2a2a3a",
            color: "#e8e8ec",
          }}
        >
          <option value="all">Minden márka</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs mb-3" style={{ color: "#555", fontFamily: "var(--font-barlow)" }}>
        {filtered.length} találat
        {!showAll && filtered.length > 50 && ` (Top 50 megjelenítve)`}
      </p>

      {/* Results List */}
      <div className="space-y-1.5">
        {displayed.map((r, idx) => (
          <ResultRow
            key={`${r.pos}-${r.car}`}
            result={r}
            fastestMs={fastestMs}
            index={idx}
          />
        ))}
      </div>

      {/* Show All Toggle */}
      {filtered.length > 50 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              fontFamily: "var(--font-barlow-condensed)",
              background: "#1a1a24",
              border: "1px solid #2a2a3a",
              color: "#00e5ff",
            }}
          >
            {showAll ? "Top 50 mutatása" : `Összes mutatása (${filtered.length})`}
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center border-t" style={{ borderColor: "#1a1a24" }}>
        <p
          className="mt-6 text-sm tracking-[0.3em]"
          style={{ fontFamily: "var(--font-orbitron)", color: "#333" }}
        >
          LAPTIMING
        </p>
        <p className="text-xs mt-1" style={{ color: "#444" }}>
          Kakucs Ring • {results.length} autó
        </p>
      </footer>
    </div>
  );
}

function DriverCard({
  name,
  color,
  bestTime,
  bestCar,
  totalCars,
}: {
  name: string;
  color: string;
  bestTime: string;
  bestCar: string;
  totalCars: number;
}) {
  return (
    <div
      className="rounded-xl p-5 border"
      style={{
        background: "#111118",
        borderColor: color + "33",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: color }}
        />
        <h3
          className="text-lg font-bold tracking-wider"
          style={{ fontFamily: "var(--font-orbitron)", color }}
        >
          {name}
        </h3>
      </div>
      <p
        className="text-2xl font-bold"
        style={{ fontFamily: "var(--font-jetbrains)", color }}
      >
        {bestTime}
      </p>
      <p className="text-xs mt-1 truncate" style={{ color: "#666" }}>
        {bestCar}
      </p>
      <p className="text-xs mt-2" style={{ color: "#555" }}>
        <span className="font-semibold" style={{ color: "#888" }}>
          {totalCars}
        </span>{" "}
        autó tesztelve
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        background: "#111118",
        borderColor: "#1a1a24",
      }}
    >
      <p
        className="text-[10px] uppercase tracking-wider mb-2"
        style={{ fontFamily: "var(--font-barlow-condensed)", color: "#555" }}
      >
        {label}
      </p>
      <p
        className="text-xl font-bold"
        style={{ fontFamily: "var(--font-jetbrains)", color: accent }}
      >
        {value}
      </p>
      <p className="text-[10px] mt-1 truncate" style={{ color: "#444" }}>
        {sub}
      </p>
    </div>
  );
}

function ResultRow({
  result,
  fastestMs,
  index,
}: {
  result: Result;
  fastestMs: number;
  index: number;
}) {
  const isTop3 = result.pos <= 3;
  const isFastest = result.pos === 1;
  const barWidth = (fastestMs / result.bestMs) * 100;
  const driverColor =
    result.driver === "Jani"
      ? "#00e5ff"
      : result.driver === "Csabi"
        ? "#ff3547"
        : "#555";

  return (
    <div
      className="animate-row flex items-center gap-3 sm:gap-4 rounded-lg px-3 sm:px-4 py-2.5 transition-colors hover:bg-[#1a1a24] group"
      style={
        {
          "--row-delay": `${Math.min(index * 30, 1500)}ms`,
          background: isTop3 ? "#111118" : "transparent",
          borderLeft: isTop3 ? `3px solid #ffd600` : "3px solid transparent",
        } as React.CSSProperties
      }
    >
      {/* Position */}
      <span
        className="w-10 sm:w-12 text-right shrink-0"
        style={{
          fontFamily: "var(--font-jetbrains)",
          fontSize: "0.75rem",
          color: isTop3 ? "#ffd600" : "#444",
        }}
      >
        #{String(result.pos).padStart(3, "0")}
      </span>

      {/* Car name + driver */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium truncate"
            style={{
              fontFamily: "var(--font-barlow)",
              color: isTop3 ? "#ffd600" : "#e8e8ec",
            }}
          >
            {result.car}
          </span>
          {isFastest && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0"
              style={{
                fontFamily: "var(--font-barlow-condensed)",
                background: "#a855f7",
                color: "#fff",
              }}
            >
              FASTEST
            </span>
          )}
        </div>
        {/* Speed bar - hidden on mobile */}
        <div className="hidden sm:block mt-1">
          <div className="h-1 rounded-full bg-[#1a1a24] overflow-hidden">
            <div
              className="speed-bar h-full rounded-full"
              style={
                {
                  "--bar-width": `${barWidth}%`,
                  "--delay": `${Math.min(index * 30 + 200, 1700)}ms`,
                  background:
                    result.driver === "Jani"
                      ? "linear-gradient(90deg, #00e5ff88, #00e5ff)"
                      : result.driver === "Csabi"
                        ? "linear-gradient(90deg, #ff354788, #ff3547)"
                        : "linear-gradient(90deg, #55555588, #555)",
                } as React.CSSProperties
              }
            />
          </div>
        </div>
      </div>

      {/* Driver badge */}
      {result.driver && result.driver !== "?" && (
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
          style={{
            fontFamily: "var(--font-barlow-condensed)",
            background: driverColor + "22",
            color: driverColor,
            border: `1px solid ${driverColor}44`,
          }}
        >
          {result.driver}
        </span>
      )}

      {/* Best lap time */}
      <span
        className="text-sm sm:text-base font-bold shrink-0"
        style={{
          fontFamily: "var(--font-jetbrains)",
          color: isTop3 ? "#ffd600" : "#e8e8ec",
        }}
      >
        {result.best}
      </span>

      {/* Total time */}
      <span
        className="hidden sm:inline text-xs shrink-0 w-16 text-right"
        style={{
          fontFamily: "var(--font-jetbrains)",
          color: "#444",
        }}
      >
        {result.total || "—"}
      </span>
    </div>
  );
}
