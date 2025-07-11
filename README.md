# Golf Launch Monitor - Default Screen Prototype

A realistic HTML/CSS/JavaScript prototype of a golf launch monitor's default screen, designed to be displayed on a projector with a 16:9 aspect ratio.

## Features

### 🖥️ Main Screen Layout
- **16:9 Aspect Ratio**: 1280x720 resolution for projector display
- **Dispersion Chart**: Left side showing shot patterns and distances
- **Status Indicator**: Top center showing current system status
- **Video Replay Area**: Bottom center for shot video playback
- **Metrics Display**: Right side showing all golf shot metrics
- **Real-time Clock**: Live time display

### 📊 Golf Metrics Displayed
- **CARRY**: Distance ball travels in air (yards)
- **TOTAL**: Total distance including roll (yards)
- **SHOT TYPE**: Club used (Driver, 7 Iron, etc.)
- **BALL SPEED**: Speed of ball at impact (MPH)
- **LAUNCH ANGLE**: Vertical angle at launch (degrees)
- **LAUNCH DIRECTION**: Horizontal angle at launch (degrees)
- **CLUB SPEED**: Speed of club at impact (MPH)
- **SPIN RATE**: Ball rotation speed (RPM)
- **SPIN AXIS**: Axis of ball rotation (degrees)
- **SMASH FACTOR**: Efficiency ratio (ball speed / club speed)
- **APEX**: Maximum height of ball flight (feet)
- **DESCENT ANGLE**: Angle at which ball lands (degrees)

### 🎮 Interactive Controls
- **🏌️ Fire New Shot**: Generate and animate a new shot
- **⚪ Place Ball**: Prepare for next shot
- **🔄 Reset**: Clear all shots and reset to default state
- **Shot Counter**: Track number of shots fired

### 🎯 Shot Simulation
- **Realistic Data**: Golf metrics based on actual club performance
- **7 Different Clubs**: Driver, Fairway, 7-9 Iron, Pitching, Sand Wedge
- **Shot Animation**: Ball trajectory and trace visualization
- **Dispersion Pattern**: Shows shot grouping over time
- **Status Changes**: Visual feedback for system state

### ✨ Animations & Effects
- **Shot Trace Animation**: 2-second ball flight visualization
- **Metric Updates**: Sequential counter animations
- **Status Indicators**: Color-coded system status
- **Auto-Demo Mode**: Automatic shot generation every 10 seconds

## How to Use

1. **Open the Prototype**: Open `index.html` in a web browser
2. **Full Screen**: Press F11 for full-screen projector display
3. **Place Ball**: Click "Place Ball" to prepare for a shot
4. **Fire Shot**: Click "Fire New Shot" to generate and animate a shot
5. **Watch Animation**: Observe the ball flight and metric updates
6. **Reset**: Click "Reset" to clear all shots and start over

## File Structure

```
📁 Golf Launch Monitor Prototype/
├── 📄 index.html          # Main HTML structure
├── 📄 styles.css          # Complete styling and layout
├── 📄 script.js           # Interactive functionality
├── 📄 README.md           # This documentation
└── 📁 Reference/          # Original design files
    ├── 📄 Defaultscreen.tsx
    ├── 📄 Defaultscreen.css
    └── 📄 Global.css
```

## Technical Details

### Screen Resolution
- **Primary Display**: 1280x720 (16:9 aspect ratio)
- **Responsive**: Adapts to smaller screens with stacked layout

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

### Technologies Used
- **HTML5**: Semantic structure
- **CSS3**: Advanced styling, animations, grid layout
- **JavaScript ES6**: Interactive functionality and animations
- **Google Fonts**: Barlow font family

## Customization

### Adding New Clubs
Edit the `golfClubs` array in `script.js`:
```javascript
const golfClubs = [
    { name: 'YOUR_CLUB', ballSpeed: [min, max], clubSpeed: [min, max], launchAngle: [min, max] }
];
```

### Modifying Metrics
Update the `updateMetrics` function to change displayed values or add new metrics.

### Styling Changes
All visual styling is in `styles.css` with clearly commented sections for each component.

## Demo Features

- **Auto-generation**: Random shots every 10 seconds
- **Realistic Physics**: Ball flight calculations based on launch conditions
- **Multiple Clubs**: Random selection from 7 different golf clubs
- **Shot History**: Visual accumulation of shot patterns

## Future Enhancements

- [ ] Sound effects for shot firing
- [ ] Video replay integration
- [ ] Custom club selection
- [ ] Shot data export
- [ ] Weather conditions simulation
- [ ] Target practice mode

## License

This prototype is created for demonstration purposes. Feel free to modify and enhance for your specific needs.

---

**Note**: This prototype follows the exact design reference provided and includes all the visual elements and functionality needed for a professional golf launch monitor display system. 