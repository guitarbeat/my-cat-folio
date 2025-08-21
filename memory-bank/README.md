# FloatingKitties Component 🐱✨

A React component that creates an animated background of floating cat images with space/galaxy themes. Perfect for adding a playful, cosmic atmosphere to your app!

## Features

- 🌌 **Space Themes**: Multiple pre-built space/galaxy backgrounds
- 🐱 **Floating Cats**: Animated cat images that float across the screen
- ✨ **Glow Effects**: Neon cyan, hot pink, and fire red glow effects
- 🎨 **Customizable**: Adjust timing, size, and animation parameters
- 📱 **Responsive**: Works on all screen sizes
- ♿ **Accessible**: Respects reduced motion preferences

## Usage

### Basic Usage

```jsx
import FloatingKitties from './components/FloatingKitties';

function App() {
  return (
    <div>
      <FloatingKitties />
      {/* Your app content */}
    </div>
  );
}
```

### With Custom Configuration

```jsx
<FloatingKitties 
  kittieCount={20}
  creationInterval={2000}
  minSize={15}
  maxSize={40}
  minDuration={3}
  maxDuration={8}
  backgroundImage="nebula"
  enableGlow={true}
  enableHover={true}
/>
```

## Props

| Prop               | Type      | Default   | Description                            |
| ------------------ | --------- | --------- | -------------------------------------- |
| `kittieCount`      | `number`  | `15`      | Maximum number of kitties on screen    |
| `creationInterval` | `number`  | `2000`    | Time between creating new kitties (ms) |
| `minSize`          | `number`  | `15`      | Minimum kittie size in pixels          |
| `maxSize`          | `number`  | `30`      | Maximum kittie size in pixels          |
| `minDuration`      | `number`  | `3`       | Minimum animation duration in seconds  |
| `maxDuration`      | `number`  | `8`       | Maximum animation duration in seconds  |
| `backgroundImage`  | `string`  | `'space'` | Background theme or custom URL         |
| `enableGlow`       | `boolean` | `true`    | Enable glow effects on kitties         |
| `enableHover`      | `boolean` | `true`    | Enable hover interactions              |

## Background Themes

### Pre-built Themes

- **`'space'`** - Deep space with stars
- **`'galaxy'`** - Spiral galaxy
- **`'nebula'`** - Colorful nebula clouds
- **`'stars'`** - Star field

### Custom Background

```jsx
<FloatingKitties 
  backgroundImage="https://your-custom-image-url.com/image.jpg"
/>
```

## Animation Details

Each kittie follows a unique path:
- **Random Start/End Positions**: Kitties appear and disappear at random screen locations
- **Rotation**: Each kittie rotates as it moves
- **Scaling**: Kitties scale up when appearing and down when disappearing
- **Glow Colors**: Random assignment of neon cyan, hot pink, or fire red glows

## Performance

- **Efficient Rendering**: Uses CSS transforms for smooth animations
- **Memory Management**: Kitties are automatically removed after animation
- **Reduced Motion**: Respects user's motion preferences
- **Responsive**: Adapts to different screen sizes

## Accessibility

- **Reduced Motion**: Automatically disables animations if user prefers
- **High Contrast**: Adjusts for high contrast mode
- **Screen Reader Friendly**: Background images don't interfere with content

## Examples

### Minimal Setup
```jsx
<FloatingKitties backgroundImage="stars" />
```

### High-Energy Setup
```jsx
<FloatingKitties 
  kittieCount={25}
  creationInterval={1000}
  minDuration={2}
  maxDuration={5}
  backgroundImage="nebula"
/>
```

### Subtle Background
```jsx
<FloatingKitties 
  kittieCount={8}
  creationInterval={4000}
  minSize={10}
  maxSize={20}
  backgroundImage="space"
  enableGlow={false}
  enableHover={false}
/>
```

## Integration Tips

1. **Z-Index**: Component uses `z-index: -1` to stay behind content
2. **Pointer Events**: Set to `none` so it doesn't interfere with interactions
3. **Background**: Add to your main App component for global effect
4. **Performance**: Adjust `kittieCount` based on device performance

## Troubleshooting

### Kitties Not Visible
- Check if the cat.gif image exists in `/public/images/`
- Verify background image URLs are accessible
- Ensure component is mounted and not hidden

### Performance Issues
- Reduce `kittieCount`
- Increase `creationInterval`
- Disable glow effects on low-end devices

### Background Not Showing
- Check if background image URL is valid
- Verify CSS is properly loaded
- Check browser console for errors

---

**Note**: This component creates a magical, cosmic atmosphere perfect for cat-themed applications! 🚀🐱✨
