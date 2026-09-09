# 🌾 KrishiGyan — Crop Recommendation & Farming Companion

KrishiGyan is a web platform built to help Indian farmers make better decisions — combining weather forecasts, market prices, agricultural news, and an ML-powered **crop recommendation system** in one place.

## Features

- 🌱 **Crop Recommendation** — Suggests the best crop to grow based on soil nutrients (N-P-K), pH, and other farm conditions, powered by a scikit-learn model served over Flask.
- ⛅ **Weather Forecast** — Widget for location-based weather.
- 📈 **Market Prices** — Live crop price tracking.
- 📰 **Agricultural News** — Latest farming-related news feed.
- 💬 **Chatbot** — Assistant for farmer queries.
- 📱 **PWA-ready** — Includes a service worker (`sw.js`) for offline support.

## Tech Stack

**Frontend**
- HTML5, Tailwind CSS (via CDN)
- Vanilla JavaScript
- [Chart.js](https://www.chartjs.org/) for data visualization
- [Leaflet.js](https://leafletjs.com/) for maps
- Font Awesome icons

**Backend (Crop Recommendation Engine)**
- Python, Flask
- scikit-learn, pandas, numpy, joblib

## Project Structure

crop-recomm/
├── css/ # Stylesheets
├── js/ # Frontend scripts (main.js etc.)
├── pages/ # Additional page templates
├── static/ # Static assets (images, icons, etc.)
├── index.html # Landing page
└── sw.js # Service worker (PWA support)


## Getting Started

### Prerequisites

- Python 3.9+
- pip
- A simple static file server (or the Python built-in one) for the frontend

### 1. Clone the repository

```bash
git clone https://github.com/HarshWadkute/crop-recomm.git
cd crop-recomm
```

### 2. Run the frontend

The frontend is static, but it should be served over HTTP (not opened as a `file://` URL) so the service worker and fetch calls work correctly:

```bash
python -m http.server 5500
```

Then open **http://localhost:5500** in your browser.

### 3. Run the crop recommendation backend

The "Try Now" button on the Crop Recommendation card calls a Flask API expected at `http://127.0.0.1:5000/`. Set that up in its own virtual environment:

```bash
python -m venv venv
venv\Scripts\activate       # On Windows
# source venv/bin/activate  # On macOS/Linux

pip install -r requirements.txt
python app.py
```

`requirements.txt`:

blinker==1.8.2
click==8.1.7
colorama==0.4.6
Flask==3.0.3
itsdangerous==2.2.0
Jinja2==3.1.4
joblib==1.4.2
MarkupSafe==3.0.2
numpy==1.26.4
pandas==2.2.2
python-dateutil==2.9.0.post0
pytz==2024.2
scikit-learn==1.5.2
scipy==1.14.1
six==1.16.0
threadpoolctl==3.5.0
tzdata==2024.2
Werkzeug==3.0.4

The API should then be reachable at **http://127.0.0.1:5000/**, which the frontend calls directly.

> **Windows PowerShell users:** if `venv\Scripts\activate` is blocked by execution policy, run:
> ```powershell
> Set-ExecutionPolicy RemoteSigned -Scope Process
> ```



