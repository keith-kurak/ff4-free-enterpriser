# FF4 Free Enterprise Run Tracker - Design Guidelines

## Architecture Decisions

### Authentication
**No Authentication Required**
- This is a single-user utility app with local-only data storage
- Include a Settings screen (accessible from tab bar or header) with:
  - App preferences (theme toggle, default run flags)
  - About section (app version, credits)
  - Data management (export/import runs, clear all data with confirmation)

### Navigation
**Tab Navigation (3 tabs)**
- Tab 1: "Current Run" - Active run tracking
- Tab 2: "History" - Completed runs list
- Tab 3: "Reference" - Game data reference

**No floating action button** - Primary action ("Start New Run") appears contextually when no active run exists.

### Screen Specifications

#### Tab 1: Current Run
**Empty State (No Active Run)**
- Purpose: Prompt user to start a new run
- Layout:
  - Default navigation header with title "Current Run"
  - Centered empty state illustration/icon
  - "Start New Run" primary button below illustration
  - Safe area insets: top (headerHeight + Spacing.xl), bottom (tabBarHeight + Spacing.xl)

**New Run Setup (Modal Stack)**
- **Screen 1: Run Name & Flags**
  - Purpose: Configure new run parameters
  - Layout:
    - Custom header with "Cancel" (left) and "Next" (right)
    - Scrollable form with:
      - Text input for run name
      - Four toggle switches for flags with labels and helper text
    - Safe area insets: top (headerHeight + Spacing.md), bottom (insets.bottom + Spacing.xl)
  
- **Screen 2: Active Run Dashboard**
  - Purpose: Track shops and key items during run
  - Layout:
    - Default header with "Current Run" title and "Complete Run" button (right)
    - Scrollable content with collapsible sections:
      - **Shops Section**: Grouped by location with nested shop types
      - **Key Items Section**: Grouped by type (Main Quest, Summon Quests, MIAB) based on flags
    - Each checkbox row has: checkbox (left), label (center), "Return" toggle (right, shops only)
    - Safe area insets: top (headerHeight + Spacing.xl), bottom (tabBarHeight + Spacing.xl)

**Complete Run Form (Modal)**
- Purpose: Record run completion data
- Layout:
  - Custom header with "Cancel" (left) and "Save" (right)
  - Scrollable form with:
    - Time input (required, highlighted)
    - Optional numeric inputs (key items, treasure chests, character count)
    - Character checkboxes grid (3 columns × 4 rows for 12 characters)
  - Submit/Cancel buttons in header (not below form)
  - Safe area insets: top (headerHeight + Spacing.md), bottom (insets.bottom + Spacing.xl)

#### Tab 2: Run History
- Purpose: Browse completed runs
- Layout:
  - Default header with "History" title and optional search icon (right)
  - Scrollable list of completed run cards
  - Each card shows: run name, completion time, date, key stats
  - Empty state if no completed runs
  - Safe area insets: top (headerHeight + Spacing.xl), bottom (tabBarHeight + Spacing.xl)

**Run Detail Screen (Stack)**
- Purpose: View full details of completed run
- Layout:
  - Default header with run name as title and back button
  - Scrollable content with stat sections
  - Delete button at bottom (destructive action, requires confirmation)
  - Safe area insets: top (headerHeight + Spacing.xl), bottom (insets.bottom + Spacing.xl)

#### Tab 3: Reference
- Purpose: Browse game reference data
- Layout:
  - Default header with "Reference" title
  - Scrollable list with three main sections:
    - Vanilla Story Events
    - Shop Locations
    - Key Item Locations
  - Each section is a tappable card/row
  - Safe area insets: top (headerHeight + Spacing.xl), bottom (tabBarHeight + Spacing.xl)

**Reference Detail Screens (Stack)**
- Purpose: View detailed lists for each reference type
- Layout:
  - Default header with section name as title and back button
  - Scrollable list of items
  - For Story Events: sequential numbered list with location and notes
  - For Shops/Key Items: grouped by location
  - Safe area insets: top (headerHeight + Spacing.xl), bottom (insets.bottom + Spacing.xl)

## Design System

### Color Palette
**Primary Theme: "Crystal Blue"** (inspired by FF4's crystal theme)
- Primary: #4A90E2 (crystal blue)
- Primary Dark: #2E5C8A
- Secondary: #7B68EE (magic purple, for accents)
- Success: #50C878 (for completed items)
- Warning: #F4A460 (for "return to" flags)
- Danger: #E74C3C (for destructive actions)

**Backgrounds**
- Light mode: #FFFFFF (primary), #F5F7FA (secondary)
- Dark mode: #1A1D23 (primary), #252930 (secondary)

**Text**
- Light mode: #2C3E50 (primary), #7F8C8D (secondary)
- Dark mode: #ECEFF1 (primary), #B0BEC5 (secondary)

**Borders & Dividers**
- Light mode: #E1E8ED
- Dark mode: #3A3F47

### Typography
- **Headers**: System font, semibold, 20px (screen titles)
- **Section Headers**: System font, semibold, 18px
- **Body**: System font, regular, 16px
- **Secondary**: System font, regular, 14px (helper text, metadata)
- **Small**: System font, regular, 12px (footnotes)

### Visual Design

**Component Specifications**

1. **Checkboxes**
   - Size: 24×24px
   - Unchecked: Border 2px, border color based on theme
   - Checked: Filled with Primary color, white checkmark
   - Touch target: 44×44px minimum
   - Haptic feedback on toggle

2. **Toggle Switches**
   - Use native platform switches (iOS/Android)
   - Active color: Primary
   - Track color: 30% opacity of primary when off

3. **Collapsible Sections**
   - Header: 48px height, semibold text, chevron icon (right)
   - Rotate chevron 180° when expanded
   - Smooth height animation (300ms ease-in-out)
   - Subtle background color change on press (5% opacity overlay)

4. **Cards (Run History, Reference Sections)**
   - Border radius: 12px
   - Padding: 16px
   - Background: Secondary background color
   - Border: 1px solid divider color
   - Press state: Scale down to 0.98, no shadow
   - Spacing between cards: 12px

5. **Form Inputs**
   - Height: 48px
   - Border radius: 8px
   - Border: 1px solid divider color
   - Focus state: Border color changes to Primary, border width 2px
   - Padding: 12px horizontal

6. **Buttons**
   - Primary: Filled with Primary color, white text, 16px semibold
   - Secondary: Outlined with Primary border 2px, Primary text
   - Destructive: Filled with Danger color, white text
   - Height: 48px minimum
   - Border radius: 8px
   - Press state: 90% opacity, no shadow

7. **Empty States**
   - Icon: 64×64px, Primary color at 30% opacity
   - Heading: 20px semibold, primary text color
   - Description: 14px regular, secondary text color
   - Vertical spacing: 16px between elements

### Interaction Design
- All touchable components use subtle scale feedback (0.95-0.98)
- List items use background color change on press (5% primary overlay)
- Forms validate on submit, show inline error messages below fields
- Confirmation dialogs for destructive actions (delete run, clear data)
- Success toast/alert after completing a run
- Pull-to-refresh on Run History list

### Accessibility
- All checkboxes have accessible labels
- Form inputs have clear labels and placeholder text
- Minimum 44×44px touch targets for all interactive elements
- Color contrast ratio 4.5:1 minimum for text
- Support dynamic type sizes
- VoiceOver/TalkBack optimized labels for all navigation and actions

### Assets Required
**Icons from @expo/vector-icons (Feather)**
- `check-square` / `square` - Checkboxes
- `chevron-down` / `chevron-right` - Collapsible sections
- `plus` - Start new run
- `clock` - Time/duration
- `users` - Characters
- `box` - Treasure chests
- `map-pin` - Locations
- `book-open` - Reference/story
- `shopping-cart` - Shops
- `star` - Key items
- `settings` - Settings
- `trash-2` - Delete
- `save` - Save/complete

**Generated Assets**
- Empty state illustration for "No Active Run" (abstract FF4 crystal or journey theme, simple line art style, 256×256px, Primary color)
- App icon featuring stylized FF4 crystal in Primary blue gradient (1024×1024px for all platforms)

**No Character Avatars Needed** - Characters are selected via labeled checkboxes, not visual avatars.