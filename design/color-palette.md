## 🎨 Color Palette

### Primary (Mint Green)
| Token | HEX | RGB | Usage |
|-------|-----|-----|-------|
| `mint` | `#D1FFC6` | `209, 255, 198` | Primary accent, CTAs, success |
| `mint-dark` | `#86efac` | `134, 239, 172` | Gradient end, hover |

### Background Scale
| Token | HEX | RGB | Usage |
|-------|-----|-----|-------|
| `bg-deep` | `#0f1419` | `15, 20, 25` | Page background |
| `bg-indigo` | `#1a1f35` | `26, 31, 53` | Gradient stop |
| `bg-slate` | `#1e2a38` | `30, 42, 56` | Gradient stop |
| `bg-teal` | `#182025` | `24, 32, 37` | Gradient stop |
| `bg-card` | `#232C33` | `35, 44, 51` | Card surfaces |
| `bg-card-hover` | `#2a353e` | `42, 53, 62` | Active/expanded |

### Accent Colors
| Token | HEX | RGB | Usage |
|-------|-----|-----|-------|
| `indigo` | `#818cf8` | `129, 140, 248` | Private/personal |
| `violet` | `#8b5cf6` | `139, 92, 246` | Indigo gradient |
| `amber` | `#fbbf24` | `251, 191, 36` | Tips, company |
| `orange` | `#f97316` | `249, 115, 22` | Amber gradient |
| `rose` | `#f87171` | `248, 113, 113` | Deadlines, errors |

### Text Scale
| Token | HEX | Opacity | Usage |
|-------|-----|---------|-------|
| `text-primary` | `#ffffff` | 100% | Headings |
| `text-secondary` | `#e5e7eb` | ~90% | Body |
| `text-tertiary` | `#9ca3af` | ~65% | Labels |
| `text-muted` | `#6b7280` | ~46% | Subtle |

---

## 🌈 Gradients

### Background (135°)
```
#0f1419 → #1a1f35 → #1e2a38 → #182025 → #0f1419
   0%        25%        50%        75%       100%
```

### Mint Button (135°)
```
#D1FFC6 → #86efac
   0%       100%
```

### Private Badge (↓)
```
#818cf8 → #8b5cf6
```

### Company Badge (↓)
```
#fbbf24 → #f97316
```

---

## 💫 Effects

### Shadows
| Name | Value | Usage |
|------|-------|-------|
| `shadow-mint` | `0 4px 25px rgba(209,255,198,0.35)` | Active buttons |
| `shadow-mint-soft` | `0 0 30px rgba(209,255,198,0.15)` | Expanded cards |
| `shadow-mint-glow` | `0 0 10px rgba(209,255,198,0.5)` | Current marker |

### Transparency Levels
| Name | Value | Usage |
|------|-------|-------|
| `border-subtle` | `rgba(255,255,255,0.1)` | Default borders |
| `border-mint` | `rgba(209,255,198,0.2)` | Mint-tinted |
| `border-mint-strong` | `rgba(209,255,198,0.3)` | Active states |
| `card-glass` | `rgba(35,44,51,0.6)` | Card background |
| `card-glass-solid` | `rgba(35,44,51,0.7)` | Prominent cards |

### Blur
- Cards: `backdrop-blur: 12px` (sm)
- Glow orbs: `blur: 48px` (3xl)

---

## 📋 Quick Copy

**Core 5 colors:**
```
#D1FFC6  #232C33  #0f1419  #818cf8  #f87171
```

**Full palette (one line):**
```
#D1FFC6 #86efac #0f1419 #1a1f35 #1e2a38 #182025 #232C33 #2a353e #818cf8 #8b5cf6 #fbbf24 #f97316 #f87171 #ffffff #e5e7eb #9ca3af #6b7280
```

**CSS gradient:**
```css
background: linear-gradient(135deg, #0f1419 0%, #1a1f35 25%, #1e2a38 50%, #182025 75%, #0f1419 100%);
```
