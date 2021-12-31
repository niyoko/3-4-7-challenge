import * as React from "react";
import * as PIXI from "pixi.js";

const SIZE = 640;
const s = 250;
const speed = 0.02;

function setPos(alpha, r1, r2, pos) {
  const p1x = r1 * Math.cos(alpha);
  const p1y = r1 * Math.sin(alpha);

  const beta = alpha / (1 - r1);
  const gamma = beta - alpha;
  const p2x = p1x + r2 * Math.cos(gamma);
  const p2y = p1y - r2 * Math.sin(gamma);

  pos.set(s * p2x + SIZE / 2, SIZE / 2 - s * p2y);
}

const makePoint = (app, points) => {
  const point = new PIXI.Graphics();
  point.beginFill(0xffffff);
  point.drawCircle(0, 0, 3);
  point.endFill();
  points.push(point);
  app.stage.addChild(point);
};

const makeApp = (canvas, params) => {
  const app = new PIXI.Application({ antialias: true, view: canvas });

  const brush = new PIXI.Graphics();
  brush.beginFill(0xff0000);
  brush.drawRect(0, 0, 2, 2);
  brush.endFill();

  const blackBrush = new PIXI.Graphics();
  blackBrush.beginFill(0x000000);
  blackBrush.drawRect(0, 0, 2, 2);
  blackBrush.endFill();

  const renderTexture = PIXI.RenderTexture.create({
    width: SIZE,
    height: SIZE,
  });

  const renderTextureSprite = new PIXI.Sprite(renderTexture);
  renderTextureSprite.filters = [new PIXI.filters.FXAAFilter()];
  app.stage.addChild(renderTextureSprite);
  const opt = { clear: false, renderTexture };

  const points = [];
  for (let i = 0; i < 50; i++) {}

  let phase = 0;
  const prev = {};

  app.ticker.add((delta) => {
    const { a, b, showStar } = params;
    const wrap = 2 * b * Math.PI;
    phase += speed * delta;
    phase = phase % wrap;
    const r1 = (a - b) / a;
    const r2 = 1 - r1 - 0.05;

    const lim = b * (a - b);
    for (let i = 0; i < Math.max(points.length, lim); i++) {
      if (i >= points.length) makePoint(app, points);
      if (i < lim) {
        setPos(phase + i * (wrap / lim), r1, r2, points[i].position);
      } else points[i].position.set(-5, -5);
    }

    if (prev.a !== a || prev.b !== b || prev.showStar !== showStar) {
      prev.a = a;
      prev.b = b;
      prev.showStar = showStar;

      const sens = 0.003;
      const tot = showStar ? Math.ceil(wrap / sens) : 0;

      for (let i = 0; i <= tot; i++) {
        setPos(i * sens, r1, r2, brush.position);
        if (i === 0) app.renderer.render(blackBrush, { ...opt, clear: true });
        else app.renderer.render(brush, opt);
      }
    }
  });

  return app;
};

export default function ({ a, b, showStar }) {
  /** @type {{current: {app: PIXI.Application}}} */
  const ref = React.useRef({});
  const params = React.useRef({ a, b, showStar });
  const [canvas, setCanvas] = React.useState();

  React.useEffect(() => {
    if (canvas) {
      const app = makeApp(canvas, params.current);
      ref.current.app = app;
      return () => {
        ref.current = {};
        app.destroy();
      };
    }
  }, [canvas]);

  React.useEffect(() => {
    params.current.a = a;
    params.current.b = b;
    params.current.showStar = showStar;
  }, [a, b, showStar]);

  return <canvas ref={setCanvas} width={SIZE} height={SIZE} />;
}
