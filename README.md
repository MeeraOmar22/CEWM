# CEWM - Waste Management Dashboard

This project is a web application for managing and reporting waste data. It uses HTML, CSS and vanilla JavaScript on the front end with Firebase providing authentication and a Firestore backend.

## Prerequisites
- Modern web browser
- A Firebase project for authentication and database services
- Optional: a local HTTP server such as Python's `http.server` or the Live Server extension in VS Code

## Setup
1. Clone this repository.
2. Replace the configuration values in `js/firebase-config.js` with your Firebase project credentials.
3. Serve the `pages/` directory using a local web server or open `pages/index.html` directly in your browser. Using a server is recommended so that ES module imports work correctly.

## Usage
- Visit `index.html` to register or sign in.
- Authenticated users are redirected to their dashboard (`homepage.html` for admins or `employeeDashboard.html` for employees).
- Use `wasteForm.html` to submit waste data.
- The CO₂ emission calculator is found at `calculator.html`.
- Reports can be viewed on `retrievePage.html` and `generateReport.html`.

## Project Structure
```
css/         Stylesheets
images/      Image assets
js/          JavaScript modules
pages/       HTML pages
```

Adjust the styles or JavaScript files as needed for your environment.

## License
No license has been specified for this project.
