import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { getCandles } from "../services/api";
export default function MarketChart({ symbol, liveCandle }) {
  const ref = useRef(null);
  const seriesRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await getCandles(symbol);
      if (!mounted || !ref.current) return;
      const chart = createChart(ref.current, {
        height: 390,
        layout: { background: { color: "#0b1220" }, textColor: "#94a3b8" },
        grid: {
          vertLines: { color: "#172238" },
          horzLines: { color: "#172238" },
        },
        rightPriceScale: { borderColor: "#243047" },
        timeScale: { borderColor: "#243047", timeVisible: true },
      });
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderVisible: false,
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });
      series.setData(data);
      chart.timeScale().fitContent();
      chartRef.current = chart;
      seriesRef.current = series;
    })();
    return () => {
      mounted = false;
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [symbol]);
  useEffect(() => {
    if (liveCandle && seriesRef.current) seriesRef.current.update(liveCandle);
  }, [liveCandle]);
  return <div ref={ref} className="chart" />;
}
