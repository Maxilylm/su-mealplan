import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { restrictions, preferences, people, budget } = await req.json();

    if (!restrictions && !preferences) {
      return NextResponse.json(
        { error: "Please provide dietary restrictions or preferences." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfigured: missing API key." },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a professional meal planning nutritionist. Generate a 7-day meal plan based on the user's dietary restrictions and preferences. Return ONLY valid JSON with no markdown, no code fences.

The JSON must have this exact structure:
{
  "plan": [
    {
      "day": "Monday",
      "breakfast": { "name": "...", "description": "...", "prepTime": "15 min", "calories": 350 },
      "lunch": { "name": "...", "description": "...", "prepTime": "20 min", "calories": 500 },
      "dinner": { "name": "...", "description": "...", "prepTime": "30 min", "calories": 600 },
      "snack": { "name": "...", "description": "...", "prepTime": "5 min", "calories": 150 }
    }
  ],
  "groceryList": {
    "produce": ["item 1", "item 2"],
    "protein": ["item 1"],
    "dairy": ["item 1"],
    "grains": ["item 1"],
    "pantry": ["item 1"],
    "other": ["item 1"]
  },
  "weeklyCalories": 11200,
  "tips": ["tip 1", "tip 2", "tip 3"]
}

Rules:
- Strictly respect ALL dietary restrictions (allergies, intolerances, ethical choices)
- Keep meals simple and practical — max 6-8 ingredients each
- Vary cuisines and flavors across the week
- Include realistic prep times
- Grocery list should cover all 7 days with reasonable quantities
- Provide 3 helpful meal prep tips
- Adjust portions for ${people || 1} person(s)
- Budget level: ${budget || "moderate"}`;

    const userMessage = `Dietary restrictions: ${restrictions || "none specified"}
Preferences: ${preferences || "none specified"}
Cooking for: ${people || 1} person(s)
Budget: ${budget || "moderate"}`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 8000,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      return NextResponse.json(
        { error: "AI service error. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI." },
        { status: 502 }
      );
    }

    const mealPlan = JSON.parse(content);
    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
