# Icon System Documentation

## Overview

Flow Kanban uses **Lucide Icons** (https://lucide.dev) as its icon library. Lucide provides clean, minimalist SVG icons that perfectly complement our Japandi design aesthetic.

## Why Lucide?

1. **Design Consistency**: Clean, minimal 2px stroke icons match our design system
2. **Lightweight**: Tree-shakeable - only imports icons you actually use
3. **Svelte Integration**: Official `lucide-svelte` package
4. **Comprehensive**: 1000+ icons covering all needs
5. **Customizable**: Easily adjust size, color, and stroke width
6. **AI-Friendly**: Icons referenced by semantic names for better AI tool usage

## Installation

```bash
cd packages/desktop
npm install lucide-svelte
```

## Architecture

### Icon Component (`packages/desktop/src/lib/Icon.svelte`)

Central wrapper component that provides a consistent interface for all icons:

```svelte
<Icon name="settings" size="md" color="#2d2d2d" />
```

**Props:**
- `name` (required): Icon name from the icon map
- `size` (optional): 'xs' | 'sm' | 'md' | 'lg' (default: 'md')
- `color` (optional): CSS color value (default: 'currentColor')
- `strokeWidth` (optional): Number (default: 2)
- `className` (optional): Additional CSS classes

### Icon Constants (`packages/shared/src/constants/icons.js`)

Centralized constants for sizes, colors, and semantic naming:

```javascript
import { ICON_SIZES, ICON_COLORS, ICON_NAMES } from '@flow/shared';

// Usage
<Icon name={ICON_NAMES.SETTINGS} size={ICON_SIZES.MD} color={ICON_COLORS.SECONDARY} />
```

## Size System

| Size | Pixels | Use Case |
|------|--------|----------|
| `xs` | 14px   | Inline text icons, small badges |
| `sm` | 16px   | Compact UI elements, buttons |
| `md` | 20px   | Default size for actions |
| `lg` | 24px   | Prominent actions, headers |

## Color Palette

Matches our Japandi design system:

| Token | Color | Usage |
|-------|-------|-------|
| `PRIMARY` | #2d2d2d | Main actions, dark text |
| `SECONDARY` | #666 | Secondary elements |
| `MUTED` | #999 | Disabled, placeholder states |
| `ACCENT` | #d4a574 | Warm highlights |
| `ERROR` | #d47474 | Error states |
| `SUCCESS` | #74a574 | Success states |
| `WARNING` | #d4a574 | Warning states |
| `INHERIT` | currentColor | Inherit from parent (default) |

## Available Icons

### Actions
- `settings` - Gear icon for settings
- `import` - Download icon for importing data into the app
- `upload` - Upload icon for exporting/uploading data
- `download` - Download icon
- `add` / `plus` - Plus icon for adding items
- `edit` - Edit pencil icon
- `delete` / `trash` - Trash can icon
- `close` / `x` - Close/dismiss icon

### Status & Feedback
- `success` / `check` - Checkmark for success
- `error` / `alert` / `warning` / `alertTriangle` - Triangle warning icon

### Content
- `file` - File document icon
- `attachment` / `paperclip` - Paperclip for attachments
- `calendar` / `date` - Calendar icon

### Navigation
- `chevronRight` - Right arrow
- `chevronLeft` - Left arrow

## Usage Examples

### Basic Usage

```svelte
<script>
  import Icon from './lib/Icon.svelte';
</script>

<button>
  <Icon name="settings" size="sm" />
  Settings
</button>
```

### With Color

```svelte
<Icon name="alertTriangle" size="sm" color="#d47474" />
```

### Inheriting Parent Color

```svelte
<button class="delete-btn">
  <Icon name="trash" size="sm" />
</button>

<style>
  .delete-btn {
    color: #999; /* Icon inherits this color */
  }
  .delete-btn:hover {
    color: #d47474; /* Icon inherits this too */
  }
</style>
```

### With Constants

```svelte
<script>
  import Icon from './lib/Icon.svelte';
  import { ICON_NAMES, ICON_SIZES, ICON_COLORS } from '@flow/shared';
</script>

<Icon 
  name={ICON_NAMES.WARNING} 
  size={ICON_SIZES.SM} 
  color={ICON_COLORS.ERROR} 
/>
```

## Migration from Emojis

### Before
```svelte
<button>⚙</button>
<span>📎 {count}</span>
<div>⚠️ Warning</div>
```

### After
```svelte
<button><Icon name="settings" size="sm" /></button>
<span><Icon name="paperclip" size="xs" /> {count}</span>
<div><Icon name="warning" size="sm" color="#d47474" /> Warning</div>
```

## Adding New Icons

1. **Import the icon** in `Icon.svelte`:
```javascript
import { NewIcon } from 'lucide-svelte';
```

2. **Add to icon map**:
```javascript
const iconMap = {
  // ... existing icons
  newIcon: NewIcon,
  semanticName: NewIcon
};
```

3. **Add constant** in `icons.js` (optional):
```javascript
export const ICON_NAMES = {
  // ... existing names
  NEW_ICON: 'newIcon'
};
```

4. **Use it**:
```svelte
<Icon name="newIcon" size="md" />
```

## Best Practices

1. **Use semantic names**: Prefer `name="close"` over `name="x"`
2. **Leverage currentColor**: Let icons inherit parent color when possible
3. **Consistent sizing**: Stick to defined size system (xs, sm, md, lg)
4. **Accessibility**: Always provide button labels/titles when icons are alone
5. **Performance**: Icon component is lightweight, but avoid excessive re-renders

## Components Using Icons

- ✅ `Header.svelte` - Settings, import buttons
- ✅ `Card.svelte` - Attachment indicator
- ✅ `NotificationToast.svelte` - Success, error, warning icons
- ✅ `ImportModal.svelte` - File upload, warnings, close button
- ✅ `SettingsModal.svelte` - Close button, delete buttons
- ⏳ `CardModal.svelte` - Close button (pending)
- ⏳ `DatePicker.svelte` - Calendar icon (pending)
- ⏳ Other modals - Close buttons (pending)

## Troubleshooting

### Icon not showing
- Check the icon name is in the `iconMap`
- Verify lucide-svelte is installed
- Check browser console for errors

### Wrong size
- Use defined size tokens: 'xs', 'sm', 'md', 'lg'
- Check parent CSS doesn't override

### Wrong color
- Icons use `currentColor` by default
- Either set explicit `color` prop or style parent element

## Resources

- [Lucide Icons Gallery](https://lucide.dev/icons/)
- [Lucide Svelte Documentation](https://github.com/lucide-icons/lucide/tree/main/packages/lucide-svelte)
- [Design System Colors](./ARCHITECTURE.md#design-system)
