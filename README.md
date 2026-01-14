# Mercanto: The Conversational Intelligence Layer for Modern Commerce

Mercanto is a high-fidelity, platform-agnostic AI agent designed to bridge the gap between complex e-commerce data and actionable business strategy. Built for the modern merchant, it transforms raw metrics into interactive visualizations and strategic insights through a natural language interface.

🚀 Key Features

- 🧠 Hybrid Reasoning Engine: Leverages Gemini 3 Pro with a toggleable Deep Thinking Mode (32k token budget) for complex forecasting, seasonal trend analysis, and cross-channel correlations.
- 📊 Live Data Visualization: Automatically generates interactive Chart.js components (Line, Bar, and Pie charts) directly within the chat stream using a custom json-chart rendering engine.
- 🌓 Adaptive UI/UX: A premium, glassmorphic interface featuring a robust Dark/Light mode system, smooth CSS transitions, and mobile-responsive design.
- 🌐 Platform Agnostic: Deep domain knowledge across Shopify, WooCommerce, Magento, and BigCommerce, providing expert advice on inventory turnover, LTV, and CAC optimization.
- 💾 Contextual Persistence: Full session continuity and message history management using localized storage for seamless multi-day analysis.

🛠 Tech Stack

- Core: React 19 + TypeScript
- AI: Google GenAI SDK (Gemini 3 Pro Preview)
- Styling: Tailwind CSS (Custom Brand Theme)
- Charts: Chart.js Integration
- State: React Hooks with persistent LocalStorage synchronization

🎯 Use Cases

- "Analyze my sales trends from last Q4 and project growth for this year."
- "What is the best discount strategy for high-inventory, low-velocity products?"
- "Compare my conversion rate across mobile vs desktop and suggest 3 UX improvements."

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1x4PkJJKYlucrJkeYX5Ig-0kscyDnXX2U

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
