(function () {
  window.ManutencaoFront = window.ManutencaoFront || {};

  const { api, utils } = window.ManutencaoFront;

  function template(items) {
    const rows = (items || [])
      .map((item) => {
        return `
          <tr>
            <td>${utils.escapeHtml(item.id)}</td>
            <td>${utils.escapeHtml(item.descricao)}</td>
            <td>${utils.escapeHtml(item.quilometragem)}</td>
            <td>${utils.escapeHtml(item.data_prevista || "-")}</td>
            <td>${utils.escapeHtml(item.data_realizada || "-")}</td>
            <td class="actions">
              <button type="button" class="danger" data-action="delete-manutencao" data-id="${utils.escapeHtml(item.id)}">Excluir</button>
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
              <th>Descrição</th>
              <th>Quilometragem</th>
              <th>Data Prevista</th>
              <th>Data Realizada</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `
      : '<div class="empty-state">Nenhuma manutenção encontrada.</div>';

    return `
      <div class="view-head">
        <h2>Manutenções</h2>
        <p>Cadastre e gerencie as manutenções do veículo.</p>
      </div>
      <div class="grid-2">
        <section class="card">
          <h3>Nova manutenção</h3>
          <form id="form-manutencao">
            <div class="field">
              <label for="m-desc">Descrição</label>
              <input id="m-desc" name="descricao" required>
            </div>
            <div class="field">
              <label for="m-km">Quilometragem</label>
              <input id="m-km" name="quilometragem" type="number" min="0" required>
            </div>
            <div class="field">
              <label for="m-prev">Data prevista</label>
              <input id="m-prev" name="data_prevista" type="date">
            </div>
            <div class="field">
              <label for="m-real">Data realizada</label>
              <input id="m-real" name="data_realizada" type="date">
            </div>
            <div class="form-actions">
              <button type="submit">Salvar</button>
              <button type="button" class="secondary" data-action="refresh-manutencoes">Atualizar lista</button>
            </div>
          </form>
        </section>
        <section class="card">
          <h3>Lista de manutenções</h3>
          ${tableContent}
        </section>
      </div>
    `;
  }

  async function render(container) {
    container.innerHTML = '<div class="empty-state">Carregando manutenções...</div>';
    const result = await api.getManutencoes();

    if (!result.ok) {
      utils.showFeedback("error", result.error);
      container.innerHTML = template([]);
      bindEvents(container);
      return;
    }

    const items = result.data.manutencoes || [];
    container.innerHTML = template(items);
    bindEvents(container);
  }

  function bindEvents(container) {
    const form = container.querySelector("#form-manutencao");
    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const dataPrevista = (formData.get("data_prevista") || "").trim();
        const dataRealizada = (formData.get("data_realizada") || "").trim();

        if (!dataPrevista && !dataRealizada) {
          utils.showFeedback("error", "Informe data prevista ou data realizada.");
          return;
        }

        const payload = {
          descricao: (formData.get("descricao") || "").trim(),
          quilometragem: Number(formData.get("quilometragem") || 0),
          data_prevista: dataPrevista || null,
          data_realizada: dataRealizada || null,
        };

        const result = await api.createManutencao(payload);
        if (!result.ok) {
          utils.showFeedback("error", result.error);
          return;
        }

        utils.showFeedback("success", "Manutenção criada com sucesso.");
        form.reset();
        await render(container);
      });
    }

    container.querySelectorAll('[data-action="delete-manutencao"]').forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-id");
        const proceed = window.confirm(`Deseja excluir a manutenção #${id}?`);
        if (!proceed) {
          return;
        }

        const result = await api.deleteManutencao(id);
        if (!result.ok) {
          utils.showFeedback("error", result.error);
          return;
        }

        utils.showFeedback("success", "Manutenção excluída com sucesso.");
        await render(container);
      });
    });

    const refreshButton = container.querySelector('[data-action="refresh-manutencoes"]');
    if (refreshButton) {
      refreshButton.addEventListener("click", async () => {
        await render(container);
      });
    }
  }

  window.ManutencaoFront.views = window.ManutencaoFront.views || {};
  window.ManutencaoFront.views.manutencoes = { render };
})();
