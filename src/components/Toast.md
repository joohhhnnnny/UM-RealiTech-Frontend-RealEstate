# Toast Component Usage Examples

## Basic Usage

### Using the Toast Component Directly
```jsx
import Toast from '../components/Toast';
import { useState } from 'react';

function MyComponent() {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  return (
    <div>
      <button onClick={() => showToast('Success message!', 'success')}>
        Show Success
      </button>
      <button onClick={() => showToast('Error message!', 'error')}>
        Show Error
      </button>
      
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        position="top-right"
        duration={3000}
      />
    </div>
  );
}
```

### Using the useToast Hook (Recommended)
```jsx
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';

function MyComponent() {
  const { toast, showSuccess, showError, showWarning, showInfo, hideToast } = useToast();

  return (
    <div>
      <button onClick={() => showSuccess('Operation completed successfully!')}>
        Show Success
      </button>
      <button onClick={() => showError('Something went wrong!')}>
        Show Error
      </button>
      <button onClick={() => showWarning('Please check your input!')}>
        Show Warning
      </button>
      <button onClick={() => showInfo('Here is some information')}>
        Show Info
      </button>
      
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        position={toast.position}
        duration={toast.duration}
      />
    </div>
  );
}
```

## Toast Types
- `success` - Green toast with checkmark icon
- `error` - Red toast with warning icon
- `warning` - Yellow toast with alert icon
- `info` - Blue toast with information icon

## Position Options
- `top-right` (default)
- `top-left`
- `bottom-right`
- `bottom-left`
- `top-center`
- `bottom-center`

## Props

### Toast Component Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | boolean | false | Whether to show the toast |
| `message` | string | '' | Toast message text |
| `type` | string | 'success' | Toast type: 'success', 'error', 'warning', 'info' |
| `duration` | number | 3000 | Auto-dismiss duration in ms (0 = no auto-dismiss) |
| `onClose` | function | null | Callback when toast closes |
| `position` | string | 'top-right' | Toast position on screen |

### useToast Hook Returns
| Property | Type | Description |
|----------|------|-------------|
| `toast` | object | Current toast state |
| `showToast` | function | Generic show toast function |
| `showSuccess` | function | Show success toast |
| `showError` | function | Show error toast |
| `showWarning` | function | Show warning toast |
| `showInfo` | function | Show info toast |
| `hideToast` | function | Hide current toast |

## Advanced Usage

### Custom Duration
```jsx
// Toast that doesn't auto-dismiss
showSuccess('Saved successfully!', { duration: 0 });

// Toast with custom duration
showError('Error occurred!', { duration: 5000 });
```

### Custom Position
```jsx
// Show toast at bottom-left
showInfo('Processing...', { position: 'bottom-left' });
```

### With Custom Configuration
```jsx
const { toast, showToast, hideToast } = useToast({
  duration: 5000, // Default 5 seconds
  position: 'bottom-right' // Default position
});
```
