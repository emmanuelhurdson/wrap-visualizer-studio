/**
 * DEV-only startup audit.
 *
 * Logs a full car → path table, flags duplicate paths, then HEAD-fetches every
 * GLB to confirm it resolves. Called from main.tsx only when import.meta.env.DEV.
 *
 * NOTE: A ✅ means the path exists on disk — it does NOT mean the file contains
 * the expected model. If a car loads the wrong geometry, the GLB file itself is
 * misnamed; update either the file or the path in src/data/cars.ts.
 */

import { CAR_MODELS } from './cars';

type CheckResult = {
  car:    (typeof CAR_MODELS)[number];
  ok:     boolean;
  status: number | string;
};

export async function validateCarPaths(): Promise<void> {
  // ── 1. Full mapping table ──────────────────────────────────────────────────
  console.groupCollapsed(
    `%c[CarConfig] ${CAR_MODELS.length} registered cars — click to expand`,
    'color:#60a5fa;font-weight:700',
  );

  console.table(
    CAR_MODELS.map((c, i) => ({
      '#':       i + 1,
      Name:      c.name,
      Category:  c.category,
      Path:      c.path,
    })),
  );

  // ── 2. Duplicate-path check ────────────────────────────────────────────────
  const byPath = new Map<string, string[]>();
  for (const car of CAR_MODELS) {
    const list = byPath.get(car.path) ?? [];
    list.push(car.name);
    byPath.set(car.path, list);
  }

  let duplicates = 0;
  for (const [path, names] of byPath) {
    if (names.length > 1) {
      duplicates++;
      console.warn(`⚠️  DUPLICATE PATH  "${path}"  →  [${names.join(', ')}]`);
    }
  }
  if (duplicates === 0) console.log('No duplicate paths detected.');

  // ── 3. HEAD-check every path (5 s timeout) ────────────────────────────────
  console.log('Checking paths…');

  const checks: CheckResult[] = await Promise.all(
    CAR_MODELS.map(async (car): Promise<CheckResult> => {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5_000);
      try {
        const res = await fetch(car.path, { method: 'HEAD', signal: ctrl.signal });
        clearTimeout(timer);
        return { car, ok: res.ok, status: res.status };
      } catch {
        clearTimeout(timer);
        return {
          car,
          ok:     false,
          status: ctrl.signal.aborted ? 'timeout (>5s)' : 'network error',
        };
      }
    }),
  );

  // ── 4. Report ──────────────────────────────────────────────────────────────
  const failed  = checks.filter(r => !r.ok);
  const passing = checks.filter(r => r.ok);

  for (const r of failed) {
    console.error(`❌  ${r.car.name.padEnd(24)}  ${r.car.path}  (${r.status})`);
  }
  for (const r of passing) {
    console.log( `✅  ${r.car.name.padEnd(24)}  ${r.car.path}`);
  }

  if (failed.length > 0) {
    console.error(
      `\n❌ ${failed.length} path(s) broken — fix the paths in src/data/cars.ts\n`,
    );
  } else {
    console.log(
      `\n✅ All ${CAR_MODELS.length} paths resolve.` +
      `\n   If a car still loads the wrong model, the GLB file is misnamed on disk.` +
      `\n   Cross-reference the "Path" column above with the file's actual 3D content.\n`,
    );
  }

  console.groupEnd();
}
