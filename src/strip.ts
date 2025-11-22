(() => {
  const createPlainTextWindow = (): Window | null => {
    return window.open("", "_blank", "width=800,height=600");
  };

  const plainTextWindow = createPlainTextWindow();

  if (plainTextWindow) {
    plainTextWindow.document.write(
      '<pre id="plainText" style="white-space: pre-wrap; word-wrap: break-word; margin: 10px; font-family: monospace;">Loading plain text...</pre>',
    );
  }

  const getSanitizedClone = (): HTMLElement => {
    const pageClone = document.body.cloneNode(true) as HTMLElement;

    pageClone
      .querySelectorAll("script, style, noscript, iframe")
      .forEach((el) => el.remove());

    pageClone.querySelectorAll("br").forEach((el) => {
      el.replaceWith("\n");
    });

    pageClone.querySelectorAll("p, div").forEach((el) => {
      el.insertAdjacentText("beforeend", "\n");
    });

    return pageClone;
  };

  const pageClone = getSanitizedClone();

  const extractPlainText = (element: Node): string =>
    Array.from(element.childNodes)
      .map((child: Node): string => {
        if (child instanceof HTMLElement) {
          return child.innerText;
        }

        if (child instanceof Text) {
          return child.textContent ?? "";
        }
        return "";
      })
      .filter((line) => line.trim() !== "")
      .join("\n");

  const strippedText = extractPlainText(pageClone);
  const plainTextElement =
    plainTextWindow?.document.getElementById("plainText");
  if (plainTextElement) {
    plainTextElement.textContent = strippedText;
  }
  plainTextWindow?.document.close();
})();
