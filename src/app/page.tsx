import { Suspense } from "react";
import results from "../../data/results.json";
import { LaptimingApp } from "@/components/LaptimingApp";

export type Result = {
  pos: number;
  car: string;
  driver: string;
  best: string;
  total: string;
  bestMs: number;
};

export default function Home() {
  return (
    <Suspense>
      <LaptimingApp results={results as Result[]} />
    </Suspense>
  );
}
