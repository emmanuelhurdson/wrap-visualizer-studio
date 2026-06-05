export type CarModel = {
  id:       string;
  name:     string;
  category: string;
  path:     string; // path relative to Vite's public/ folder, starts with /
};

export const DEFAULT_CAR_ID = 'porsche-911';

// One entry per GLB file in public/.
// Category string becomes an <optgroup> label in the selector.
export const CAR_MODELS: CarModel[] = [
  // ── Coupe ──────────────────────────────────────────────────────────────────
  { id: 'porsche-911',    name: 'Porsche 911',          category: 'Coupe',    path: '/coupe/911.glb'         },
  { id: 'cayenne',        name: 'Porsche Cayenne',       category: 'Coupe',    path: '/coupe/cayenne.glb'     },
  { id: 'bmw-i8',         name: 'BMW i8',                category: 'Coupe',    path: '/coupe/ibmw.glb'        },
  { id: 'bmw-m6',         name: 'BMW M6',                category: 'Coupe',    path: '/coupe/m6.glb'          },
  { id: 'audi-tt',        name: 'Audi TT',               category: 'Coupe',    path: '/coupe/tt.glb'          },

  // ── Hatchback ───────────────────────────────────────────────────────────────
  { id: 'mazda-3',        name: 'Mazda 3',               category: 'Hatchback', path: '/hatchback/mazda.glb'  },

  // ── Mini SUV ────────────────────────────────────────────────────────────────
  { id: 'aston-dbx',      name: 'Aston Martin DBX',      category: 'Mini SUV', path: '/minisuv/dbx.glb'       },
  { id: 'mercedes-glc',   name: 'Mercedes GLC',           category: 'Mini SUV', path: '/minisuv/glcc.glb'      },
  { id: 'bmw-x3',         name: 'BMW X3',                 category: 'Mini SUV', path: '/minisuv/x3.glb'        },

  // ── Pickup ──────────────────────────────────────────────────────────────────
  { id: 'ford-raptor',    name: 'Ford Raptor',            category: 'Pickup',   path: '/pickup/raptor.glb'     },

  // ── Sedan ───────────────────────────────────────────────────────────────────
  { id: 'mercedes-a45',   name: 'Mercedes A45',           category: 'Sedan',    path: '/sedan/a45.glb'         },
  { id: 'mazda-atenza',   name: 'Mazda Atenza',           category: 'Sedan',    path: '/sedan/atenza.glb'      },
  { id: 'bmw-m3',         name: 'BMW M3',                 category: 'Sedan',    path: '/sedan/m3.glb'          },
  { id: 'vw-polo',        name: 'Volkswagen Polo',        category: 'Sedan',    path: '/sedan/polo.glb'        },

  // ── SUV ─────────────────────────────────────────────────────────────────────
  { id: 'range-rover',    name: 'Range Rover',            category: 'SUV',      path: '/suv/2010rr.glb'        },
  { id: 'nissan-xtrail',  name: 'Nissan X-Trail',         category: 'SUV',      path: '/suv/XTWHITWE.glb'      },
  { id: 'mercedes-g63',   name: 'Mercedes G63',           category: 'SUV',      path: '/suv/g63.glb'           },
  { id: 'mercedes-g63-2', name: 'Mercedes G63 AMG',       category: 'SUV',      path: '/suv/g631.glb'          },
  { id: 'lexus-gx',       name: 'Lexus GX',               category: 'SUV',      path: '/suv/lec.glb'           },
  { id: 'lexus-lx',       name: 'Lexus LX',               category: 'SUV',      path: '/suv/lx.glb'            },
  { id: 'rr-sport',       name: 'Range Rover Sport',      category: 'SUV',      path: '/suv/rrsport.glb'       },
  { id: 'bmw-x7',         name: 'BMW X7',                 category: 'SUV',      path: '/suv/x7.glb'            },
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
