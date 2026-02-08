# Portfolio Website

A sleek, professional portfolio website for a robotics engineer with support for embedded Rerun visualizations.

## Quick Start

### Option 1: Python (Recommended)

```bash
# With CORS support (required for Rerun viewer)
python server.py 8000

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
├── server.py               # Dev server with CORS support
├── assets/
│   ├── images/             # Place your images here
│   ├── videos/             # Place your videos here
│   ├── rrd/                # Rerun .rrd recording files
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

Project pages can embed interactive [Rerun](https://rerun.io) viewers to display `.rrd` recordings. Use the `loadRerunViewer` helper defined in `js/main.js`:

```html
<script>
    document.addEventListener('DOMContentLoaded', function() {
        loadRerunViewer('rerun-viewer', '../assets/rrd/recording.rrd', '0.21.0');
    });
</script>
```

Parameters:
- `containerId` — ID of the DOM element to host the viewer
- `rrdUrl` — path to the `.rrd` file (relative or absolute)
- `rerunVersion` (optional) — Rerun SDK version that produced the file (default `'0.20.3'`). Must match the SDK version used to generate the recording.

Relative paths are automatically resolved to absolute URLs so the hosted viewer at `app.rerun.io` can fetch them.

### Local development with CORS

The Rerun viewer is served from `app.rerun.io` and needs to fetch `.rrd` files from your local server. This requires CORS headers. Use the included helper server instead of `python -m http.server`:

```bash
python server.py 8000
```

### Hosting .rrd Files

In production, your `.rrd` files need to be hosted on a server that supports CORS. Options:
- Your own web server (with `Access-Control-Allow-Origin` headers)
- GitHub Pages
- Cloud storage (S3, GCS, etc.)

## Browser Compatibility

The website uses modern CSS features and works best in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Feel free to use and modify this template for your own portfolio.
