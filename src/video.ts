((elements: NodeListOf<Element>): void => {
  for (const el of Array.from(elements)) {
    if (el instanceof HTMLMediaElement && el.currentSrc) {
      window.open(el.currentSrc);
      return;
    }
  }
})(document.querySelectorAll("audio, video"));
