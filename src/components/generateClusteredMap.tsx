import Phaser from "phaser";

/** Typ elementu: 1 = kamień, 2 = jezioro */
export type TileType = 1 | 2;

/** Definicja poligonu */
export interface PolygonDef {
  type: TileType;
  points: { x: number; y: number }[]; // w px
  bbox: { x0: number; y0: number; x1: number; y1: number }; // box do szybkiego testu kolizji
}

/** Parametry dla kamieni / jezior */
export interface NaturalConfig {
  type: TileType;
  count: number; // ile obiektów
  minRadius: number; // minimalny promień (px)
  maxRadius: number; // maksymalny promień (px)
  points: number; // ile wierzchołków dla kamienia
  irregularity: number; // od 0 do 1 – jak mocno wierzchołki oddalone od promienia
}

/**
 * Generuje nieregularne poligony (kamienie i jeziora), bez nakładania.
 * width, height – rozmiary świata (px)
 */
export function generateClusteredMap(
  width: number,
  height: number,
  configs: NaturalConfig[],
  maxAttempts = 30
): PolygonDef[] {
  const shapes: PolygonDef[] = [];

  /** Czy dwa boxy się nakładają? */
  const boxesOverlap = (a: any, b: any) =>
    a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

  for (const cfg of configs) {
    let placed = 0;
    let attempts = 0;

    while (placed < cfg.count && attempts < cfg.count * maxAttempts) {
      attempts++;

      // losowy środek
      const cx = Phaser.Math.Between(cfg.maxRadius, width - cfg.maxRadius);
      const cy = Phaser.Math.Between(cfg.maxRadius, height - cfg.maxRadius);
      // generujemy wierzchołki w kształcie koła o promieniu r
      const r = Phaser.Math.Between(cfg.minRadius, cfg.maxRadius);
      const angleStep = (Math.PI * 2) / cfg.points;
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < cfg.points; i++) {
        const ang =
          i * angleStep +
          Phaser.Math.FloatBetween(-angleStep / 2, angleStep / 2);
        const ir =
          r *
          (1 -
            cfg.irregularity / 2 +
            Phaser.Math.FloatBetween(0, cfg.irregularity));
        pts.push({ x: cx + Math.cos(ang) * ir, y: cy + Math.sin(ang) * ir });
      }

      // bounding box
      const xs = pts.map((p) => p.x);
      const ys = pts.map((p) => p.y);
      const bbox = {
        x0: Math.min(...xs),
        y0: Math.min(...ys),
        x1: Math.max(...xs),
        y1: Math.max(...ys),
      };

      // czy box wychodzi poza granice?
      if (bbox.x0 < 0 || bbox.y0 < 0 || bbox.x1 > width || bbox.y1 > height) {
        continue;
      }
      // czy nachodzi na istniejące?
      if (shapes.some((s) => boxesOverlap(s.bbox, bbox))) {
        continue;
      }

      // zaakceptuj kształt
      shapes.push({ type: cfg.type, points: pts, bbox });
      placed++;
    }

    if (placed < cfg.count) {
      console.warn(`Placed only ${placed}/${cfg.count} of type ${cfg.type}`);
    }
  }

  return shapes;
}
