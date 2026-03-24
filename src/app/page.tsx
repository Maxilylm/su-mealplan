"use client";

import { useState } from "react";

interface Meal {
  name: string;
  description: string;
  prepTime: string;
  calories: number;
}

interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
}

interface GroceryList {
  produce: string[];
  protein: string[];
  dairy: string[];
  grains: string[];
  pantry: string[];
  other: string[];
}

interface MealPlan {
  plan: DayPlan[];
  groceryList: GroceryList;
  weeklyCalories: number;
  tips: string[];
}

const RESTRICTION_PRESETS = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Keto",
  "Paleo",
  "Low-carb",
  "Nut-free",
  "Halal",
  "Kosher",
];

const MEAL_ICONS: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
};

const MEAL_COLORS: Record<string, string> = {
  breakfast: "border-amber-500/30 bg-amber-500/5",
  lunch: "border-orange-500/30 bg-orange-500/5",
  dinner: "border-indigo-500/30 bg-indigo-500/5",
  snack: "border-green-500/30 bg-green-500/5",
};

const GROCERY_ICONS: Record<string, string> = {
  produce: "🥬",
  protein: "🥩",
  dairy: "🧀",
  grains: "🌾",
  pantry: "🫙",
  other: "📦",
};

export default function Home() {
  const [restrictions, setRestrictions] = useState("");
  const [preferences, setPreferences] = useState("");
  const [people, setPeople] = useState("1");
  const [budget, setBudget] = useState("moderate");
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set());
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"plan" | "grocery">("plan");
  const [activeDay, setActiveDay] = useState(0);

  function togglePreset(preset: string) {
    const next = new Set(selectedPresets);
    if (next.has(preset)) next.delete(preset);
    else next.add(preset);
    setSelectedPresets(next);
    setRestrictions(Array.from(next).join(", "));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restrictions: restrictions.trim(),
          preferences: preferences.trim(),
          people: parseInt(people) || 1,
          budget,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setPlan(data);
      setActiveDay(0);
      setActiveTab("plan");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function renderMealCard(type: string, meal: Meal) {
    return (
      <div
        key={type}
        className={`rounded-xl border p-4 ${MEAL_COLORS[type]} transition-all hover:scale-[1.01]`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{MEAL_ICONS[type]}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {type}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>⏱ {meal.prepTime}</span>
            <span className="font-mono">{meal.calories} cal</span>
          </div>
        </div>
        <h4 className="font-semibold text-zinc-100 mb-1">{meal.name}</h4>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {meal.description}
        </p>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
          <span className="text-zinc-50">Meal</span>
          <span className="text-emerald-400">Plan</span>
          <span className="text-zinc-500 text-2xl sm:text-3xl ml-2">AI</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          Your dietary needs → a full 7-day meal plan + grocery list
        </p>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5"
      >
        {/* Preset toggles */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Quick Restrictions
          </label>
          <div className="flex flex-wrap gap-2">
            {RESTRICTION_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePreset(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedPresets.has(p)
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:border-zinc-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Restrictions text */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Dietary Restrictions / Allergies
          </label>
          <input
            type="text"
            value={restrictions}
            onChange={(e) => setRestrictions(e.target.value)}
            placeholder="e.g. Vegetarian, no nuts, lactose intolerant..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm"
          />
        </div>

        {/* Preferences */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Preferences (optional)
          </label>
          <input
            type="text"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="e.g. Mediterranean cuisine, high protein, quick meals..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm"
          />
        </div>

        {/* People + Budget row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Servings
            </label>
            <select
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "person" : "people"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Budget
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
            >
              <option value="budget">Budget-friendly</option>
              <option value="moderate">Moderate</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={(!restrictions.trim() && !preferences.trim()) || loading}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Generating your meal plan...
            </span>
          ) : (
            "Generate 7-Day Meal Plan"
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {plan && (
        <div className="space-y-6">
          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">7</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">
                Days
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">28</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">
                Meals
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400 font-mono text-xl">
                {plan.weeklyCalories?.toLocaleString() || "~11,200"}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">
                Weekly Cal
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setActiveTab("plan")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "plan"
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              📅 Meal Plan
            </button>
            <button
              onClick={() => setActiveTab("grocery")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "grocery"
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              🛒 Grocery List
            </button>
          </div>

          {/* Plan Tab */}
          {activeTab === "plan" && plan.plan && (
            <div>
              {/* Day selector */}
              <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2">
                {plan.plan.map((day, i) => (
                  <button
                    key={day.day}
                    onClick={() => setActiveDay(i)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      activeDay === i
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {day.day}
                  </button>
                ))}
              </div>

              {/* Day meals */}
              {plan.plan[activeDay] && (
                <div className="space-y-3">
                  {(["breakfast", "lunch", "dinner", "snack"] as const).map(
                    (type) =>
                      plan.plan[activeDay][type] &&
                      renderMealCard(type, plan.plan[activeDay][type])
                  )}
                  {/* Day total */}
                  <div className="text-right text-xs text-zinc-500 pr-2">
                    Day total:{" "}
                    <span className="font-mono text-zinc-300">
                      {(
                        (plan.plan[activeDay].breakfast?.calories || 0) +
                        (plan.plan[activeDay].lunch?.calories || 0) +
                        (plan.plan[activeDay].dinner?.calories || 0) +
                        (plan.plan[activeDay].snack?.calories || 0)
                      ).toLocaleString()}{" "}
                      cal
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Grocery Tab */}
          {activeTab === "grocery" && plan.groceryList && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(plan.groceryList).map(([category, items]) => {
                if (!items || items.length === 0) return null;
                return (
                  <div
                    key={category}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
                  >
                    <h4 className="flex items-center gap-2 font-semibold text-zinc-200 mb-3">
                      <span>{GROCERY_ICONS[category] || "📦"}</span>
                      <span className="capitalize">{category}</span>
                      <span className="text-xs text-zinc-500 font-normal ml-auto">
                        {items.length} items
                      </span>
                    </h4>
                    <ul className="space-y-1.5">
                      {items.map((item: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-zinc-400"
                        >
                          <span className="w-4 h-4 rounded border border-zinc-700 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tips */}
          {plan.tips && plan.tips.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="flex items-center gap-2 font-semibold text-zinc-200 mb-3">
                <span>💡</span> Meal Prep Tips
              </h3>
              <ul className="space-y-2">
                {plan.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-zinc-400 leading-relaxed"
                  >
                    <span className="text-emerald-400 font-bold mt-0.5">
                      {i + 1}.
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-zinc-600 text-xs">
        Powered by Groq + Llama 3.3 70B
      </footer>
    </main>
  );
}
