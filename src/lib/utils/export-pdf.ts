"use client";

import type { TravelPlan, DayPlan } from "@/lib/types/plan";

/**
 * Capture a DOM element and export it as a multi-page A4 PDF.
 * Dynamic imports keep jspdf/html2canvas out of the server bundle.
 */
export async function exportPlanToPdf(
  elementId: string,
  plan: TravelPlan,
): Promise<void> {
  if (typeof window === "undefined") return;

  const el = document.getElementById(elementId);
  if (!el) {
    throw new Error(`Export kök elemanı bulunamadı: #${elementId}`);
  }

  const [{ default: html2canvas }, jsPdfMod] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  const JsPDFCtor =
    (jsPdfMod as unknown as { jsPDF?: typeof import("jspdf").jsPDF }).jsPDF ??
    (jsPdfMod as unknown as { default: typeof import("jspdf").jsPDF }).default;

  const canvas = await html2canvas(el, {
    backgroundColor: "#0A0E1A",
    scale: Math.min(2, window.devicePixelRatio || 1.5),
    useCORS: true,
    logging: false,
    windowWidth: el.scrollWidth,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.92);

  const pdf = new JsPDFCtor({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;
  }

  pdf.setProperties({
    title: `Voyari Plan ${plan.id}`,
    subject: "Voyari AI Travel Plan",
    author: "Voyari",
    creator: "Voyari",
  });

  pdf.save(`voyari-plan-${plan.id}.pdf`);
}

function fmtMoney(n: number | undefined, currency: string): string {
  if (n === undefined || Number.isNaN(n)) return "-";
  return `${Math.round(n).toLocaleString("tr-TR")} ${currency}`;
}

function renderDay(day: DayPlan, currency: string): string {
  const head = `## Gün ${day.dayNumber} — ${day.title}${day.subtitle ? ` _(${day.subtitle})_` : ""}\n**Tarih:** ${day.date} · **Şehir:** ${day.city}${day.country ? `, ${day.country}` : ""}`;

  const driving = day.driving
    ? `\n\n**Sürüş:** ${day.driving.fromCity} → ${day.driving.toCity} · ${day.driving.distanceKm} km · ${day.driving.durationHours} sa\n_Rota:_ ${day.driving.route}`
    : "";

  const tl = day.timeline?.length
    ? `\n\n### Program\n${day.timeline
        .map(
          (t) =>
            `- **${t.time}${t.endTime ? `–${t.endTime}` : ""}** ${t.icon ?? ""} ${t.title}${t.location ? ` · _${t.location}_` : ""}${t.cost ? ` · ${fmtMoney(t.cost, t.currency ?? currency)}` : ""}\n  ${t.description}`,
        )
        .join("\n")}`
    : "";

  const hotel = day.accommodation?.primary
    ? `\n\n### Konaklama\n- **${day.accommodation.primary.name}**${day.accommodation.primary.stars ? ` · ${day.accommodation.primary.stars}★` : ""} · ${fmtMoney(day.accommodation.primary.pricePerNight, day.accommodation.primary.currency)}/gece\n  ${day.accommodation.primary.location}`
    : "";

  const meals = day.meals
    ? `\n\n### Yemekler\n${(
        [
          ["Kahvaltı", day.meals.breakfast],
          ["Öğle", day.meals.lunch],
          ["Akşam", day.meals.dinner],
        ] as const
      )
        .filter(([, m]) => !!m)
        .map(
          ([label, m]) =>
            `- **${label}:** ${m!.restaurantName} (${m!.cuisine}) — ${fmtMoney(m!.pricePerPerson, m!.currency)}/kişi\n  _Mutlaka denen:_ ${m!.mustTry}`,
        )
        .join("\n")}`
    : "";

  const tips = day.tips?.length
    ? `\n\n### İpuçları\n${day.tips.map((t) => `- ${t}`).join("\n")}`
    : "";

  const budget = day.dayBudget
    ? `\n\n**Günlük Bütçe:** ${fmtMoney(day.dayBudget, currency)}`
    : "";

  return `${head}${driving}${tl}${hotel}${meals}${tips}${budget}`;
}

export function planToMarkdown(plan: TravelPlan): string {
  const p = plan.profile;
  const currency = plan.budget?.currency ?? "EUR";

  const header = `# Voyari Seyahat Planı\n\n**Plan ID:** \`${plan.id}\`\n**Oluşturulma:** ${new Date(plan.createdAt).toLocaleString("tr-TR")}\n\n---\n`;

  const overview = `## Genel Bakış\n- **Kalkış:** ${p.departure?.city ?? "-"}\n- **Varış:** ${p.destination?.city ?? p.destination?.country ?? "Esnek"}\n- **Tarihler:** ${p.startDate} → ${p.endDate} (${p.totalDays} gün)\n- **Gezgin:** ${p.travelers?.adults ?? 0} yetişkin${(p.travelers?.children ?? 0) > 0 ? ` + ${p.travelers.children} çocuk` : ""}\n- **Profil:** ${p.preferences?.profileType ?? "-"}\n- **Ulaşım:** ${p.transport?.type ?? "-"}\n- **Bütçe Seviyesi:** ${p.budget?.level ?? "-"}\n`;

  const route = plan.route
    ? `\n## Rota\n- **Toplam Mesafe:** ${plan.route.totalDistanceKm} km\n- **Toplam Sürüş:** ${plan.route.totalDrivingHours} saat\n- **Ülkeler:** ${(plan.route.countries ?? []).map((c) => c.name).join(", ")}\n`
    : "";

  const days = (plan.days ?? [])
    .map((d) => renderDay(d, currency))
    .join("\n\n---\n\n");

  const budget = plan.budget
    ? `\n\n---\n\n## Bütçe\n- **Toplam:** ${fmtMoney(plan.budget.totalEstimate, currency)}\n- **Kişi Başı:** ${fmtMoney(plan.budget.perPersonEstimate, currency)}\n\n### Dağılım\n${(plan.budget.breakdown ?? []).map((b) => `- ${b.category}: ${fmtMoney(b.amount, currency)} (%${b.percentage})`).join("\n")}\n\n### Tasarruf İpuçları\n${(plan.budget.savingTips ?? []).map((t) => `- ${t}`).join("\n")}`
    : "";

  const logistics = plan.logistics
    ? `\n\n---\n\n## Lojistik & Kontrol Listeleri\n\n### Belgeler\n${(plan.logistics.documentChecklist ?? []).map((d) => `- [${d.done ? "x" : " "}] ${d.label}`).join("\n")}\n\n### Bagaj\n${(plan.logistics.packingList ?? []).map((d) => `- [${d.done ? "x" : " "}] ${d.label}`).join("\n")}\n\n### Rezervasyon Takvimi\n${(plan.logistics.reservationTimeline ?? []).map((r) => `- **${r.dueDate}** — ${r.title}${r.notes ? ` _(${r.notes})_` : ""}`).join("\n")}`
    : "";

  const weather = plan.weather?.length
    ? `\n\n---\n\n## Hava Durumu\n${plan.weather.map((w) => `- **${w.date}** ${w.city}: ${w.tempMin}° / ${w.tempMax}°, yağış %${w.precipitationChance} — ${w.summary}`).join("\n")}`
    : "";

  return `${header}\n${overview}${route}\n\n---\n\n${days}${budget}${logistics}${weather}\n`;
}

export function exportPlanToMarkdown(plan: TravelPlan): string {
  const md = planToMarkdown(plan);
  if (typeof window !== "undefined") {
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voyari-plan-${plan.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return md;
}
