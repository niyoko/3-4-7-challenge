import * as React from "react";
import * as PIXI from "pixi.js";

const SIZE = 640;
const s = 250;

/**
 * @param {PIXI.Point} p1
 * @param {PIXI.Point} p2
 * */
function dist(p1, p2) {
  const xg = p1.x - p2.x;
  const yg = p1.y - p2.y;
  return Math.sqrt(xg * xg + yg * yg);
}

/** @param {PIXI.Point[]} points */
function reorderPoints(points, cache) {
  if (points.length <= 3) return points;

  if (!cache.value) {
    const pref = points[0];
    let min = Number.MAX_VALUE;
    for (let i = 1; i < points.length; i++) {
      const d = dist(pref, points[i]);
      if (d < min) {
        min = d;
        cache.value = i;
      }
    }
  }

  const g = cache.value;
  const np = [];
  let j = 0;
  while (np.length < points.length) {
    np.push(points[j]);
    j = (j + g) % points.length;
  }

  return np;
}

function calculatePos(alpha, r1, r2) {
  const p1x = r1 * Math.cos(alpha);
  const p1y = r1 * Math.sin(alpha);

  const beta = alpha / (1 - r1);
  const gamma = beta - alpha;
  const p2x = p1x + r2 * Math.cos(gamma);
  const p2y = p1y - r2 * Math.sin(gamma);

  return [s * p2x + SIZE / 2, SIZE / 2 - s * p2y];
}

const makeApp = (canvas, params) => {
  const app = new PIXI.Application({
    antialias: true,
    autoDensity: true,
    view: canvas,
    width: SIZE,
    height: SIZE,
    backgroundColor: 0xffffff,
  });

  const starContainer = new PIXI.Container();
  starContainer.zIndex = 0;

  const g2Container = new PIXI.Container();
  g2Container.zIndex = 2;

  const g1Container = new PIXI.Container();
  g1Container.zIndex = 3;

  const pointsContainer = new PIXI.Container();
  pointsContainer.zIndex = 4;

  const star = new PIXI.Graphics();
  starContainer.addChild(star);

  let phase = 0;
  const prev = {};

  const setMode = (name, container) => {
    if (prev[name] !== params[name]) {
      prev[name] = params[name];
      if (params[name]) app.stage.addChildAt(container);
      else app.stage.removeChild(container);
      app.stage.sortChildren();
    }
  };

  app.ticker.add((delta) => {
    const { a, b, animationSpeed, starRoundness } = params;
    const wrap = 2 * b * Math.PI;

    const lim = b * (a - b);

    phase += animationSpeed * delta;
    phase = phase % wrap;
    const r1 = (a - b) / a;
    const roundnessRange = 1 - r1;
    const r2 = 1 - r1 - (starRoundness / 100) * roundnessRange;

    if (prev.a !== a || prev.b !== b) {
      prev.gg1 = {};
      prev.gg2 = {};
    }

    if (prev.a !== a || prev.b !== b || prev.starRoundness !== starRoundness) {
      prev.a = a;
      prev.b = b;
      prev.starRoundness = starRoundness;

      const sens = 0.01;
      const tot = Math.ceil(wrap / sens);

      star.clear();
      star.lineStyle(2, 0x747374);
      for (let i = 0; i <= tot; i++) {
        const pos = calculatePos(i * sens, r1, r2);
        if (i === 0) star.moveTo(...pos);
        else star.lineTo(...pos);
      }

      pointsContainer.removeChildren();
      for (let i = 0; i < lim; i++) {
        const cont = new PIXI.Container();
        const point = new PIXI.Graphics();

        point.beginFill(0x556cd6);
        point.drawCircle(0, 0, 5);
        point.endFill();

        cont.addChild(point);
        pointsContainer.addChild(cont);
      }

      g1Container.removeChildren();
      g2Container.removeChildren();
      for (let i = 0; i < a - b; i++) {
        g1Container.addChild(new PIXI.Graphics());
      }

      for (let i = 0; i < b; i++) {
        g2Container.addChild(new PIXI.Graphics());
      }
    }

    setMode("showStar", starContainer);
    setMode("showPoints", pointsContainer);
    setMode("showG1", g1Container);
    setMode("showG2", g2Container);

    const len = pointsContainer.children.length;
    for (let i = 0; i < len; i++) {
      const point = pointsContainer.getChildAt(i);
      point.position.set(...calculatePos(phase + i * (wrap / lim), r1, r2));
    }

    for (let i = 0; i < a - b; i++) {
      const gp = (k) => (i + 1 * (a - b) * k) % lim;

      const points = [];
      for (let j = 0; j < b; j++) {
        points.push(pointsContainer.getChildAt(gp(j)).position);
      }

      /** @type {PIXI.Graphics} */
      const g = g1Container.getChildAt(i);
      g.clear();
      g.lineStyle(2, 0x00ff00);
      g.drawPolygon(reorderPoints(points, prev.gg1));
    }

    for (let i = 0; i < b; i++) {
      const gp = (k) => (i + b * k) % lim;

      const points = [];
      for (let j = 0; j < a - b; j++) {
        points.push(pointsContainer.getChildAt(gp(j)).position);
      }

      /** @type {PIXI.Graphics} */
      const g = g2Container.getChildAt(i);
      g.clear();
      g.lineStyle(2, 0xff6666);
      g.drawPolygon(reorderPoints(points, prev.gg2));
    }
  });

  return app;
};

export default function ({
  a,
  b,
  showStar,
  showPoints,
  showG1,
  showG2,
  animationSpeed,
  starRoundness,
}) {
  const params = React.useRef({
    a,
    b,
    showStar,
    showPoints,
    showG1,
    animationSpeed,
    starRoundness,
  });
  const [canvas, setCanvas] = React.useState();

  React.useEffect(() => {
    if (canvas) {
      const app = makeApp(canvas, params.current);
      return () => {
        app.destroy();
      };
    }
  }, [canvas]);

  React.useEffect(() => {
    params.current.a = a;
    params.current.b = b;
    params.current.showStar = showStar;
    params.current.showPoints = showPoints;
    params.current.showG1 = showG1;
    params.current.showG2 = showG2;
    params.current.animationSpeed = animationSpeed;
    params.current.starRoundness = starRoundness;
  }, [
    a,
    b,
    showStar,
    showPoints,
    showG1,
    showG2,
    animationSpeed,
    starRoundness,
  ]);

  return <canvas ref={setCanvas} width={SIZE} height={SIZE} />;
}
