(() => {
  const eventsToBlock: string[] = [
    "mousedown",
    "mouseup",
    "click",
    "dragstart",
    "selectstart",
    "contextmenu",
    "copy",
    "paste",
    "cut",
    "keydown",
    "keyup",
    "keypress",
    "beforeprint",
    "afterprint",
  ];

  const cleanUp = (doc: Document): void => {
    doc.designMode = "on";

    if (doc.defaultView) {
      doc.defaultView.onbeforeunload = null;
    }

    doc.querySelectorAll("audio, video").forEach((el) => {
      if (el instanceof HTMLMediaElement) {
        el.pause();
      }
    });

    doc.querySelectorAll("script").forEach((el) => el.remove());

    doc.oncontextmenu =
      doc.onselectstart =
      doc.ondragstart =
      doc.onmousedown =
        null;
    if (doc.body) {
      doc.body.oncontextmenu =
        doc.body.onselectstart =
        doc.body.ondragstart =
        doc.body.onmousedown =
        doc.body.oncut =
        doc.body.oncopy =
        doc.body.onpaste =
          null;
    }

    eventsToBlock.forEach((eventType) => {
      doc.addEventListener(
        eventType,
        (e: Event) => {
          e.stopImmediatePropagation();
        },
        true,
      );
    });

    doc.querySelectorAll("*").forEach((el) => {
      if (el instanceof HTMLElement || el instanceof SVGElement) {
        el.style.cursor = "auto";
        el.style.userSelect = "auto";
      }
    });

    doc.querySelectorAll('style, link[rel="stylesheet"]').forEach((styleEl) => {
      if (
        styleEl instanceof HTMLStyleElement ||
        styleEl instanceof HTMLLinkElement
      ) {
        const sheet = styleEl.sheet;
        if (sheet) {
          try {
            for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
              const rule = sheet.cssRules[i];
              if (
                rule instanceof CSSMediaRule &&
                rule.media.mediaText.includes("print")
              ) {
                sheet.deleteRule(i);
              }
            }
          } catch (err) {
            if (err instanceof Error) {
              console.warn(`Could not process a stylesheet: ${err.message}`);
            }
          }
        }
      }
    });

    doc
      .querySelectorAll('link[rel="stylesheet"][media="print"]')
      .forEach((el) => el.remove());
  };

  const punchDOM = (targetWindow: Window): void => {
    try {
      if (!targetWindow?.document) return;

      cleanUp(targetWindow.document);

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

  window.oncontextmenu =
    window.onselectstart =
    window.ondragstart =
    window.onmousedown =
    window.oncopy =
    window.onpaste =
    window.onbeforeprint =
    window.onafterprint =
      null;

  window.print = Function.prototype.bind.call(
    window.print,
    window,
  ) as () => void;

  punchDOM(window);
})();
