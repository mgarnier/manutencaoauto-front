(function () {
  window.ManutencaoFront = window.ManutencaoFront || {};

  const { api, utils } = window.ManutencaoFront;

  const state = {
    manutencoes: [],
    servicos: [],
    associacoes: [],
    selectedManutencaoId: null,
    pendingKeys: new Set(),
  };

  function associacaoKey(idManutencao, idServico) {
    return `${idManutencao}:${idServico}`;
  }

  function isPending(idManutencao, idServico) {
    return state.pendingKeys.has(associacaoKey(idManutencao, idServico));
  }

  function toPriceNumber(value) {
    const normalized = String(value == null ? "" : value).trim().replace(",", ".");
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return null;
    }
    return parsed;
  }

  function toInputPrice(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return "0.00";
    }
    return num.toFixed(2);
  }

  function getServicoById(idServico) {
    return state.servicos.find((item) => Number(item.id) === Number(idServico)) || null;
  }

  function getAssociacao(idManutencao, idServico) {
    return (
      state.associacoes.find(
        (item) =>
          Number(item.id_manutencao) === Number(idManutencao) &&
          Number(item.id_servico) === Number(idServico)
      ) || null
    );
  }

  function upsertAssociacao(item) {
    const index = state.associacoes.findIndex(
      (current) =>
        Number(current.id_manutencao) === Number(item.id_manutencao) &&
        Number(current.id_servico) === Number(item.id_servico)
    );

    if (index >= 0) {
      state.associacoes[index] = item;
      return;
    }

    state.associacoes.push(item);
  }

  function removeAssociacao(idManutencao, idServico) {
    state.associacoes = state.associacoes.filter(
      (item) =>
        !(
          Number(item.id_manutencao) === Number(idManutencao) &&
          Number(item.id_servico) === Number(idServico)
        )
    );
  }

  function getAssociacaoMapByServico(idManutencao) {
    const map = new Map();
    if (!idManutencao) {
      return map;
    }

    state.associacoes.forEach((item) => {
      if (Number(item.id_manutencao) === Number(idManutencao)) {
        map.set(Number(item.id_servico), item);
      }
    });

    return map;
  }

  function template() {
    const selectedId = state.selectedManutencaoId;
    const selectedMap = getAssociacaoMapByServico(selectedId);

    const manutencaoRows = (state.manutencoes || [])
      .map((item) => {
        const id = Number(item.id);
        const isSelected = selectedId === id;
        const rowClass = ["maintenance-row-selectable", isSelected ? "selected-maintenance-row" : ""]
          .filter(Boolean)
          .join(" ");

        return `
          <tr
            class="${rowClass}"
            data-action="select-manutencao-row"
            data-id="${utils.escapeHtml(item.id)}"
            tabindex="0"
            role="button"
            aria-selected="${isSelected ? "true" : "false"}"
            aria-label="Selecionar manutenção ${utils.escapeHtml(item.descricao)}"
          >
            <td>${utils.escapeHtml(item.descricao)}</td>
            <td>${utils.formatDate(item.data_prevista)}</td>
            <td>${utils.formatDate(item.data_realizada)}</td>
          </tr>
        `;
      })
      .join("");

    const servicoRows = (state.servicos || [])
      .map((item) => {
        const idServico = Number(item.id);
        const associacao = selectedMap.get(idServico) || null;
        const isLinked = Boolean(associacao);
        const idManutencao = selectedId || 0;
        const isRowPending = selectedId ? isPending(idManutencao, idServico) : false;
        const canEditPrice = Boolean(selectedId && isLinked && !isRowPending);
        const canToggle = Boolean(selectedId && !isRowPending);
        const rowClasses = [
          canToggle ? "service-row-selectable" : "",
          isLinked ? "linked-service-row" : "",
          isRowPending ? "pending-service-row" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const inputPrice = isLinked ? toInputPrice(associacao.preco) : toInputPrice(item.preco);
        const interactiveAttrs = canToggle
          ? `data-action="toggle-servico-row" data-id-servico="${utils.escapeHtml(idServico)}" tabindex="0" role="checkbox" aria-checked="${isLinked ? "true" : "false"}" aria-label="${isLinked ? "Desvincular" : "Vincular"} serviço ${utils.escapeHtml(item.nome)}"`
          : "";

        return `
          <tr class="${rowClasses}" ${interactiveAttrs}>
            <td>${utils.escapeHtml(item.nome)}</td>
            <td>${utils.escapeHtml(item.frequencia_km)}</td>
            <td>${utils.formatCurrency(item.preco)}</td>
            <td>
              <input
                type="number"
                class="associacao-price-input"
                data-action="edit-preco"
                data-id-servico="${utils.escapeHtml(idServico)}"
                data-last-value="${utils.escapeHtml(inputPrice)}"
                value="${utils.escapeHtml(inputPrice)}"
                step="0.01"
                min="0"
                ${canEditPrice ? "" : "disabled"}
              >
            </td>
          </tr>
        `;
      })
      .join("");

    const manutencaoTable = manutencaoRows
      ? `
      <div class="table-wrap">
        <table class="maintenance-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Data prevista</th>
              <th>Data realizada</th>
            </tr>
          </thead>
          <tbody>${manutencaoRows}</tbody>
        </table>
      </div>
    `
      : '<div class="empty-state">Nenhuma manutenção encontrada.</div>';

    const servicoTable = servicoRows
      ? `
      <div class="table-wrap">
        <table class="services-table">
          <thead>
            <tr>
              <th>Serviço</th>
              <th>Frequência (km)</th>
              <th>Preço de tabela</th>
              <th>Preço praticado</th>
            </tr>
          </thead>
          <tbody>${servicoRows}</tbody>
        </table>
      </div>
    `
      : '<div class="empty-state">Nenhum serviço encontrado.</div>';

    return `
      <div class="view-head">
        <h2>Serviços selecionados</h2>
        <p>Selecione uma manutenção e vincule/desvincule serviços.</p>
      </div>
      <div class="form-actions selected-services-actions">
        <button type="button" class="secondary" data-action="refresh-screen">Atualizar dados</button>
      </div>
      <div class="selected-services-layout">
        <section class="card">
          <h3>Manutenções</h3>
          ${manutencaoTable}
        </section>
        <section class="card">
          <h3>Serviços</h3>
          ${selectedId ? "" : '<div class="empty-state">Selecione uma manutenção para habilitar marcação e edição de preço.</div>'}
          ${servicoTable}
        </section>
      </div>
    `;
  }

  function bindEvents(container) {
    container.querySelectorAll('[data-action="select-manutencao-row"]').forEach((row) => {
      const selectManutencao = () => {
        const id = Number(row.getAttribute("data-id") || 0);
        if (!id || id === state.selectedManutencaoId) {
          return;
        }

        state.selectedManutencaoId = id;
        container.innerHTML = template();
        bindEvents(container);
      };

      row.addEventListener("click", () => {
        selectManutencao();
      });

      row.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        selectManutencao();
      });
    });

    const refreshButton = container.querySelector('[data-action="refresh-screen"]');
    if (refreshButton) {
      refreshButton.addEventListener("click", async () => {
        await render(container);
      });
    }

    container.querySelectorAll('[data-action="toggle-servico-row"]').forEach((row) => {
      const toggleServico = async () => {
        const idManutencao = state.selectedManutencaoId;
        const idServico = Number(row.getAttribute("data-id-servico") || 0);
        if (!idManutencao || !idServico) {
          return;
        }

        const isLinked = Boolean(getAssociacao(idManutencao, idServico));
        if (isLinked) {
          await desvincularServico(container, idManutencao, idServico);
          return;
        }

        await vincularServico(container, idManutencao, idServico);
      };

      row.addEventListener("click", (event) => {
        if (event.target.closest('[data-action="edit-preco"]')) {
          return;
        }
        toggleServico();
      });

      row.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }
        event.preventDefault();
        toggleServico();
      });
    });

    container.querySelectorAll('[data-action="edit-preco"]').forEach((input) => {
      input.addEventListener("keydown", async (event) => {
        if (event.key !== "Enter") {
          return;
        }

        event.preventDefault();
        await atualizarPrecoViaSubstituicao(container, input);
      });

      input.addEventListener("blur", async () => {
        await atualizarPrecoViaSubstituicao(container, input);
      });
    });
  }

  async function vincularServico(container, idManutencao, idServico) {
    const key = associacaoKey(idManutencao, idServico);
    if (state.pendingKeys.has(key)) {
      return;
    }

    const servico = getServicoById(idServico);
    if (!servico) {
      utils.showFeedback("error", "Serviço não encontrado para associação.");
      return;
    }

    const precoInicial = Number(servico.preco);
    state.pendingKeys.add(key);
    container.innerHTML = template();
    bindEvents(container);

    const result = await api.createAssociacao(
      {
        id_manutencao: idManutencao,
        id_servico: idServico,
      },
      {
        preco: precoInicial,
      }
    );

    if (!result.ok) {
      utils.showFeedback("error", result.error);
      state.pendingKeys.delete(key);
      container.innerHTML = template();
      bindEvents(container);
      return;
    }

    upsertAssociacao(result.data);
    utils.showFeedback("success", "Serviço vinculado com sucesso.");

    state.pendingKeys.delete(key);
    container.innerHTML = template();
    bindEvents(container);
  }

  async function desvincularServico(container, idManutencao, idServico) {
    const key = associacaoKey(idManutencao, idServico);
    if (state.pendingKeys.has(key)) {
      return;
    }

    state.pendingKeys.add(key);
    container.innerHTML = template();
    bindEvents(container);

    const result = await api.deleteAssociacao({
      id_manutencao: idManutencao,
      id_servico: idServico,
    });

    if (!result.ok) {
      utils.showFeedback("error", result.error);
      state.pendingKeys.delete(key);
      container.innerHTML = template();
      bindEvents(container);
      return;
    }

    removeAssociacao(idManutencao, idServico);
    utils.showFeedback("success", "Serviço desvinculado com sucesso.");

    state.pendingKeys.delete(key);
    container.innerHTML = template();
    bindEvents(container);
  }

  async function atualizarPrecoViaSubstituicao(container, input) {
    const idManutencao = state.selectedManutencaoId;
    const idServico = Number(input.getAttribute("data-id-servico") || 0);
    if (!idManutencao || !idServico) {
      return;
    }

    const key = associacaoKey(idManutencao, idServico);
    if (state.pendingKeys.has(key)) {
      return;
    }

    const currentAssociacao = getAssociacao(idManutencao, idServico);
    if (!currentAssociacao) {
      return;
    }

    const oldPrice = Number(currentAssociacao.preco);
    const lastValue = toPriceNumber(input.getAttribute("data-last-value") || "");
    const newPrice = toPriceNumber(input.value);

    if (newPrice == null) {
      utils.showFeedback("error", "Informe um preço válido maior ou igual a zero.");
      container.innerHTML = template();
      bindEvents(container);
      return;
    }

    const oldRounded = Number(oldPrice.toFixed(2));
    const newRounded = Number(newPrice.toFixed(2));
    const lastRounded = lastValue == null ? oldRounded : Number(lastValue.toFixed(2));
    if (newRounded === lastRounded || newRounded === oldRounded) {
      input.setAttribute("data-last-value", toInputPrice(newRounded));
      return;
    }

    state.pendingKeys.add(key);
    container.innerHTML = template();
    bindEvents(container);

    const deleteResult = await api.deleteAssociacao({
      id_manutencao: idManutencao,
      id_servico: idServico,
    });

    if (!deleteResult.ok) {
      utils.showFeedback("error", deleteResult.error);
      state.pendingKeys.delete(key);
      container.innerHTML = template();
      bindEvents(container);
      return;
    }

    removeAssociacao(idManutencao, idServico);

    const createResult = await api.createAssociacao(
      {
        id_manutencao: idManutencao,
        id_servico: idServico,
      },
      {
        preco: newRounded,
      }
    );

    if (createResult.ok) {
      upsertAssociacao(createResult.data);
      utils.showFeedback("success", "Preço da associação atualizado com sucesso.");
      state.pendingKeys.delete(key);
      container.innerHTML = template();
      bindEvents(container);
      return;
    }

    const restoreResult = await api.createAssociacao(
      {
        id_manutencao: idManutencao,
        id_servico: idServico,
      },
      {
        preco: oldRounded,
      }
    );

    if (restoreResult.ok) {
      upsertAssociacao(restoreResult.data);
      utils.showFeedback(
        "error",
        "Não foi possível salvar o novo preço. O preço anterior da associação foi restaurado."
      );
      state.pendingKeys.delete(key);
      container.innerHTML = template();
      bindEvents(container);
      return;
    }

    utils.showFeedback(
      "error",
      "Falha ao atualizar preço e ao restaurar associação. Recarregando dados para evitar inconsistência."
    );
    state.pendingKeys.delete(key);
    await render(container);
  }

  async function render(container) {
    container.innerHTML = '<div class="empty-state">Carregando dados da seleção de serviços...</div>';

    const [manutencoesResult, servicosResult, associacoesResult] = await Promise.all([
      api.getManutencoes(),
      api.getServicos(),
      api.getAssociacoes({}),
    ]);

    if (!manutencoesResult.ok) {
      utils.showFeedback("error", manutencoesResult.error);
      container.innerHTML = '<div class="empty-state">Falha ao carregar manutenções.</div>';
      return;
    }

    if (!servicosResult.ok) {
      utils.showFeedback("error", servicosResult.error);
      container.innerHTML = '<div class="empty-state">Falha ao carregar serviços.</div>';
      return;
    }

    if (!associacoesResult.ok) {
      utils.showFeedback("error", associacoesResult.error);
      container.innerHTML = '<div class="empty-state">Falha ao carregar associações.</div>';
      return;
    }

    state.manutencoes = manutencoesResult.data.manutencoes || [];
    state.servicos = servicosResult.data.servicos || [];
    state.associacoes = associacoesResult.data.manutencao_servicos || [];

    if (
      state.selectedManutencaoId &&
      !state.manutencoes.some((item) => Number(item.id) === Number(state.selectedManutencaoId))
    ) {
      state.selectedManutencaoId = null;
    }

    if (!state.selectedManutencaoId && state.manutencoes.length > 0) {
      state.selectedManutencaoId = Number(state.manutencoes[0].id);
    }

    container.innerHTML = template();
    bindEvents(container);
  }

  window.ManutencaoFront.views = window.ManutencaoFront.views || {};
  window.ManutencaoFront.views.servicos_selecionados = { render };
})();
