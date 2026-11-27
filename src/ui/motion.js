const EFFECTS = "cubic-bezier(0.31, 0.94, 0.34, 1)";
const SPATIAL = "cubic-bezier(0.42, 1.67, 0.21, 0.90)";

function reduced() {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function clearAnimations(element) {
  if (!element?.getAnimations) return;
  for (const animation of element.getAnimations()) animation.cancel();
}

export function animateIn(element, options = {}) {
  const {
    duration = 150,
    easing = EFFECTS,
    delay = 0,
    from = { opacity: 0, transform: "translateY(6px)" },
    to = { opacity: 1, transform: "none" },
  } = options;
  if (!element?.animate || reduced()) return null;
  clearAnimations(element);
  return element.animate([from, to], {
    duration,
    easing,
    delay,
    fill: "backwards",
  });
}

export function animateOut(element, options = {}) {
  const {
    duration = 120,
    easing = EFFECTS,
    to = { opacity: 0, transform: "translateY(4px)" },
  } = options;
  if (!element?.animate || reduced()) return null;
  clearAnimations(element);
  return element.animate(
    [{ opacity: 1, transform: "none" }, to],
    { duration, easing, fill: "forwards" },
  );
}

export function slideIn(element, axis = "x") {
  const offset = axis === "x" ? "translateX(24px)" : "translateY(24px)";
  return animateIn(element, {
    duration: 350,
    easing: SPATIAL,
    from: { opacity: 0, transform: offset },
  });
}

export function slideOut(element, axis = "x") {
  const offset = axis === "x" ? "translateX(24px)" : "translateY(24px)";
  return animateOut(element, {
    duration: 150,
    to: { opacity: 0, transform: offset },
  });
}

export function pressFeedback(element) {
  if (!element?.animate || reduced()) return;
  element.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(0.97)" },
      { transform: "scale(1)" },
    ],
    { duration: 220, easing: SPATIAL },
  );
}

let morphRequest = 0;
let morphAnimation = null;
let morphRestore = null;

export function cancelMorph() {
  morphAnimation?.cancel();
  morphAnimation = null;
  morphRestore?.();
  morphRestore = null;
}

function clipAncestors(image) {
  return [
    image.closest(".detail__art"),
    image.closest(".detail-pane"),
    image.closest(".dialog"),
    image.closest("#detail-slot"),
  ].filter(Boolean);
}

function unlockClipping(elements) {
  const saved = [];
  for (const element of elements) {
    const style = getComputedStyle(element);
    const borders =
      (parseFloat(style.borderLeftWidth) || 0) +
      (parseFloat(style.borderRightWidth) || 0);
    const scrollbar = element.offsetWidth - element.clientWidth - borders;
    const padding = parseFloat(style.paddingRight) || 0;
    saved.push({
      element,
      overflow: element.style.overflow,
      paddingRight: element.style.paddingRight,
    });
    element.style.overflow = "visible";
    if (scrollbar > 0) element.style.paddingRight = `${padding + scrollbar}px`;
  }
  return () => {
    for (const entry of saved) {
      entry.element.style.overflow = entry.overflow;
      entry.element.style.paddingRight = entry.paddingRight;
    }
  };
}

export function morphImage(sourceImg, targetImg) {
  if (!sourceImg || !targetImg || !targetImg.animate || reduced()) return null;
  const request = ++morphRequest;
  cancelMorph();

  const run = () => {
    if (request !== morphRequest) return null;
    const from = sourceImg.getBoundingClientRect();
    const to = targetImg.getBoundingClientRect();
    if (!from.width || !from.height || !to.width || !to.height) return null;

    const restore = unlockClipping(clipAncestors(targetImg));
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const sx = from.width / to.width;
    const sy = from.height / to.height;
    const animation = targetImg.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        { transform: "none" },
      ],
      { duration: 420, easing: EFFECTS },
    );
    morphAnimation = animation;
    morphRestore = restore;
    const finish = () => {
      if (request !== morphRequest) return;
      morphAnimation = null;
      morphRestore = null;
      restore();
    };
    if (animation.finished) animation.finished.then(finish).catch(finish);
    else animation.onfinish = finish;
    return animation;
  };

  if (targetImg.complete && targetImg.naturalWidth > 0) return run();

  let settled = false;
  const ready = () => {
    if (settled) return;
    settled = true;
    if (request === morphRequest) run();
  };
  targetImg.addEventListener("load", ready, { once: true });
  const decoding = targetImg.decode?.();
  if (decoding?.then) decoding.then(ready).catch(() => {});
  else setTimeout(ready, 80);
  return null;
}

export function staggerIn(elements, options = {}) {
  if (reduced()) return;
  const { step = 20, limit = 12 } = options;
  [...elements].slice(0, limit).forEach((element, index) => {
    animateIn(element, {
      duration: 200,
      delay: index * step,
      from: { opacity: 0, transform: "translateY(8px)" },
    });
  });
}
