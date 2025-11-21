/**
 * MenuDropdown Examples
 * This file demonstrates various use cases of the MenuDropdown component
 * Not meant to be rendered directly - for documentation purposes only
 */

import MenuDropdown from './MenuDropdown';

// Example 1: Simple menu with buttons
export function SimpleMenuExample() {
    return (
        <MenuDropdown
            trigger={<button>Menu</button>}
            items={[
                { type: 'button', label: 'Edit', onClick: () => alert('Edit') },
                {
                    type: 'button',
                    label: 'Delete',
                    onClick: () => alert('Delete'),
                },
            ]}
        />
    );
}

// Example 2: Menu with separators and groups
export function GroupedMenuExample() {
    return (
        <MenuDropdown
            trigger={<button>Actions</button>}
            items={[
                { type: 'button', label: 'New', onClick: () => {} },
                { type: 'button', label: 'Open', onClick: () => {} },
                { type: 'separator' },
                { type: 'button', label: 'Save', onClick: () => {} },
                { type: 'button', label: 'Save As...', onClick: () => {} },
                { type: 'separator' },
                { type: 'button', label: 'Exit', onClick: () => {} },
            ]}
        />
    );
}

// Example 3: Menu with disabled items
export function DisabledItemsExample() {
    return (
        <MenuDropdown
            trigger={<button>Options</button>}
            items={[
                { type: 'button', label: 'Copy', onClick: () => {} },
                {
                    type: 'button',
                    label: 'Paste',
                    onClick: () => {},
                    disabled: true,
                },
                { type: 'separator' },
                { type: 'button', label: 'Delete', onClick: () => {} },
            ]}
        />
    );
}

// Example 4: Menu with custom trigger function
export function DynamicTriggerExample() {
    return (
        <MenuDropdown
            trigger={(isOpen) => (
                <button>{isOpen ? '▼ Close' : '▶ Open'}</button>
            )}
            items={[
                { type: 'button', label: 'Item 1', onClick: () => {} },
                { type: 'button', label: 'Item 2', onClick: () => {} },
            ]}
        />
    );
}

// Example 5: Menu with icons (mock icons)
export function IconsExample() {
    return (
        <MenuDropdown
            trigger={<button>⋮ More</button>}
            items={[
                {
                    type: 'button',
                    label: 'Edit',
                    onClick: () => {},
                    icon: '✏️',
                },
                {
                    type: 'button',
                    label: 'Copy',
                    onClick: () => {},
                    icon: '📋',
                },
                { type: 'separator' },
                {
                    type: 'button',
                    label: 'Delete',
                    onClick: () => {},
                    icon: '🗑️',
                    className: 'text-red-600',
                },
            ]}
        />
    );
}

// Example 6: Left-aligned menu
export function LeftAlignedExample() {
    return (
        <div style={{ textAlign: 'right', padding: '20px' }}>
            <MenuDropdown
                trigger={<button>Menu</button>}
                items={[
                    { type: 'button', label: 'First', onClick: () => {} },
                    { type: 'button', label: 'Second', onClick: () => {} },
                    { type: 'button', label: 'Third', onClick: () => {} },
                ]}
                align="left"
            />
        </div>
    );
}

// Example 7: Custom items
export function CustomItemsExample() {
    return (
        <MenuDropdown
            trigger={<button>Search Menu</button>}
            items={[
                {
                    type: 'custom',
                    render: (
                        <input
                            type="text"
                            placeholder="Search..."
                            style={{
                                width: '100%',
                                padding: '8px 16px',
                                border: 'none',
                                boxSizing: 'border-box',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ),
                },
                { type: 'separator' },
                { type: 'button', label: 'Option 1', onClick: () => {} },
                { type: 'button', label: 'Option 2', onClick: () => {} },
            ]}
        />
    );
}

// Example 8: User menu (realistic)
export function UserMenuExample() {
    return (
        <MenuDropdown
            trigger={<span style={{ cursor: 'pointer' }}>👤 John Doe</span>}
            items={[
                {
                    type: 'button',
                    label: 'Profile',
                    onClick: () => console.log('Profile'),
                    icon: '👤',
                },
                {
                    type: 'button',
                    label: 'Settings',
                    onClick: () => console.log('Settings'),
                    icon: '⚙️',
                },
                { type: 'separator' },
                {
                    type: 'button',
                    label: 'Logout',
                    onClick: () => console.log('Logout'),
                    icon: '🚪',
                },
            ]}
            align="right"
        />
    );
}

// Example 9: Document actions menu (realistic)
export function DocumentActionsExample() {
    return (
        <MenuDropdown
            trigger={<button style={{ padding: '4px 8px' }}>⋮</button>}
            items={[
                {
                    type: 'button',
                    label: 'View',
                    onClick: () => console.log('View'),
                    icon: '👁️',
                },
                {
                    type: 'button',
                    label: 'Edit',
                    onClick: () => console.log('Edit'),
                    icon: '✏️',
                },
                {
                    type: 'button',
                    label: 'Share',
                    onClick: () => console.log('Share'),
                    icon: '🔗',
                },
                { type: 'separator' },
                {
                    type: 'button',
                    label: 'Download',
                    onClick: () => console.log('Download'),
                    icon: '⬇️',
                },
                {
                    type: 'button',
                    label: 'Delete',
                    onClick: () => console.log('Delete'),
                    icon: '🗑️',
                    className: 'text-red-600',
                },
            ]}
            align="left"
        />
    );
}

// Example 10: Top-positioned menu
export function TopPositionedExample() {
    return (
        <div style={{ marginTop: '200px', textAlign: 'center' }}>
            <MenuDropdown
                trigger={<button>Menu (appears above)</button>}
                items={[
                    { type: 'button', label: 'Option 1', onClick: () => {} },
                    { type: 'button', label: 'Option 2', onClick: () => {} },
                    { type: 'button', label: 'Option 3', onClick: () => {} },
                ]}
                position="top"
            />
        </div>
    );
}
