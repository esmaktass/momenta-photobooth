# Momenta — Digital Photobooth

Momenta is a browser-based digital photobooth that lets users capture photos using their webcam, create a photo strip, and download the result as a PNG image.

The project was built to explore modern JavaScript, browser APIs, and canvas-based image generation while creating a functional, user-friendly product.

## Live Demo

Try Momenta here: [Live Demo](https://esmaktass.github.io/momenta-photobooth/)

## Features

* **Webcam Access:** Capture photos directly through your browser.
* **Photo Capture:** Take four photos in a single session.
* **Photo Strip Generation:** Combine captured photos into a single photo strip.
* **PNG Export:** Download the generated photo strip as a PNG image.
* **Error Handling:** Display user-friendly messages when camera access is unavailable or denied.
* **Responsive Interface:** Use the application on different screen sizes.

## Tech Stack

* HTML5
* CSS3
* JavaScript (ES Modules)
* Canvas API
* MediaDevices API

## Getting Started

### Prerequisites

* A modern web browser
* Python installed on your computer, for running a local development server

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/esmaktass/momenta-photobooth.git
   ```

2. Navigate to the project directory:

   ```bash
   cd momenta-photobooth
   ```

3. Start a local HTTP server:

   ```bash
   python -m http.server 8000
   ```

   On some Windows systems, you may need to use:

   ```bash
   py -m http.server 8000
   ```

4. Open the application in your browser:

   http://localhost:8000

5. Allow camera access when prompted.

## Project Structure

```text
momenta-photobooth/
├── index.html
├── style.css
└── js/
    ├── app.js
    ├── config.js
    ├── dom.js
    ├── state.js
    ├── ui.js
    └── utils.js
```

## How It Works

1. The application requests access to the user's webcam.
2. The user captures four photos.
3. JavaScript and the Canvas API are used to generate a photo strip.
4. The resulting image can be downloaded as a PNG file.

## Future Improvements

Potential improvements for future versions include:

* Customizable photo strip templates
* Additional frames, filters, and visual effects
* More advanced image editing
* AI-powered photo features
* A redesigned interface with additional customization options

## Author

**Esma Nur Aktaş**

* [GitHub](https://github.com/esmaktass)