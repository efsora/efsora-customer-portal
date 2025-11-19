# MenuDropdown Component

Centralized dropdown menu component with support for buttons, separators, and custom items.

## Features

- ✅ Built-in button items with onClick handlers
- ✅ Separator items for visual grouping
- ✅ Custom item rendering
- ✅ Icon support
- ✅ Disabled state
- ✅ Keyboard support (Escape, Enter, Space)
- ✅ Accessibility (ARIA labels, role="menu")
- ✅ Flexible positioning (top/bottom, left/right alignment)
- ✅ Click outside detection
- ✅ Smooth animations

## Basic Usage

### Simple Button Menu

```tsx
import { MenuDropdown } from '#components/common/MenuDropdown';

export function MyMenu() {
    return (
        <MenuDropdown
            trigger={<button>Menu</button>}
            items={[
                {
                    type: 'button',
                    label: 'Edit',
                    onClick: () => console.log('Edit clicked'),
                },
                {
                    type: 'button',
                    label: 'Delete',
                    onClick: () => console.log('Delete clicked'),
                },
            ]}
        />
    );
}
```

### With Separators

```tsx
<MenuDropdown
    trigger={<button>Actions</button>}
    items={[
        { type: 'button', label: 'Edit', onClick: handleEdit },
        { type: 'button', label: 'Duplicate', onClick: handleDuplicate },
        { type: 'separator' },
        { type: 'button', label: 'Delete', onClick: handleDelete },
    ]}
/>
```

### With Icons

```tsx
import { EditIcon, DeleteIcon, DuplicateIcon } from '#icons';

<MenuDropdown
    trigger={<button>⋮</button>}
    items={[
        {
            type: 'button',
            label: 'Edit',
            onClick: handleEdit,
            icon: <EditIcon />,
        },
        {
            type: 'button',
            label: 'Duplicate',
            onClick: handleDuplicate,
            icon: <DuplicateIcon />,
        },
        { type: 'separator' },
        {
            type: 'button',
            label: 'Delete',
            onClick: handleDelete,
            icon: <DeleteIcon />,
            className: 'text-red-500',
        },
    ]}
/>
```

### With Disabled Items

```tsx
<MenuDropdown
    trigger={<button>Menu</button>}
    items={[
        { type: 'button', label: 'Edit', onClick: handleEdit },
        {
            type: 'button',
            label: 'Archive',
            onClick: handleArchive,
            disabled: true, // Grayed out, not clickable
        },
        { type: 'separator' },
        { type: 'button', label: 'Delete', onClick: handleDelete },
    ]}
/>
```

### With Custom Items

```tsx
<MenuDropdown
    trigger={<button>Menu</button>}
    items={[
        { type: 'button', label: 'Search', onClick: handleSearch },
        { type: 'separator' },
        {
            type: 'custom',
            render: (
                <input
                    type="text"
                    placeholder="Search..."
                    onClick={(e) => e.stopPropagation()}
                />
            ),
        },
    ]}
/>
```

### Dynamic Trigger

```tsx
<MenuDropdown
    trigger={(isOpen) => (
        <button>
            {isOpen ? '▲' : '▼'} Menu
        </button>
    )}
    items={menuItems}
/>
```

### Position Options

```tsx
// Default: bottom, right alignment
<MenuDropdown
    trigger={<button>Menu</button>}
    items={items}
    position="top"  // 'top' | 'bottom'
    align="left"    // 'left' | 'right'
/>
```

## Props

```typescript
interface MenuDropdownProps {
    // The trigger element (button, icon, text, etc.)
    // Can be a ReactNode or a function that receives isOpen boolean
    trigger: ReactNode | ((isOpen: boolean) => ReactNode);

    // Array of menu items
    items: MenuItem[];

    // Horizontal alignment: 'left' | 'right' (default: 'right')
    align?: 'left' | 'right';

    // Vertical position: 'top' | 'bottom' (default: 'bottom')
    position?: 'top' | 'bottom';

    // Additional CSS class
    className?: string;

    // Make dropdown menu full width of parent container (default: false)
    fullWidth?: boolean;
}

// Menu item types
type MenuItem = ButtonItemProps | SeparatorItemProps | CustomItemProps;

interface ButtonItemProps {
    type: 'button';
    label: string;
    onClick: () => void;
    icon?: ReactNode;        // Optional icon element
    disabled?: boolean;       // Optional disabled state
    className?: string;       // Optional CSS class
}

interface SeparatorItemProps {
    type: 'separator';
}

interface CustomItemProps {
    type: 'custom';
    render: ReactNode;
}
```

## CSS Variables

The component uses CSS variables for theming:

```css
/* Override in your theme or global styles */
--color-blue: #1c2162;
--color-blue-bg: #f0f2fb;
--color-text: #2b376d;
--color-text-light: #999;
--color-border: #e0e5f0;
```

## Accessibility

- ✅ ARIA labels and roles
- ✅ Keyboard navigation (Escape to close, Enter/Space to toggle)
- ✅ Focus management
- ✅ Screen reader friendly

## Migration from Old Components

### VersionDropdown (Old → New)

**Before:**
```tsx
<VersionDropdown options={versions} value={current} onChange={handleChange} />
```

**After (Already migrated):**
```tsx
<MenuDropdown
    trigger={<div className={styles.selected}>{current}</div>}
    items={versions.map((v) => ({
        type: 'button',
        label: v,
        onClick: () => handleChange(v),
    }))}
/>
```

### LanguageSelect (Old → New)

**Before:**
```tsx
<select value={language} onChange={handleChange}>
    {languages.map((l) => <option value={l}>{l}</option>)}
</select>
```

**After (Already migrated):**
```tsx
<MenuDropdown
    trigger={<span>{currentLanguage}</span>}
    items={languages.map((l) => ({
        type: 'button',
        label: l,
        onClick: () => changeLanguage(l),
    }))}
/>
```

## Best Practices

1. **Use icons for clarity** - Add visual indicators with icons
2. **Group related items** - Use separators to group related actions
3. **Disable unavailable actions** - Use `disabled: true` for unavailable items
4. **Keep it short** - Limit to ~5-7 items per menu
5. **Use consistent labels** - Clear, action-oriented button labels
6. **Handle errors gracefully** - Wrap onClick handlers in try-catch if needed

## Examples

### User Actions Menu

```tsx
function UserMenu() {
    return (
        <MenuDropdown
            trigger={<Avatar src={user.avatar} />}
            items={[
                {
                    type: 'button',
                    label: 'Profile',
                    icon: <UserIcon />,
                    onClick: () => navigate('/profile'),
                },
                { type: 'separator' },
                {
                    type: 'button',
                    label: 'Settings',
                    icon: <SettingsIcon />,
                    onClick: () => navigate('/settings'),
                },
                {
                    type: 'button',
                    label: 'Logout',
                    icon: <LogoutIcon />,
                    onClick: handleLogout,
                },
            ]}
        />
    );
}
```

### Document Actions

```tsx
function DocumentActions({ doc }) {
    return (
        <MenuDropdown
            trigger={<button>⋮</button>}
            align="left"
            items={[
                {
                    type: 'button',
                    label: 'Edit',
                    onClick: () => openEditor(doc),
                },
                {
                    type: 'button',
                    label: 'Share',
                    onClick: () => openShareDialog(doc),
                },
                { type: 'separator' },
                {
                    type: 'button',
                    label: 'Download',
                    onClick: () => downloadDocument(doc),
                },
                {
                    type: 'button',
                    label: 'Delete',
                    onClick: () => deleteDocument(doc),
                    className: 'text-red-600',
                },
            ]}
        />
    );
}
```

### Filter Menu with Search

```tsx
function FilterMenu() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = FILTERS.filter((f) =>
        f.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MenuDropdown
            trigger={<button>Filters</button>}
            items={[
                {
                    type: 'custom',
                    render: (
                        <input
                            type="text"
                            placeholder="Search filters..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ),
                },
                { type: 'separator' },
                ...filteredOptions.map((filter) => ({
                    type: 'button' as const,
                    label: filter,
                    onClick: () => applyFilter(filter),
                })),
            ]}
        />
    );
}
```
