'use client';
import { useState } from 'react';
import './globals.css';

export default function HiveRecipe() {
  const [servings, setServings] = useState(2);
  const baseServings = 2;

  const ingredients = [
    { name: "Linguine pasta", amount: 8, unit: "oz" },
    { name: "Extra virgin olive oil", amount: 2, unit: "tbsp" },
    { name: "Garlic cloves, minced", amount: 4, unit: "cloves" },
    { name: "Red pepper flakes", amount: 0.5, unit: "tsp" },
    { name: "Lemon, juiced and zested", amount: 1, unit: "whole" },
    { name: "Fresh parsley, chopped", amount: 0.25, unit: "cup" }
  ];

  const scale = (amount: number) => {
    const scaled = (amount / baseServings) * servings;
    return Number.isInteger(scaled) ? scaled : scaled.toFixed(2);
  };

  return (
    <div className="recipe-card">
      <div className="recipe-hero"></div>
      <div className="recipe-content">
        <h1>Lemon Garlic Linguine</h1>
        
        <div className="meta-info">
          <span>⏱ Prep: 10 mins</span>
          <span>🔥 Cook: 15 mins</span>
          <span>🍝 Difficulty: Easy</span>
        </div>

        <div className="scaler-controls">
          <div>
            <h3>Interactive UDS Recipe</h3>
            <p style={{margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#ea580c'}}>Scale servings and watch the math happen automatically.</p>
          </div>
          <div className="servings-toggle">
            {[1, 2, 4, 8].map(num => (
              <button 
                key={num}
                className={\`btn-serve \${servings === num ? 'active' : ''}\`}
                onClick={() => setServings(num)}
              >
                {num}x
              </button>
            ))}
          </div>
        </div>

        <h2>Ingredients (for {servings})</h2>
        <ul className="ingredients-list">
          {ingredients.map((ing, idx) => (
            <li key={idx}>
              <span className="amount">{scale(ing.amount)} {ing.unit}</span>
              <span className="name">{ing.name}</span>
            </li>
          ))}
        </ul>

        <div className="uds-footer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          Powered by Universal Document Structured Data
        </div>
      </div>
    </div>
  );
}