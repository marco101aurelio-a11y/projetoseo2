# Design System Strategy: The Monochromatic Lens

## 1. Overview & Creative North Star: "Precision Ethereality"
This design system moves beyond the "minimalist dashboard" trope to create a "High-End Editorial" experience for SEO professionals. The Creative North Star is **Precision Ethereality**: a blend of brutalist data accuracy and soft, organic interaction. 

To break the "template" look, we reject the rigid grid in favor of **intentional asymmetry**. Data isn't just displayed; it is curated. Large `display-lg` typography provides an authoritative anchor, while floating modules and overlapping surface layers create a sense of depth and architectural intent. We utilize high-contrast typography scales and expansive whitespace to ensure the SEO data feels breathable, not buried.

## 2. Color & Surface Architecture
The palette is strictly monochromatic, utilizing the interaction between light and shadow to define function.

*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` (#f3f4f5) section should sit on a `surface` (#f8f9fa) background. 
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers of fine paper. 
    *   **Base Layer:** `surface` (#f8f9fa)
    *   **Secondary Content Areas:** `surface-container` (#edeeef)
    *   **Floating "Hero" Cards:** `surface-container-lowest` (#ffffff)
*   **The "Glass & Gradient" Rule:** To avoid a flat, "cheap" look, use Glassmorphism for floating navigation or modal overlays. Apply `surface-container-lowest` at 80% opacity with a `backdrop-blur` of 20px. 
*   **Signature Textures:** For primary CTAs (like "Run Analysis"), use a subtle linear gradient transitioning from `primary` (#000000) to `primary-container` (#3c3b3b) at a 45-degree angle. This adds "soul" and a tactile, premium feel to the most critical actions.

## 3. Typography: Editorial Authority
We pair **Manrope** (Display/Headline) with **Inter** (Body/UI) to create a sophisticated hierarchy.

*   **Display & Headlines (Manrope):** Used for "Hero" SEO scores and page titles. The wide apertures of Manrope feel modern and welcoming. Use `display-lg` (3.5rem) for the primary site health score to make it the undisputed focal point.
*   **Body & Labels (Inter):** Inter is utilized for high-legibility data reading. Its neutral tone ensures that complex SEO metrics remain the priority.
*   **The Tonal Shift:** Use `on-surface-variant` (#474747) for secondary descriptions and labels to create a soft visual hierarchy that doesn't compete with the `primary` (#000000) headlines.

## 4. Elevation & Depth: Tonal Layering
In this system, depth is a whisper, not a shout. We move away from structural lines toward "Tonal Layering."

*   **The Layering Principle:** Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f3f4f5) background. The subtle 1-2% contrast difference creates a "soft lift" that is more premium than a heavy shadow.
*   **Ambient Shadows:** If a card must float (e.g., a hover state), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(25, 28, 29, 0.05)`. The color is a tint of `on-surface`, ensuring it feels like natural ambient light.
*   **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use a **Ghost Border**: `outline-variant` (#c6c6c6) at 20% opacity. 100% opaque borders are forbidden.
*   **Radius Continuity:** All containers must adhere to the **Roundedness Scale**. Use `lg` (2rem) for main content cards and `md` (1.5rem) for nested elements. This high radius softens the "industrial" nature of SEO data.

## 5. Components: The Minimalist Toolkit

*   **Primary Buttons:** High-contrast `primary` (#000000) backgrounds with `on-primary` (#e5e2e1) text. Shape: `full` radius. Padding: `3` (1rem) vertical / `6` (2rem) horizontal.
*   **SEO Metric Chips:** Use `secondary-container` (#d6d4d3) backgrounds with `on-secondary-container` (#1b1c1c) text. Use `sm` (0.5rem) radius to differentiate from the rounder action buttons.
*   **Input Fields:** `surface-container-highest` (#e1e3e4) background, no border. On focus, transition to `surface-container-lowest` (#ffffff) with a 20% `outline` (#777777). 
*   **Analysis Cards:** Forbid divider lines. Use `spacing-8` (2.75rem) to separate the "Keyword" column from the "Volume" column. Use `surface-container-low` as a hover state for the entire row instead of a line.
*   **SEO Progress Rings:** Use `primary` (#000000) for the progress indicator and `surface-container-highest` (#e1e3e4) for the track. No shadows on the track.
*   **Status Indicators:** For "Error" states (e.g., broken links), use `error` (#ba1a1a) but keep it as a small, high-density dot or a subtle background tint (`error_container`). Avoid large blocks of red to maintain the monochromatic premium feel.

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetric Padding:** Try using `spacing-16` on the left and `spacing-10` on the right of a container to create a custom, editorial feel.
*   **Embrace Whitespace:** If a section feels "busy," add more `spacing-12` or `spacing-16`. High whitespace is the primary indicator of luxury in this system.
*   **Layer Surfaces:** Think of the UI as a stack of 3D objects. Always ask: "Can I define this area with a color shift instead of a line?"

### Don't:
*   **Don't use 1px solid borders.** They interrupt the eye and make the tool feel like a spreadsheet.
*   **Don't use pure #000000 for body text.** Use `on-surface` (#191c1d) to reduce eye strain and maintain the "soft" feel.
*   **Don't crowd the corners.** Ensure content respects the large corner radii (`1.5rem`+). Text should never feel "pinched" by the curve of the container.
*   **Don't use standard blue for links.** Use `primary` (#000000) with a `surface-tint` (#5f5e5e) underline to keep the monochromatic integrity.