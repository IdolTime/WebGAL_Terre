export function getWhenARGExpression(value = '') {
  return value.split(/([+\-*\/()><!]=?|>=|<=|==|&&|\|\||!=)/g);
}

const mapper = new Map();

export function animateCursor(node: HTMLElement | null, frames: string[], delay: number) {
  let frameIndex = 0;
  let timer;
  let marker = Date.now();

  const prevTimer = mapper.get(node);

  if (prevTimer) {
    clearInterval(prevTimer);
  }

  if (!node) return () => {};
  
  function updateCursor() {
    console.log(Date.now() - marker);
    marker = Date.now();
    const frame = frames[frameIndex];
    // @ts-ignore
    node.style.cursor = `url(${frame}), auto`;
    frameIndex = (frameIndex + 1) % frames.length;
  }
  
  updateCursor();
  timer = setInterval(updateCursor, delay);

  mapper.set(node, timer);

  return () => {
    clearInterval(timer);
    mapper.delete(node);
  };
}