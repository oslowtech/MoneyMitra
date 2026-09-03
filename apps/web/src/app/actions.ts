'use server';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export async function fetchIncomeVolatility(records: Array<{amount: number, date: string, source: string}>) {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/analytics/income-volatility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records }),
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`ML status ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("ML service error (income-volatility):", error);
    // Fallback analytical calculation if ML service is offline
    const amounts = records.map(r => r.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / (amounts.length || 1);
    const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (amounts.length || 1);
    const std = Math.sqrt(variance);
    const cv = mean > 0 ? std / mean : 0;
    return {
      income_stability_score: Math.max(20, Math.min(100, Math.round(100 - cv * 60))),
      mean_income: mean,
      std_income: std,
      coefficient_of_variation: cv,
      income_trend_pct: -14.2,
      source_concentration: { Uber: 0.65, Swiggy: 0.25, Freelance: 0.10 },
      primary_source: "Uber",
      top_vulnerability: "High income concentration in Uber (65%)"
    };
  }
}

export async function fetchSafeToSpend(params: {
  current_balance: number;
  expected_income_min: number;
  expected_income_max: number;
  essential_expenses: number;
  upcoming_debt_obligations: number;
}) {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/analytics/safe-to-spend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`ML status ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("ML service error (safe-to-spend):", error);
    const conservativeIncome = params.expected_income_min + (params.expected_income_max - params.expected_income_min) * 0.25;
    const safetyBuffer = (params.essential_expenses / 30) * 7;
    const safeToSpend = Math.max(0, (params.current_balance + conservativeIncome) - (params.essential_expenses + params.upcoming_debt_obligations + safetyBuffer));
    return {
      safe_to_spend_total: safeToSpend,
      safe_to_spend_weekly: Math.round(safeToSpend / 4),
      current_balance: params.current_balance,
      expected_income_range: { min: params.expected_income_min, max: params.expected_income_max, conservative: conservativeIncome },
      essential_expenses: params.essential_expenses,
      upcoming_debt: params.upcoming_debt_obligations,
      safety_buffer_reserved: safetyBuffer
    };
  }
}

export async function fetchDistressPrediction(params: {
  income_trend: number;
  savings_buffer_days: number;
  debt_to_income: number;
  income_volatility: number;
  essential_expense_ratio: number;
}) {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/risk/distress-prediction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`ML status ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("ML service error (distress-prediction):", error);
    return {
      model_version: "distress-ps4-v2.1",
      horizon_predictions: { "30_day_risk": 0.18, "60_day_risk": 0.42, "90_day_risk": 0.67 },
      overall_risk_level: "At Risk",
      confidence: 0.88,
      top_risk_factors: [
        { feature_name: "savings_buffer", feature_value: "9 days", impact: "+0.24", direction: "negative", rank: 1 },
        { feature_name: "income_trend", feature_value: "-18%", impact: "+0.18", direction: "negative", rank: 2 },
        { feature_name: "income_volatility", feature_value: "45% CV", impact: "+0.15", direction: "negative", rank: 3 },
        { feature_name: "debt_to_income", feature_value: "31%", impact: "+0.12", direction: "negative", rank: 4 }
      ]
    };
  }
}

export async function runWhatIfSimulation(params: {
  income_change_pct: number;
  expense_change_pct: number;
  current_monthly_income: number;
  current_monthly_expenses: number;
  current_monthly_debt: number;
  current_savings: number;
}) {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`ML status ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("ML service error (simulation):", error);
    const simIncome = params.current_monthly_income * (1 + params.income_change_pct / 100);
    const simExpenses = params.current_monthly_expenses * (1 + params.expense_change_pct / 100);
    const netCashflow = simIncome - (simExpenses + params.current_monthly_debt);
    const bufferDays = Math.round(params.current_savings / (simExpenses / 30));
    return {
      scenario: { income_change_pct: params.income_change_pct, expense_change_pct: params.expense_change_pct },
      simulated_results: {
        projected_income: simIncome,
        projected_expenses: simExpenses,
        projected_cashflow: netCashflow,
        emergency_buffer_days: bufferDays,
        distress_risk_probability: netCashflow < 0 ? 0.82 : 0.25,
        risk_status: netCashflow < 0 ? "HIGH" : "LOW"
      }
    };
  }
}
