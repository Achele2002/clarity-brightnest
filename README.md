# BrightNest - Blockchain Habit Tracker

A decentralized habit tracking system built on Stacks blockchain that helps users build and maintain positive routines.

## Features
- Create and track daily habits
- Mark habits as complete
- Get streak counts for consistent habit completion
- Earn reward points for completed habits
- View habit history and statistics
- Accurate streak tracking that resets when daily completion is missed

## Contract Functions
- create-habit: Create a new habit to track
- complete-habit: Mark a habit as complete for the day
- get-streak: Get current streak for a habit
- get-habit-history: View completion history for a habit
- get-points: View reward points balance

## Streak Tracking
The contract now includes improved streak tracking:
- Streaks increment only for consecutive daily completions
- Missing a day resets the current streak to 1
- Longest streak is preserved for historical tracking
- Last completion date is stored to verify streak continuity

## Getting Started
[Instructions for deploying and interacting with contract]
