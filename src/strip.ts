(() => {
  const createPlainTextWindow = (): Window | null => {
    return window.open("", "_blank", "width=800,height=600");
  };

  const plainTextWindow = createPlainTextWindow();

  if (!plainTextWindow) {
    return;
  }

  const doc = plainTextWindow.document;
  doc.open();

  if (!doc.documentElement) {
    const html = doc.createElement("html");
    const head = doc.createElement("head");
    const meta = doc.createElement("meta");
    meta.setAttribute("charset", "utf-8");
    head.appendChild(meta);

    const body = doc.createElement("body");

    html.appendChild(head);
    html.appendChild(body);
    doc.appendChild(html);
  }

  const pre = doc.createElement("pre");
  pre.id = "plainText";
  pre.textContent = "Loading plain text...";
  pre.style.whiteSpace = "pre-wrap";
  pre.style.overflowWrap = "break-word";
  pre.style.margin = "10px";
  pre.style.fontFamily = "monospace";

  doc.body.appendChild(pre);
  doc.close();

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
  const plainTextElement = doc.getElementById("plainText");

  if (plainTextElement) {
    plainTextElement.textContent = strippedText;
  }
})();
