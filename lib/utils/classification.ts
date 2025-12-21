export function classifyDayPerformance(record: any, historicalRecords: any[] = []) {
  const operationalProfit = Number(record.operational_profit) || 0
  const grossRevenue = Number(record.gross_revenue) || 0
  const kmDriven = Number(record.km_driven) || 0

  const profitMargin = grossRevenue > 0 ? (operationalProfit / grossRevenue) * 100 : 0
  const profitPerKm = kmDriven > 0 ? operationalProfit / kmDriven : 0

  let classification = "Médio"
  let explanation = "Desempenho dentro da média."

  // Compare with historical data if available
  if (historicalRecords.length > 0) {
    const avgProfitMargin =
      historicalRecords.reduce((sum, r) => {
        const op = Number(r.operational_profit) || 0
        const gr = Number(r.gross_revenue) || 0
        return sum + (gr > 0 ? (op / gr) * 100 : 0)
      }, 0) / historicalRecords.length

    const avgProfitPerKm =
      historicalRecords.reduce((sum, r) => {
        const op = Number(r.operational_profit) || 0
        const km = Number(r.km_driven) || 0
        return sum + (km > 0 ? op / km : 0)
      }, 0) / historicalRecords.length

    if (profitMargin >= avgProfitMargin * 1.15 && profitPerKm >= avgProfitPerKm * 1.15) {
      classification = "Bom"
      explanation = `Excelente margem de lucro (${profitMargin.toFixed(1)}%) e rentabilidade por km (R$ ${profitPerKm.toFixed(2)}/km), bem acima da sua média histórica.`
    } else if (profitMargin < avgProfitMargin * 0.85 || profitPerKm < avgProfitPerKm * 0.85) {
      classification = "Ruim"
      explanation = `Margem de lucro (${profitMargin.toFixed(1)}%) ou lucro por km (R$ ${profitPerKm.toFixed(2)}/km) abaixo da média histórica. Considere revisar estratégia ou custos.`
    } else {
      classification = "Médio"
      explanation = `Desempenho dentro da média. Margem de ${profitMargin.toFixed(1)}% e R$ ${profitPerKm.toFixed(2)}/km.`
    }
  } else {
    // Without historical data, use absolute thresholds
    if (profitMargin >= 40 && profitPerKm >= 3) {
      classification = "Bom"
      explanation = `Excelente margem de lucro (${profitMargin.toFixed(1)}%) e rentabilidade por km (R$ ${profitPerKm.toFixed(2)}/km).`
    } else if (profitMargin < 30 || profitPerKm < 2) {
      classification = "Ruim"
      explanation = `Margem de lucro baixa (${profitMargin.toFixed(1)}%) ou lucro por km insuficiente (R$ ${profitPerKm.toFixed(2)}/km). Considere revisar estratégia.`
    }
  }

  const classificationColors = {
    Bom: { badge: "bg-green-500/20 text-green-400 border-green-500/50", icon: "text-green-400" },
    Médio: {
      badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      icon: "text-yellow-400",
    },
    Ruim: { badge: "bg-red-500/20 text-red-400 border-red-500/50", icon: "text-red-400" },
  }

  return {
    classification,
    explanation,
    colors: classificationColors[classification as keyof typeof classificationColors],
  }
}
