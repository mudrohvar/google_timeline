# Google Timeline Map App

A modern, interactive map application built with React, TypeScript, and Leaflet for visualizing location-based data and drawing boundaries.

## Features

### Phase 1: Foundation ✅
- React + TypeScript + Vite setup
- Tailwind CSS for styling
- ESLint and Prettier configuration
- Vitest for testing
- Modern development environment

### Phase 2: Core Map Features ✅
- Interactive Leaflet map with OpenStreetMap tiles
- Search functionality with geocoding simulation
- Current location detection
- Zoom controls and map navigation
- Modern UI layout with header and sidebar

### Phase 3: Boundary Drawing ✅
- Polygon drawing tools using Leaflet.Draw
- Boundary management with custom colors
- Boundary list sidebar with edit/delete functionality
- Real-time boundary creation and modification

### Phase 4: Data Upload & Processing ✅
- **CSV and JSON file upload** with drag-and-drop support
- **Data validation and processing** for location data
- **Interactive markers** with custom icons based on categories
- **Marker clustering** for better performance with large datasets
- **Rich popups** with detailed information and additional data
- **Data preview** showing statistics and coordinate ranges
- **Support for multiple data formats** including GeoJSON

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd google_timeline
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Uploading Data
1. Use the "Data Upload" section in the sidebar
2. Drag and drop CSV or JSON files, or click "Choose File"
3. Supported formats:
   - **CSV**: Must have headers with latitude/longitude columns
   - **JSON**: Array of objects or GeoJSON format
   - **Required fields**: latitude, longitude, title
   - **Optional fields**: description, category, timestamp, and custom properties

### Sample Data Files
The project includes sample data files for testing:
- `sample-data.csv` - Major US cities
- `sample-data.json` - NYC locations with different categories

### Drawing Boundaries
1. Use the drawing tools in the map toolbar
2. Click "Draw Polygon" to start drawing
3. Click on the map to add points to your polygon
4. Double-click to finish drawing
5. Manage boundaries in the sidebar

### Map Navigation
- Use mouse wheel to zoom in/out
- Click and drag to pan the map
- Use the search bar to find locations
- Click "My Location" to center on your current position

## Data Format Examples

### CSV Format
```csv
latitude,longitude,title,description,category,timestamp
40.7128,-74.0060,New York City,The Big Apple,attraction,2023-01-15
34.0522,-118.2437,Los Angeles,City of Angels,attraction,2023-02-20
```

### JSON Format
```json
[
  {
    "id": "restaurant_1",
    "latitude": 40.7589,
    "longitude": -73.9851,
    "title": "Times Square Restaurant",
    "description": "Famous dining spot",
    "category": "restaurant",
    "rating": 4.5
  }
]
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Mapping**: Leaflet.js, React-Leaflet, Leaflet.Draw, Leaflet.MarkerCluster
- **Testing**: Vitest, React Testing Library
- **Linting**: ESLint, Prettier
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/
│   ├── BoundaryDrawer/     # Boundary drawing functionality
│   ├── Layout/            # App layout and sidebar
│   ├── Map/               # Map components and search
│   ├── DataUpload.tsx     # File upload and processing
│   └── DataPoints.tsx     # Marker rendering and clustering
├── App.tsx                # Main application component
└── index.css              # Global styles and Leaflet overrides
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
