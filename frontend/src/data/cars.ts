export type CarModel = {
  id: string;
  name: string;
  category: string;
  path: string; // path relative to Vite's public/ folder, starts with /
};

export const DEFAULT_CAR_ID = 'porsche-911';

// One entry per GLB file in public/.
// Category string becomes an <optgroup> label in the selector.
export const CAR_MODELS: CarModel[] = [
  // Coupe
  { id: 'audi-tt', name: '', category: 'Coupe', path: '/coupe/audi-tt.glb' },
  { id: 'bmw-i8', name: 'BMW i8', category: 'Coupe', path: '/coupe/bmw-i8.glb' },
  { id: 'bmw-m6', name: 'BMW M6', category: 'Coupe', path: '/coupe/bmw-m6.glb' },
  { id: 'lexus-bev-sport-concept-2021', name: '2021 Lexus BEV Sport Concept', category: 'Coupe', path: '/coupe/lexus-bev-sport-concept-2021.glb' },
  { id: 'lexus-lc-500', name: 'Lexus LC 500', category: 'Coupe', path: '/coupe/lexus-lc-500.glb' },
  { id: 'nissan-gt-r-black-edition-2013', name: '2013 Nissan GT-R Black Edition', category: 'Coupe', path: '/coupe/nissan-gt-r-black-edition-2013.glb' },
  { id: 'porsche-911', name: 'Porsche 911', category: 'Coupe', path: '/coupe/porsche-911.glb' },

  // Hatchback
  { id: 'bmw-5-series-gran-turismo-2014', name: '2014 BMW 5 Series Gran Turismo', category: 'Hatchback', path: '/hatchback/bmw-5-series-gran-turismo-2014.glb' },
  { id: 'mazda-3', name: 'Mazda 3', category: 'Hatchback', path: '/hatchback/mazda-3.glb' },
  { id: 'mercedes-amg-a45', name: 'Mercedes-AMG A45', category: 'Hatchback', path: '/hatchback/mercedes-amg-a45.glb' },
  { id: 'volkswagen-polo', name: 'Volkswagen Polo', category: 'Hatchback', path: '/hatchback/volkswagen-polo.glb' },

  // Pickup
  { id: 'ford-raptor', name: 'Ford Raptor', category: 'Pickup', path: '/pickup/ford-raptor.glb' },
  { id: 'isuzu-dmax-offroad-4x4', name: 'Isuzu D-Max Offroad 4x4', category: 'Pickup', path: '/pickup/isuzu-dmax-offroad-4x4.glb' },

  // Sedan
  { id: 'bmw-3-series-demo', name: 'BMW 3 Series', category: 'Sedan', path: '/sedan/bmw-3-series-demo.glb' },
  { id: 'bmw-m3', name: 'BMW M3', category: 'Sedan', path: '/sedan/bmw-m3.glb' },
  { id: 'mazda-atenza', name: 'Mazda Atenza', category: 'Sedan', path: '/sedan/mazda-atenza.glb' },
  { id: 'mercedes-benz-c-class-2022', name: '2022 Mercedes-Benz C-Class', category: 'Sedan', path: '/sedan/mercedes-benz-c-class-2022.glb' },
  { id: 'mercedes-benz-e-class-amg-line-2022', name: '2022 Mercedes-Benz E-Class AMG Line', category: 'Sedan', path: '/sedan/mercedes-benz-e-class-amg-line-2022.glb' },
  { id: 'subaru-impreza', name: 'Subaru Impreza', category: 'Sedan', path: '/sedan/subaru-impreza.glb' },
  { id: 'subaru-impreza-s204-sti-2005', name: '2005 Subaru Impreza S204 STI', category: 'Sedan', path: '/sedan/subaru-impreza-s204-sti-2005.glb' },
  { id: 'toyota-mark-x-grx133', name: 'Toyota Mark X GRX133', category: 'Sedan', path: '/sedan/toyota-mark-x-grx133.glb' },

  // SUV
  { id: 'aston-martin-dbx', name: 'Aston Martin DBX', category: 'SUV', path: '/suv/aston-martin-dbx.glb' },
  { id: 'audi-q5-sportback-2022', name: '2022 Audi Q5 Sportback', category: 'SUV', path: '/suv/audi-q5-sportback-2022.glb' },
  { id: 'bmw-x3', name: 'BMW X3', category: 'SUV', path: '/suv/bmw-x3.glb' },
  { id: 'bmw-x5-e53-restyling', name: 'BMW X5 E53 Restyling', category: 'SUV', path: '/suv/bmw-x5-e53-restyling.glb' },
  { id: 'bmw-x7', name: 'BMW X7', category: 'SUV', path: '/suv/bmw-x7.glb' },
  { id: 'lexus-gx', name: 'Lexus GX', category: 'SUV', path: '/suv/lexus-gx.glb' },
  { id: 'lexus-gx-550-overtrail-2023', name: '2023 Lexus GX 550 Overtrail', category: 'SUV', path: '/suv/lexus-gx-550-overtrail-2023.glb' },
  { id: 'lexus-lx', name: 'Lexus LX', category: 'SUV', path: '/suv/lexus-lx.glb' },
  { id: 'mazda-cx-5', name: 'Mazda CX-5', category: 'SUV', path: '/suv/mazda-cx-5.glb' },
  { id: 'mazda-cx-5-2020', name: '2020 Mazda CX-5', category: 'SUV', path: '/suv/mazda-cx-5-2020.glb' },
  { id: 'mercedes-amg-g63', name: 'Mercedes-AMG G63', category: 'SUV', path: '/suv/mercedes-amg-g63.glb' },
  { id: 'mercedes-amg-g63-alt', name: 'Mercedes-AMG G63 Alt', category: 'SUV', path: '/suv/mercedes-amg-g63-alt.glb' },
  { id: 'mercedes-amg-gle-63-coupe-2022', name: '2022 Mercedes-AMG GLE 63 Coupe', category: 'SUV', path: '/suv/mercedes-amg-gle-63-coupe-2022.glb' },
  { id: 'mercedes-benz-glc-coupe', name: 'Mercedes-Benz GLC Coupe', category: 'SUV', path: '/suv/mercedes-benz-glc-coupe.glb' },
  { id: 'mercedes-benz-gle-2027', name: '2027 Mercedes-Benz GLE', category: 'SUV', path: '/suv/mercedes-benz-gle-2027.glb' },
  { id: 'mercedes-benz-gle-class-w166-coupe', name: 'Mercedes-Benz GLE-Class W166 Coupe', category: 'SUV', path: '/suv/mercedes-benz-gle-class-w166-coupe.glb' },
  { id: 'nissan-x-trail-white', name: 'Nissan X-Trail White', category: 'SUV', path: '/suv/nissan-x-trail-white.glb' },
  { id: 'porsche-cayenne', name: 'Porsche Cayenne', category: 'SUV', path: '/suv/porsche-cayenne.glb' },
  { id: 'range-rover', name: 'Range Rover', category: 'SUV', path: '/suv/range-rover.glb' },
  { id: 'range-rover-2010', name: '2010 Range Rover', category: 'SUV', path: '/suv/range-rover-2010.glb' },
  { id: 'range-rover-sport', name: 'Range Rover Sport', category: 'SUV', path: '/suv/range-rover-sport.glb' },
  { id: 'range-rover-sport-2018', name: '2018 Range Rover Sport', category: 'SUV', path: '/suv/range-rover-sport-2018.glb' },
  { id: 'range-rover-supercharged-2010', name: '2010 Range Rover Supercharged', category: 'SUV', path: '/suv/range-rover-supercharged-2010.glb' },
  { id: 'subaru-forester-2020', name: '2020 Subaru Forester', category: 'SUV', path: '/suv/subaru-forester-2020.glb' },
  { id: 'toyota-harrier', name: 'Toyota Harrier', category: 'SUV', path: '/suv/toyota-harrier.glb' },
  { id: 'toyota-harrier-2022', name: '2022 Toyota Harrier', category: 'SUV', path: '/suv/toyota-harrier-2022.glb' },
  { id: 'toyota-land-cruiser-300-2024', name: '2024 Toyota Land Cruiser 300', category: 'SUV', path: '/suv/toyota-land-cruiser-300-2024.glb' },
  { id: 'toyota-land-cruiser-v8', name: 'Toyota Land Cruiser V8', category: 'SUV', path: '/suv/toyota-land-cruiser-v8.glb' },
  { id: 'toyota-land-cruiser-vx-r-2018', name: '2018 Toyota Land Cruiser VX.R', category: 'SUV', path: '/suv/toyota-land-cruiser-vx-r-2018.glb' },
  { id: 'toyota-prado-2013', name: '2013 Toyota Prado', category: 'SUV', path: '/suv/toyota-prado-2013.glb' },
  { id: 'toyota-prado-2025', name: '2025 Toyota Prado', category: 'SUV', path: '/suv/toyota-prado-2025.glb' },
  { id: 'toyota-rav4-2021', name: '2021 Toyota RAV4', category: 'SUV', path: '/suv/toyota-rav4-2021.glb' },
  { id: 'toyota-rav4-2023', name: '2023 Toyota RAV4', category: 'SUV', path: '/suv/toyota-rav4-2023.glb' },

  // Truck
  { id: 'mitsubishi-fuso-canter', name: 'Mitsubishi Fuso Canter', category: 'Truck', path: '/truck/mitsubishi-fuso-canter.glb' },

  // Wagon
  { id: 'toyota-corolla-fielder-z-aero-tourer-2005', name: '2005 Toyota Corolla Fielder Z Aero Tourer', category: 'Wagon', path: '/wagon/toyota-corolla-fielder-z-aero-tourer-2005.glb' },
  { id: 'toyota-probox', name: 'Toyota Probox', category: 'Wagon', path: '/wagon/toyota-probox.glb' },
];

// Pre-grouped by category for the selector UI.
// Using a Map preserves insertion order so categories appear in the order
// they're first encountered in CAR_MODELS above.
export const CAR_MODELS_BY_CATEGORY: Map<string, CarModel[]> = CAR_MODELS.reduce(
  (map, car) => {
    const group = map.get(car.category) ?? [];
    group.push(car);
    map.set(car.category, group);
    return map;
  },
  new Map<string, CarModel[]>(),
);
