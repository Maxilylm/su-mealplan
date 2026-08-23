# MealPlan

> Generate a full seven-day meal plan and grocery list from your dietary restrictions and preferences.

**[Live demo](https://mealplan-mlx.vercel.app)**

MealPlan turns a few inputs — dietary restrictions, food preferences, number of people, and budget — into a complete week of meals. An LLM returns breakfast, lunch, dinner, and a snack for each day with prep times and calorie counts, plus a categorized grocery list covering the whole week and a set of meal-prep tips. It strictly honors allergies and other restrictions and scales portions to your household.

## Features

- Seven-day plan with breakfast, lunch, dinner, and snack per day
- Prep time and calorie estimate for every meal, plus a weekly calorie total
- Grocery list grouped by aisle (produce, protein, dairy, grains, pantry, other)
- Honors dietary restrictions and allergies; adjusts portions by number of people and budget
- Three meal-prep tips generated with each plan

## Stack

- Next.js 16 (App Router) with a serverless API route
- React 19, Tailwind CSS 4
- Groq API — Llama 3.3 70B (`llama-3.3-70b-versatile`) with JSON-mode responses

## Running locally

```bash
npm install
npm run dev
```

Set `GROQ_API_KEY` in `.env.local`.

---

Part of a series of 91 small web apps. [Browse them all](https://lorenzoylosada.vercel.app).
