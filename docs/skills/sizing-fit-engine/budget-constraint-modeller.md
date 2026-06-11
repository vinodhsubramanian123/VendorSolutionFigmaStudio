# Solution Sizing: Budget Constraint Modeller

**Domain**: Sizing & Fit Engine

## Purpose
Models total solution cost against hard customer budgets and flags drift.

## Protocol
- Computes aggregated List vs. Net price models for all components.
- Flags any solution exceeding the budget constraint threshold by >5%.
- Generates downgrading strategies (e.g., Titanium to Platinum PSU) to pull the solution back into budget compliance.
