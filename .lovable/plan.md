

# Driver Booster 13.1 — Exact Web Replica

A fully interactive web clone of IObit Driver Booster 13.1, replicating the dark UI, all sections, and simulated interactions.

## Design & Theme
- Dark theme matching Driver Booster's dark gray/black color scheme with red accent colors
- Left sidebar navigation with icon + label items (Scan/Update, Boost, Tools, Action Center)
- Top header bar with app title "Driver Booster 13.1", FREE badge, and window control icons
- Hamburger menu opening a slide-out panel (Settings, Driver Update History, Check for Updates, User Manual, Technical Support, Skin selector, etc.)

## 1. Scan Page (Home)
- Large circular **SCAN** button with red glow ring animation
- Info banner: "Scan to check the status of drivers!"
- On click: animated scanning state with circular progress bar, percentage counter, "Scanning..." text with current driver name cycling, and a **STOP** button
- After scan completes: transitions to results view

## 2. Scan Results / Update Page
- Alert banner: "X device drivers outdated" with "Scan again" link
- "Update Now" red button at top
- PRO upgrade upsell banner
- List of outdated drivers with: checkbox, icon, driver name, category badge (PRO), current version date, available version date, individual "Update" button
- "UpToDate (N)" collapsed section at the bottom
- Large circular **UPDATE** button in the center
- PC Info widget on the right side (OS, CPU, GPU, RAM, "Learn More")

## 3. Boost Page
- Three cards side by side: **Game Boost**, **Internet Boost**, **System Optimize**
- Each with a gauge/icon graphic, status indicator, action button (Super Boost / Boost Now / Check Now), and description text
- Game Boost has a "Configure" link and ON/OFF gauge

## 4. Tools Page
- **Hot Fix Tools** section: cards for Backup & Restore, Fix No Sound, Fix Device Error (with issue count)
- Right sidebar actions: Clean Invalid Device Data (with count), Fix Network Failure, Fix Bad Resolution
- **Other Useful Tools** section: grid of tool cards — Fix Incompatible Drivers, Offline Driver Updater, System Information, Free & Fast VPN, Screen Recorder (with NEW badges)

## 5. Action Center Page
- Info banner: "Make PC safer and faster with the following programs recommended by IObit"
- Hide link at top right
- List of recommended apps (iTop VPN, iTop Screen Recorder, iTop Easy Desktop, Advanced SystemCare) each with: HOT badge, icon, name, description, orange "Install now" button

## 6. Hamburger Menu (Slide-out)
- Menu items: Settings, Driver Update History, Check for Updates, User Manual, Technical Support, Help Us Translate, What's New, About
- **Skin** section at the bottom with theme preview thumbnail and color swatches

## 7. Bottom Promo Banner
- Persistent promotional banner at the bottom with discount messaging and "Check It Out" / "Enter Code" actions

## Interactions & Animations
- Scan button: red glow pulse animation, click triggers scanning state
- Scanning: circular progress animation with percentage, driver name cycling
- Navigation between all sections via sidebar with active state highlighting
- All buttons have hover effects
- Simulated fake driver data (hardcoded list of realistic driver names, versions, dates)

