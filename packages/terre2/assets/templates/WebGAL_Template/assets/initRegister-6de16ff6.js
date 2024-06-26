import { r as registerPerform, W as WebGAL, C as Container, T as Texture, S as Sprite, a as SCREEN_CONSTANTS } from "./index-70d63b92.js";
const pixicherryBlossoms = (cherryBlossomsSpeed) => {
  const scalePreset = 0.15;
  const effectsContainer = WebGAL.gameplay.pixiStage.effectsContainer;
  const app = WebGAL.gameplay.pixiStage.currentApp;
  const container = new Container();
  effectsContainer.addChild(container);
  const texture = Texture.from("./game/tex/cherryBlossoms.png");
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;
  container.scale.x = 1;
  container.scale.y = 1;
  const bunnyList = [];
  function tickerFn(delta) {
    const stageWidth = SCREEN_CONSTANTS.width;
    const stageHeight = SCREEN_CONSTANTS.height;
    const bunny = new Sprite(texture);
    let scaleRand = 0.25;
    bunny.scale.x = scalePreset * scaleRand;
    bunny.scale.y = scalePreset * scaleRand;
    bunny.anchor.set(0.5);
    bunny.x = Math.random() * stageWidth - 0.5 * stageWidth;
    bunny.y = 0 - 0.5 * stageHeight;
    bunny["dropSpeed"] = Math.random() * 5;
    bunny["acc"] = Math.random();
    container.addChild(bunny);
    bunnyList.push(bunny);
    let count = 0;
    for (const e of bunnyList) {
      count++;
      const randomNumber = Math.random();
      e["dropSpeed"] = e["acc"] * 0.01 + e["dropSpeed"];
      e.y += delta * cherryBlossomsSpeed * e["dropSpeed"] * 0.3 + 0.7;
      const addX = count % 2 === 0;
      if (addX) {
        e.x += delta * randomNumber * 0.5;
        e.rotation += delta * randomNumber * 0.03;
      } else {
        e.x -= delta * randomNumber * 0.5;
        e.rotation -= delta * randomNumber * 0.03;
      }
    }
    if (bunnyList.length >= 200) {
      bunnyList.unshift();
      container.removeChild(container.children[0]);
    }
  }
  WebGAL.gameplay.pixiStage.registerAnimation(
    { setStartState: () => {
    }, setEndState: () => {
    }, tickerFunc: tickerFn },
    "cherryBlossoms-Ticker"
  );
  return { container, tickerKey: "cherryBlossoms-Ticker" };
};
registerPerform("cherryBlossoms", () => pixicherryBlossoms(3));
const pixiRain = (rainSpeed, number) => {
  var _a;
  const scalePreset = 0.48;
  const effectsContainer = WebGAL.gameplay.pixiStage.effectsContainer;
  const app = WebGAL.gameplay.pixiStage.currentApp;
  const container = new Container();
  effectsContainer.addChild(container);
  const texture = Texture.from("./game/tex/raindrop.png");
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;
  container.scale.x = 1;
  container.scale.y = 1;
  const bunnyList = [];
  function ticker(delta) {
    const stageWidth = SCREEN_CONSTANTS.width;
    const stageHeight = SCREEN_CONSTANTS.height;
    for (let i = 0; i < number; i++) {
      const bunny = new Sprite(texture);
      let scaleRand = Math.random();
      if (scaleRand <= 0.5) {
        scaleRand = 0.5;
      }
      bunny.scale.x = scalePreset * scaleRand;
      bunny.scale.y = scalePreset * scaleRand;
      bunny.anchor.set(0.5);
      bunny.x = Math.random() * stageWidth - 0.5 * stageWidth;
      bunny.y = 0 - 0.5 * stageHeight;
      bunny["dropSpeed"] = Math.random() * 2;
      bunny["acc"] = Math.random();
      bunny["alpha"] = Math.random();
      if (bunny["alpha"] >= 0.5) {
        bunny["alpha"] = 0.5;
      }
      if (bunny["alpha"] <= 0.2) {
        bunny["alpha"] = 0.2;
      }
      container.addChild(bunny);
      bunnyList.push(bunny);
    }
    for (const e of bunnyList) {
      e["dropSpeed"] = e["acc"] * 0.01 + e["dropSpeed"];
      e.y += delta * rainSpeed * e["dropSpeed"] * 1.1 + 3;
    }
    if (bunnyList.length >= 2500) {
      bunnyList.unshift();
      container.removeChild(container.children[0]);
    }
  }
  (_a = WebGAL.gameplay.pixiStage) == null ? void 0 : _a.registerAnimation(
    { setStartState: () => {
    }, setEndState: () => {
    }, tickerFunc: ticker },
    "rain-Ticker"
  );
  return { container, tickerKey: "rain-Ticker" };
};
registerPerform("rain", () => pixiRain(6, 10));
const pixiSnow = (snowSpeed) => {
  var _a;
  const scalePreset = 0.144;
  const effectsContainer = WebGAL.gameplay.pixiStage.effectsContainer;
  const app = WebGAL.gameplay.pixiStage.currentApp;
  const container = new Container();
  effectsContainer.addChild(container);
  const texture = Texture.from("./game/tex/snowFlake_min.png");
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;
  container.scale.x = 1;
  container.scale.y = 1;
  const bunnyList = [];
  function tickerFn(delta) {
    const stageWidth = SCREEN_CONSTANTS.width;
    const stageHeight = SCREEN_CONSTANTS.height;
    const bunny = new Sprite(texture);
    let scaleRand = Math.random();
    if (scaleRand <= 0.5) {
      scaleRand = 0.5;
    }
    bunny.scale.x = scalePreset * scaleRand;
    bunny.scale.y = scalePreset * scaleRand;
    bunny.anchor.set(0.5);
    bunny.x = Math.random() * stageWidth - 0.5 * stageWidth;
    bunny.y = 0 - 0.5 * stageHeight;
    bunny["dropSpeed"] = Math.random() * 2;
    bunny["acc"] = Math.random();
    container.addChild(bunny);
    bunnyList.push(bunny);
    let count = 0;
    for (const e of bunnyList) {
      count++;
      const randomNumber = Math.random();
      e["dropSpeed"] = e["acc"] * 0.01 + e["dropSpeed"];
      e.y += delta * snowSpeed * e["dropSpeed"] * 0.3 + 0.7;
      const addX = count % 2 === 0;
      if (addX) {
        e.x += delta * randomNumber * 0.5;
        e.rotation += delta * randomNumber * 0.03;
      } else {
        e.x -= delta * randomNumber * 0.5;
        e.rotation -= delta * randomNumber * 0.03;
      }
    }
    if (bunnyList.length >= 500) {
      bunnyList.unshift();
      container.removeChild(container.children[0]);
    }
  }
  (_a = WebGAL.gameplay.pixiStage) == null ? void 0 : _a.registerAnimation(
    { setStartState: () => {
    }, setEndState: () => {
    }, tickerFunc: tickerFn },
    "snow-Ticker"
  );
  return { container, tickerKey: "snow-Ticker" };
};
registerPerform("snow", () => pixiSnow(3));
