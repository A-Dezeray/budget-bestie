# Flow Finance

A clean, straightforward budget tracker built to solve a real problem: knowing where your money goes without the overhead of complicated finance apps.

## Why I Built This

I've never been great at tracking my spending. I'd check my bank account, feel vaguely anxious about where my money went, and then forget about it until the next time I needed to buy something. I needed a tool that was simple enough that I'd actually use it — no overcomplicated features, no confusing interfaces.

So I built exactly that. A place to log expenses, see them subtracted from my balance, and move on with my day.

## What It Does

- **Add expenses** with a description and amount
- **Delete items** if you logged something by mistake
- **Real-time balance** that updates as you add or remove expenses
- **Persistent data** saved to localStorage so it's there when you come back
- **Minimalist interface** that doesn't get in the way

The whole point was simplicity. Just the basics, done well.

## How It Works

When you add an expense, it gets stored and rendered as a new item in the list. The running balance updates immediately. If you entered something wrong, delete it and the balance recalculates.

Everything saves to localStorage, so your data persists across tabs, refreshes, and browser restarts. No accounts, no sign-ups — just open it and use it.

## What I Learned Building This

**Working with arrays** — Adding items, removing them, looping through them to display everything on the page. Arrays went from feeling clunky to feeling natural.

**Dynamic rendering** — Instead of hardcoding HTML, I learned how to generate UI from data. Every time the data changed, the display updated to match.

**Data persistence** — localStorage was one of those things I'd heard about but never really understood until I used it here. Saving data as a string, pulling it back out, parsing it into something usable.

**UX simplicity** — Good design isn't about adding more features. It's about making the features you have easy to understand. Every time I was tempted to add something extra, I'd ask: does this actually make the tool better, or just busier? Most of the time, the answer was the latter.

## Challenges

The trickiest part was getting deletion to work properly — making sure the right item was removed, the balance recalculated correctly, and the display updated without breaking anything.

Edge cases forced me to think carefully too. What happens if someone submits without an amount? What about a negative number? Small details like that made me realize how much thought goes into making something foolproof.

## Tech Stack

- React 19 + TypeScript
- Vite
- CSS Modules
- localStorage for persistence

## Getting Started

```bash
npm install
npm run dev
```
