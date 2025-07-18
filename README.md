# Golf Launch Monitor Metrics Preview

A responsive web application that simulates a golf launch monitor display with real-time metrics and automatic shot firing.

## Features

- **Real-time Metrics**: Displays carry distance, ball speed, and launch angle
- **Automatic Shot Firing**: Simulates shots every 5 seconds with realistic golf data
- **Responsive Design**: Optimized for both portrait and landscape orientations
- **Multiple Pages**: Three different metric layouts
- **Loading Animations**: Visual feedback during shot processing
- **Live Clock**: Real-time time display
- **Shot Counter**: Tracks number of shots fired

## Pages

1. **index.html** - Main page with 3 metrics (Carry Distance, Ball Speed, Launch Angle)
2. **page2.html** - Same metrics with units rotated 90° and positioned on the right
3. **page3.html** - Simplified layout with 2 metrics (Carry Distance, Ball Speed)

## Technologies Used

- HTML5
- CSS3 (with Flexbox and Grid)
- Vanilla JavaScript
- Responsive design with viewport units
- CSS animations and transitions

## Setup

1. Clone the repository
2. Open `index.html` in a web browser
3. The application will automatically start firing shots every 5 seconds

## Usage

- Navigate between pages using the NEXT/BACK buttons
- Watch the metrics update automatically
- The display adapts to different screen sizes and orientations
- Loading animations show when new shot data is being processed

## File Structure

```
├── index.html          # Main page with 3 metrics
├── page2.html          # Page with rotated units
├── page3.html          # Page with 2 metrics
├── styles.css          # Main stylesheet
├── script.js           # Main JavaScript functionality
├── Assets/             # Images and graphics
│   ├── Logo/
│   └── *.svg, *.gif
└── Fonts/              # Custom fonts
    ├── AcuminPro/
    └── Barlow/
```

## Live Demo

Visit the live demo at: [GitHub Pages URL will be added after deployment]

## License

This project is open source and available under the MIT License. 