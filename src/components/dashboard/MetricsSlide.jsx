import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  { name: "AUC-ROC", value: "0.891", desc: "Model discrimination" },
  { name: "Precision@5", value: "0.72", desc: "Top-5 accuracy" },
  { name: "NDCG@10", value: "0.78", desc: "Ranking quality" },
];

export default function MetricsSlide() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i === 0 ? slides.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === slides.length - 1 ? 0 : i + 1));
  const slide = slides[idx];
  return (
    <Card className="p-6 border-border/50 flex items-center justify-between">
      <button onClick={prev} className="p-2">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="text-center">
        <p className="text-sm font-semibold">{slide.name}</p>
        <p className="text-2xl font-bold tabular-nums">{slide.value}</p>
        <p className="text-xs text-muted-foreground">{slide.desc}</p>
      </div>
      <button onClick={next} className="p-2">
        <ChevronRight className="h-4 w-4" />
      </button>
    </Card>
  );
}
