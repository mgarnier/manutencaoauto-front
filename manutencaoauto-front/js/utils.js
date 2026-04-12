(function () {
  window.ManutencaoFront = window.ManutencaoFront || {};

  function escapeHtml(value) {
    const text = value == null ? "" : String(value);
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatCurrency(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return "R$ 0,00";
    }
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const text = String(value).trim();
    const isoDateMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDateMatch) {
      const [, year, month, day] = isoDateMatch;
      return `${day}/${month}/${year}`;
    }

    const date = new Date(text);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }

  function showFeedback(type, message) {
    const feedback = document.getElementById("global-feedback");
    feedback.className = "feedback";
    feedback.classList.add(type || "info");
    feedback.textContent = message;
    feedback.classList.remove("hidden");
  }

  function hideFeedback() {
    const feedback = document.getElementById("global-feedback");
    feedback.className = "feedback hidden";
    feedback.textContent = "";
  }

  function buildQuery(params) {
    const query = new URLSearchParams();
    Object.keys(params || {}).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });
    const asString = query.toString();
    return asString ? `?${asString}` : "";
  }

  window.ManutencaoFront.utils = {
    escapeHtml,
    formatCurrency,
    formatDate,
    showFeedback,
    hideFeedback,
    buildQuery,
  };
})();
