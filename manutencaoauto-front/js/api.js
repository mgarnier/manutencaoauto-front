(function () {
  window.ManutencaoFront = window.ManutencaoFront || {};

  const { config, utils } = window.ManutencaoFront;

  async function request(path, options) {
    const url = `${config.baseUrl}${path}`;
    try {
      const response = await fetch(url, {
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: data.error || "Falha ao processar a requisição.",
          data,
        };
      }

      return { ok: true, status: response.status, data };
    } catch (error) {
      console.error("Falha de rede/CORS ao acessar a API", { url, error });
      return {
        ok: false,
        status: 0,
        error: "Não foi possível conectar à API. Verifique se o backend está ativo e se a URL está correta.",
      };
    }
  }

  function getManutencoes() {
    return request("/manutencoes");
  }

  function createManutencao(payload) {
    return request("/manutencoes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  function deleteManutencao(id) {
    return request(`/manutencoes/${id}`, {
      method: "DELETE",
    });
  }

  function getServicos() {
    return request("/servicos");
  }

  function createServico(payload) {
    return request("/servicos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  function deleteServico(id) {
    return request(`/servicos/${id}`, {
      method: "DELETE",
    });
  }

  function getAssociacoes(filters) {
    const query = utils.buildQuery(filters || {});
    return request(`/manutencao-servicos${query}`);
  }

  function createAssociacao(ids, payload) {
    const query = utils.buildQuery(ids);
    return request(`/manutencao-servicos${query}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  function deleteAssociacao(ids) {
    const query = utils.buildQuery(ids);
    return request(`/manutencao-servicos${query}`, {
      method: "DELETE",
    });
  }

  window.ManutencaoFront.api = {
    getManutencoes,
    createManutencao,
    deleteManutencao,
    getServicos,
    createServico,
    deleteServico,
    getAssociacoes,
    createAssociacao,
    deleteAssociacao,
  };
})();
