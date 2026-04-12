(function () {
  window.ManutencaoFront = window.ManutencaoFront || {};

  const { api, utils } = window.ManutencaoFront;

  function template(items) {
    const rows = (items || [])
      .map((item) => {
        return `
          <tr>
            <td>${utils.escapeHtml(item.id_manutencao)}</td>
            <td>${utils.escapeHtml(item.manutencao && item.manutencao.descricao ? item.manutencao.descricao : "-")}</td>
            <td>${utils.escapeHtml(item.id_servico)}</td>
            <td>${utils.escapeHtml(item.servico && item.servico.nome ? item.servico.nome : "-")}</td>
            <td>${utils.formatCurrency(item.preco)}</td>
            <td class="actions">
              <button type="button" class="danger" data-action="delete-associacao" data-id-manutencao="${utils.escapeHtml(item.id_manutencao)}" data-id-servico="${utils.escapeHtml(item.id_servico)}">Excluir</button>
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
              <th>ID Manutenção</th>
              <th>Descrição</th>
              <th>ID Serviço</th>
              <th>Serviço</th>
              <th>Preço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `
      : '<div class="empty-state">Nenhuma associação encontrada.</div>';

    return `
      <div class="view-head">
        <h2>Associações Manutenção x Serviço</h2>
        <p>Vincule serviços a manutenções e registre o preço da execução.</p>
      </div>
      <div class="grid-2">
        <section class="card">
          <h3>Nova associação</h3>
          <form id="form-associacao">
            <div class="field">
              <label for="a-id-manutencao">ID da manutenção</label>
              <input id="a-id-manutencao" name="id_manutencao" type="number" min="1" required>
            </div>
            <div class="field">
              <label for="a-id-servico">ID do serviço</label>
              <input id="a-id-servico" name="id_servico" type="number" min="1" required>
            </div>
            <div class="field">
              <label for="a-preco">Preço da associação</label>
              <input id="a-preco" name="preco" type="number" step="0.01" min="0" required>
            </div>
            <div class="form-actions">
              <button type="submit">Salvar</button>
            </div>
          </form>
          <h3>Filtrar lista</h3>
          <form id="form-filtro-associacao">
            <div class="field">
              <label for="f-id-manutencao">ID da manutenção (opcional)</label>
              <input id="f-id-manutencao" name="id_manutencao" type="number" min="1">
            </div>
            <div class="field">
              <label for="f-id-servico">ID do serviço (opcional)</label>
              <input id="f-id-servico" name="id_servico" type="number" min="1">
            </div>
            <div class="form-actions">
              <button type="submit" class="secondary">Aplicar filtro</button>
              <button type="button" data-action="clear-filtro" class="secondary">Limpar filtro</button>
            </div>
          </form>
        </section>
        <section class="card">
          <h3>Lista de associações</h3>
          ${tableContent}
        </section>
      </div>
    `;
  }

  async function render(container, filters) {
    container.innerHTML = '<div class="empty-state">Carregando associações...</div>';
    const result = await api.getAssociacoes(filters || {});

    if (!result.ok) {
      utils.showFeedback("error", result.error);
      container.innerHTML = template([]);
      bindEvents(container, filters || {});
      return;
    }

    const items = result.data.manutencao_servicos || [];
    container.innerHTML = template(items);

    if (filters) {
      const idManutencao = container.querySelector("#f-id-manutencao");
      const idServico = container.querySelector("#f-id-servico");
      if (idManutencao) {
        idManutencao.value = filters.id_manutencao || "";
      }
      if (idServico) {
        idServico.value = filters.id_servico || "";
      }
    }

    bindEvents(container, filters || {});
  }

  function bindEvents(container, filters) {
    const formCriacao = container.querySelector("#form-associacao");
    if (formCriacao) {
      formCriacao.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(formCriacao);

        const ids = {
          id_manutencao: Number(formData.get("id_manutencao") || 0),
          id_servico: Number(formData.get("id_servico") || 0),
        };

        const payload = {
          preco: Number(formData.get("preco") || 0),
        };

        const result = await api.createAssociacao(ids, payload);
        if (!result.ok) {
          utils.showFeedback("error", result.error);
          return;
        }

        utils.showFeedback("success", "Associação criada com sucesso.");
        formCriacao.reset();
        await render(container, filters);
      });
    }

    const formFiltro = container.querySelector("#form-filtro-associacao");
    if (formFiltro) {
      formFiltro.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(formFiltro);

        const nextFilters = {
          id_manutencao: formData.get("id_manutencao") || "",
          id_servico: formData.get("id_servico") || "",
        };

        await render(container, nextFilters);
      });
    }

    const clearButton = container.querySelector('[data-action="clear-filtro"]');
    if (clearButton) {
      clearButton.addEventListener("click", async () => {
        await render(container, {});
      });
    }

    container.querySelectorAll('[data-action="delete-associacao"]').forEach((button) => {
      button.addEventListener("click", async () => {
        const idManutencao = button.getAttribute("data-id-manutencao");
        const idServico = button.getAttribute("data-id-servico");

        const proceed = window.confirm(
          `Deseja excluir a associação manutenção #${idManutencao} com serviço #${idServico}?`
        );
        if (!proceed) {
          return;
        }

        const result = await api.deleteAssociacao({
          id_manutencao: idManutencao,
          id_servico: idServico,
        });

        if (!result.ok) {
          utils.showFeedback("error", result.error);
          return;
        }

        utils.showFeedback("success", "Associação excluída com sucesso.");
        await render(container, filters);
      });
    });
  }

  window.ManutencaoFront.views = window.ManutencaoFront.views || {};
  window.ManutencaoFront.views.associacoes = { render };
})();
