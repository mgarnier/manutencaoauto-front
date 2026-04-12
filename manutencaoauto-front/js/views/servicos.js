(function () {
  window.ManutencaoFront = window.ManutencaoFront || {};

  const { api, utils } = window.ManutencaoFront;

  function template(items) {
    const rows = (items || [])
      .map((item) => {
        return `
          <tr>
            <td>${utils.escapeHtml(item.id)}</td>
            <td>${utils.escapeHtml(item.nome)}</td>
            <td>${utils.escapeHtml(item.frequencia_km)}</td>
            <td>${utils.formatCurrency(item.preco)}</td>
            <td class="actions">
              <button type="button" class="danger" data-action="delete-servico" data-id="${utils.escapeHtml(item.id)}">Excluir</button>
            </td>
          </tr>
        `;
      })
      .join("");

    const tableContent = rows
      ? `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Frequência (km)</th>
              <th>Preço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `
      : '<div class="empty-state">Nenhum serviço encontrado.</div>';

    return `
      <div class="view-head">
        <h2>Serviços</h2>
        <p>Defina o catálogo de serviços disponíveis.</p>
      </div>
      <div class="grid-2">
        <section class="card">
          <h3>Novo serviço</h3>
          <form id="form-servico">
            <div class="field">
              <label for="s-nome">Nome</label>
              <input id="s-nome" name="nome" required>
            </div>
            <div class="field">
              <label for="s-freq">Frequência (km)</label>
              <input id="s-freq" name="frequencia_km" type="number" min="1" required>
            </div>
            <div class="field">
              <label for="s-preco">Preço (R$)</label>
              <input id="s-preco" name="preco" type="number" step="0.01" min="0" required>
            </div>
            <div class="form-actions">
              <button type="submit">Salvar</button>
              <button type="button" class="secondary" data-action="refresh-servicos">Atualizar lista</button>
            </div>
          </form>
        </section>
        <section class="card">
          <h3>Lista de serviços</h3>
          ${tableContent}
        </section>
      </div>
    `;
  }

  async function render(container) {
    container.innerHTML = '<div class="empty-state">Carregando serviços...</div>';
    const result = await api.getServicos();

    if (!result.ok) {
      utils.showFeedback("error", result.error);
      container.innerHTML = template([]);
      bindEvents(container);
      return;
    }

    const items = result.data.servicos || [];
    container.innerHTML = template(items);
    bindEvents(container);
  }

  function bindEvents(container) {
    const form = container.querySelector("#form-servico");
    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);

        const payload = {
          nome: (formData.get("nome") || "").trim(),
          frequencia_km: Number(formData.get("frequencia_km") || 0),
          preco: Number(formData.get("preco") || 0),
        };

        if (!payload.nome) {
          utils.showFeedback("error", "Informe um nome para o serviço.");
          return;
        }

        const result = await api.createServico(payload);
        if (!result.ok) {
          utils.showFeedback("error", result.error);
          return;
        }

        utils.showFeedback("success", "Serviço criado com sucesso.");
        form.reset();
        await render(container);
      });
    }

    container.querySelectorAll('[data-action="delete-servico"]').forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-id");
        const proceed = window.confirm(`Deseja excluir o serviço #${id}?`);
        if (!proceed) {
          return;
        }

        const result = await api.deleteServico(id);
        if (!result.ok) {
          utils.showFeedback("error", result.error);
          return;
        }

        utils.showFeedback("success", "Serviço excluído com sucesso.");
        await render(container);
      });
    });

    const refreshButton = container.querySelector('[data-action="refresh-servicos"]');
    if (refreshButton) {
      refreshButton.addEventListener("click", async () => {
        await render(container);
      });
    }
  }

  window.ManutencaoFront.views = window.ManutencaoFront.views || {};
  window.ManutencaoFront.views.servicos = { render };
})();
