(function () {
  window.ManutencaoFront = window.ManutencaoFront || {};

  const { views, config, utils } = window.ManutencaoFront;

  const routes = {
    "/manutencoes": views.manutencoes,
    "/servicos": views.servicos,
    "/associacoes": views.associacoes,
  };

  function normalizeRoute(hash) {
    const value = (hash || "").replace(/^#/, "");
    if (!value) {
      return "/manutencoes";
    }
    return routes[value] ? value : "/manutencoes";
  }

  function activateTab(route) {
    document.querySelectorAll(".tab-link").forEach((link) => {
      const linkRoute = link.getAttribute("data-route");
      if (linkRoute === route) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  async function renderRoute() {
    const route = normalizeRoute(window.location.hash);
    if (window.location.hash !== `#${route}`) {
      window.location.hash = `#${route}`;
      return;
    }

    activateTab(route);
    const container = document.getElementById("app-view");
    utils.hideFeedback();

    const view = routes[route];
    await view.render(container);
  }

  function bindApiUrlControls() {
    const input = document.getElementById("api-base-url");
    const button = document.getElementById("save-api-url");

    input.value = config.baseUrl;
    button.addEventListener("click", async () => {
      const nextValue = (input.value || "").trim().replace(/\/$/, "");
      if (!nextValue) {
        utils.showFeedback("error", "Informe uma URL base válida para a API.");
        return;
      }

      config.baseUrl = nextValue;
      localStorage.setItem("manutencaoauto_api_base_url", nextValue);
      utils.showFeedback("success", "URL da API atualizada.");
      await renderRoute();
    });
  }

  async function start() {
    bindApiUrlControls();
    window.addEventListener("hashchange", renderRoute);
    await renderRoute();
  }

  window.addEventListener("DOMContentLoaded", start);
})();
