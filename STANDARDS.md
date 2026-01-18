# STANDARDS.md: G-Pilot v8.1 Design System

## 1. Visual Language: "The Linear Standard"
- **Aesthetic**: Modern Minimalist, Dark Mode Native via Clerk & Next-Themes.
- **Typography**: Outfit (Headings), Inter (Body), DM Serif Display (Italic emphasis).
- **Icons**: Lucide-React (Primary), custom 3D Branded Medallions (High-Fidelity).

## 2. Component Protocols
- **Glassmorphism**: Use `backdrop-blur-3xl` and `bg-white/70` (light) or `bg-black/80` (dark) for all floating elements.
- **3D Medallions**: All tool icons must be wrapped in the `TacticalBox` medallion ring (circular glass, 3D depth).
- **Transitions**: Native Framer Motion. Zero transform collisions with `transition-all`. Use `whileHover` for scale/shadow.

## 3. Responsive Breakpoints
- **Desktop (1600px)**: Cinematic 8K layout.
- **Laptop (1280px)**: Tactical link collapse.
- **Tablet (768px)**: Centralized branding, orbital radius reduction (240px).
- **Mobile (375px)**: Vertical stack, font reduction (H1 -> 4xl), simplified UI.

## 4. Brand Colors
- **Core Blue**: `#0b57d0` (Orbital Blue).
- **Accent Emerald**: `#10b981` (Velocity Green).
- **Background**: `#0b0e14` (Deep Space).
