(function () {
  window.ManutencaoFront = window.ManutencaoFront || {};

  const savedBaseUrl = localStorage.getItem("manutencaoauto_api_base_url") || "http://localhost:5000";

  window.ManutencaoFront.config = {
    baseUrl: savedBaseUrl,
  };
})();
