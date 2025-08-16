# System Tour Component Documentation

## Overview
The SystemTour component provides a guided tour experience for first-time users, helping them navigate through the real estate platform's features.

## Features
- ✅ **Role-based tours** - Different content for buyers, agents, and developers
- ✅ **First-time user detection** - Only shows for users who haven't completed the tour
- ✅ **Interactive highlighting** - Highlights specific UI elements during the tour
- ✅ **Professional animations** - Smooth transitions with Framer Motion
- ✅ **Progress tracking** - Visual progress bar and step counter
- ✅ **Persistent storage** - Remembers completion status using localStorage
- ✅ **Restart capability** - Users can restart the tour from settings
- ✅ **Responsive design** - Works on different screen sizes
- ✅ **Accessible** - Keyboard navigation and screen reader friendly

## Implementation

### 1. Component Structure
```jsx
<SystemTour 
  userRole="buyer" // 'buyer' | 'agent' | 'developer'
  onComplete={() => console.log('Tour completed')}
/>
```

### 2. Integration
The component is automatically integrated into the DashboardLayout:
- Automatically shows for first-time users
- Uses Firebase Auth to track user completion
- Stores completion status in localStorage

### 3. Tour Steps Configuration

#### Buyer Tour Steps:
1. Welcome message
2. Navigation sidebar explanation
3. Property search functionality
4. BuySmartPH tool overview
5. RealtyConnect for agent connections
6. PropGuard for document verification
7. Saved properties management

#### Agent Tour Steps:
1. Welcome message
2. Navigation sidebar for agents
3. Property listings management
4. Client management tools
5. Analytics and insights

#### Developer Tour Steps:
1. Welcome message
2. Navigation sidebar for developers
3. Project management tools
4. BuildSafe compliance tools
5. Sales and marketing features

### 4. Data Tour Attributes
To make elements highlightable during the tour, add data-tour attributes:

```jsx
// Sidebar
<div data-tour="sidebar">...</div>

// Navigation items
<Link data-tour="buysmartph">BuySmartPH</Link>
<Link data-tour="realtyconnect">RealtyConnect</Link>
<Link data-tour="propguard">PropGuard</Link>
<Link data-tour="buildsafe">BuildSafe</Link>

// Dashboard sections
<div data-tour="saved-properties">...</div>
<button data-tour="properties">Browse Properties</button>
```

### 5. Tour Restart Functionality
Users can restart the tour from Settings → Appearance → System Tour:

```jsx
// Restart tour function
const restartTour = () => {
  if (currentUser) {
    const tourKey = `tour_completed_${currentUser.uid}`;
    localStorage.removeItem(tourKey);
    window.location.reload();
  }
};
```

## Customization

### Adding New Tour Steps
1. Update the `getTourSteps` function in SystemTour.jsx
2. Add appropriate data-tour attributes to target elements
3. Configure position ('left', 'right', 'top', 'bottom', 'center')

### Example New Step:
```jsx
{
  title: "New Feature",
  content: "This is a new feature that helps users...",
  target: "[data-tour='new-feature']",
  icon: <RiNewIcon className="w-6 h-6" />,
  position: "right"
}
```

### Styling Customization
The component uses Tailwind CSS classes and can be customized by:
- Modifying colors in the component
- Adjusting animations in Framer Motion variants
- Changing positioning logic

## Technical Details

### Dependencies
- React (hooks: useState, useEffect, useRef)
- Framer Motion (animations and transitions)
- React Icons (UI icons)
- Firebase Auth (user authentication)
- localStorage (completion tracking)

### Performance Considerations
- Uses React.memo for component optimization
- Implements cleanup in useEffect
- Minimal DOM queries with proper error handling
- Smooth scrolling with reduced motion support

### Browser Support
- Modern browsers with ES6+ support
- localStorage support required
- CSS Grid and Flexbox support

## Testing

### Manual Testing Steps
1. Clear localStorage or use new user account
2. Navigate to any dashboard page
3. Tour should automatically appear
4. Test navigation (Next, Previous, Skip)
5. Complete tour and verify localStorage entry
6. Refresh page - tour should not appear again
7. Test restart functionality from settings

### Test Cases
- ✅ First-time user sees tour
- ✅ Returning user doesn't see tour
- ✅ Tour can be skipped at any step
- ✅ Tour can be navigated forward/backward
- ✅ Tour highlights correct elements
- ✅ Tour completion is persisted
- ✅ Tour can be restarted from settings
- ✅ Different content for different user roles

## Troubleshooting

### Common Issues
1. **Tour doesn't appear**: Check if user is authenticated and localStorage key
2. **Elements not highlighted**: Verify data-tour attributes are present
3. **Tour appears repeatedly**: Check localStorage completion key format
4. **Wrong positioning**: Verify target elements exist in DOM

### Debug Mode
Add to component for debugging:
```jsx
console.log('Tour state:', { currentStep, isVisible, tourStarted });
console.log('Target element:', document.querySelector(step.target));
```

## Future Enhancements
- [ ] Add video tutorials integration
- [ ] Implement tour analytics
- [ ] Add voice narration
- [ ] Multi-language support
- [ ] Advanced targeting with CSS selectors
- [ ] Tour branching based on user actions
- [ ] Integration with help documentation
- [ ] Mobile-specific tour flows
