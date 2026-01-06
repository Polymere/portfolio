# Portfolio Website

A sleek, professional portfolio website for a robotics engineer with support for embedded Rerun visualizations.

## Quick Start

### Option 1: Python (Recommended)

```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

### Option 2: Node.js

```bash
# Install serve globally (one-time)
npm install -g serve

# Run the server
serve .

# Then open http://localhost:3000 in your browser
```

### Option 3: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 4: PHP

```bash
php -S localhost:8000
```

## Project Structure

```
portfolio/
├── index.html              # Landing page
├── css/
│   └── style.css           # Main stylesheet
├── js/
│   └── main.js             # JavaScript (nav, animations, Rerun helper)
├── projects/
│   ├── real2sim.html       # Project pages
│   ├── lws.html
│   ├── geyeropt.html
│   ├── hri.html
│   ├── bci.html
│   └── cadet.html
├── assets/
│   ├── images/             # Place your images here
│   ├── videos/             # Place your videos here
│   └── cv.pdf              # Your CV file
└── pages/                  # Original markdown content
```

## Customization

### Personal Information

Edit `index.html` to update:
- Your name (search for "Paul")
- Introduction text
- Contact links (email, GitHub, LinkedIn)
- Profile picture (replace the placeholder div)

### Adding Your Profile Picture

Replace the placeholder in `index.html`:

```html
<!-- Change this: -->
<div class="profile-placeholder">
    <span>Your Photo</span>
</div>

<!-- To this: -->
<img src="assets/images/profile.jpg" alt="Your Name">
```

### Adding Your CV

Place your CV file at `assets/cv.pdf`.

### Project Images & Videos

Copy your media files to the appropriate folders:
- Images: `assets/images/`
- Videos: `assets/videos/`

Update the image/video paths in the HTML files to match.

## Embedding Rerun Visualizations

Each project page has a placeholder for the Rerun viewer. To embed a recording:

### Method 1: Using the helper function

Add this script at the bottom of your project page:

```html
<script>
    loadRerunViewer('rerun-viewer', 'https://your-url.com/recording.rrd', '0.20.3');
</script>
```

### Method 2: Direct iframe

Replace the placeholder div with:

```html
<iframe
    src="https://app.rerun.io/version/0.20.3/index.html?url=YOUR_RRD_URL"
    class="rerun-viewer"
    allow="fullscreen"
    title="Rerun Viewer">
</iframe>
```

### Hosting .rrd Files

Your `.rrd` files need to be hosted on a web server that supports CORS. Options:
- Your own web server
- GitHub Pages (with the file in your repo)
- Cloud storage (S3, GCS, etc.)

## Browser Compatibility

The website uses modern CSS features and works best in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Feel free to use and modify this template for your own portfolio.
