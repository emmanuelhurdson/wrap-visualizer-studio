import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Audit car→path mappings in the browser console (dev only).
// Dynamic import keeps the validator out of the production bundle entirely.
if (import.meta.env.DEV) {
  import('./data/validateCars').then(({ validateCarPaths }) => validateCarPaths());
}
