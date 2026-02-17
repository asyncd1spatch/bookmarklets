(() => {
  /**
   * @param doc
   */
  const punchOverlay = (doc: Document): void => {
    const minOverlaySize = 0.1;
    const viewportArea =
      doc.documentElement.clientWidth * doc.documentElement.clientHeight;

    doc.querySelectorAll("*").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (
        (rect.width * rect.height) / viewportArea > minOverlaySize &&
        ["fixed", "absolute"].includes(window.getComputedStyle(el).position)
      ) {
        el.remove();
      }
    });
  };

  const punchDOM = (targetWindow: Window): void => {
    try {
      if (!targetWindow || !targetWindow.document) {
        return;
      }

      punchOverlay(targetWindow.document);

      for (let i = 0; i < targetWindow.frames.length; i++) {
        const frame = targetWindow.frames[i];
        if (frame) {
          punchDOM(frame);
        }
      }
    } catch {
      console.log(
        "Could not access a frame, likely due to cross-origin policy.",
      );
    }
  };

  punchDOM(window);
})();
