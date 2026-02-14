/**
 * RestoBot AI — Widget Embeddable
 * Usage: <script src="https://ai-restaurant-chatbot.vercel.app/widget.js" data-restaurant="chez-marcel"></script>
 */
(function () {
  const script = document.currentScript;
  const restaurant = script?.getAttribute("data-restaurant") || "chez-marcel";
  const host = script?.src ? new URL(script.src).origin : "https://ai-restaurant-chatbot.vercel.app";

  // Styles
  const style = document.createElement("style");
  style.textContent = `
    #restobot-widget-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 64px; height: 64px; border-radius: 50%; border: none; cursor: pointer;
      background: linear-gradient(135deg, #f97316, #ea580c);
      box-shadow: 0 4px 24px rgba(249,115,22,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s;
    }
    #restobot-widget-btn:hover { transform: scale(1.1); }
    #restobot-widget-btn svg { width: 32px; height: 32px; fill: none; stroke: white; stroke-width: 2; }
    #restobot-widget-frame {
      position: fixed; bottom: 100px; right: 24px; z-index: 99999;
      width: 400px; height: 600px; max-width: calc(100vw - 48px); max-height: calc(100vh - 120px);
      border: none; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.3);
      display: none;
    }
  `;
  document.head.appendChild(style);

  // Button
  const btn = document.createElement("button");
  btn.id = "restobot-widget-btn";
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  btn.setAttribute("aria-label", "Ouvrir le chat");
  document.body.appendChild(btn);

  // Iframe
  const iframe = document.createElement("iframe");
  iframe.id = "restobot-widget-frame";
  iframe.src = `${host}/widget-chat?restaurant=${restaurant}`;
  iframe.setAttribute("title", "RestoBot AI Chat");
  document.body.appendChild(iframe);

  let open = false;
  btn.addEventListener("click", function () {
    open = !open;
    iframe.style.display = open ? "block" : "none";
  });
})();
