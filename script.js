document.addEventListener('DOMContentLoaded', () => {
  carregarEstados();
  carregarAnos();
  configurarEventos();
});

function carregarEstados() {
  fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
    .then(response => response.json())
    .then(estados => {
      const estadoSelect = document.getElementById('estadoSelect');
      estados.sort((a, b) => a.nome.localeCompare(b.nome));
      estados.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado.id;
        option.textContent = estado.nome;
        estadoSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Erro ao carregar estados:', error));
}

function carregarCidades(estadoId) {
  fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`)
    .then(response => response.json())
    .then(cidades => {
      const cidadeSelect = document.getElementById('cidadeSelect');
      cidadeSelect.innerHTML = '<option value="">Selecione</option>';
      cidades.sort((a, b) => a.nome.localeCompare(b.nome));
      cidades.forEach(cidade => {
        const option = document.createElement('option');
        option.value = cidade.id;
        option.textContent = cidade.nome;
        cidadeSelect.appendChild(option);
      });
      cidadeSelect.disabled = false;
    })
    .catch(error => console.error('Erro ao carregar cidades:', error));
}

function carregarAnos() {
  const anoSelect = document.getElementById('anoSelect');
  const anoAtual = new Date().getFullYear();
  for (let ano = anoAtual; ano >= 2000; ano--) {
    const option = document.createElement('option');
    option.value = ano;
    option.textContent = ano;
    anoSelect.appendChild(option);
  }
}

function configurarEventos() {
  document.getElementById('estadoSelect').addEventListener('change', (event) => {
    const estadoId = event.target.value;
    if (estadoId) {
      carregarCidades(estadoId);
    } else {
      const cidadeSelect = document.getElementById('cidadeSelect');
      cidadeSelect.innerHTML = '<option value="">Selecione</option>';
      cidadeSelect.disabled = true;
    }
  });

  document.getElementById('cidadeSelect').addEventListener('change', buscarIndicadores);
  document.getElementById('anoSelect').addEventListener('change', buscarIndicadores);

  document.querySelectorAll('input[name="indicador"]').forEach(checkbox => {
    checkbox.addEventListener('change', buscarIndicadores);
  });
}

function buscarIndicadores() {
  const cidadeId = document.getElementById('cidadeSelect').value;
  const ano = document.getElementById('anoSelect').value;
  const indicadoresSelecionados = Array.from(document.querySelectorAll('input[name="indicador"]:checked')).map(cb => cb.value);

  if (!cidadeId || !ano || indicadoresSelecionados.length === 0) {
    return;
  }

  indicadoresSelecionados.forEach(indicador => {
    if (indicador === 'populacao') {
      buscarPopulacao(cidadeId);
    } else if (indicador === 'densidade') {
      buscarDensidade(cidadeId);
    } else if (indicador === 'escolarizacao') {
      buscarEscolarizacao(cidadeId);
    } else if (indicador === 'salario') {
      buscarSalario(cidadeId);
    } else if (indicador === 'pib') {
      buscarPIB(cidadeId);
    }
  });
}

function buscarPopulacao(cidadeId) {
  fetch(`https://servicodados.ibge.gov.br/api/v1/projecoes/populacao/${cidadeId}`)
    .then(response => response.json())
    .then(data => {
      const populacao = data.projecao.populacao.toLocaleString('pt-BR');
      document.getElementById('populacao').textContent = populacao;
    })
    .catch(() => {
      document.getElementById('populacao').textContent = 'Dados não disponíveis';
    });
}

function buscarDensidade(cidadeId) {
  document.getElementById('densidade').textContent = 'Dados não disponíveis';
}

function buscarEscolarizacao(cidadeId) {
  fetch(`https://servicodados.ibge.gov.br/api/v1/indicadores/60025/municipios/${cidadeId}`)
    .then(response => response.json())
    .then(data => {
      const valor = data[0]?.res[0]?.res?.toFixed(2) || 'Dados não disponíveis';
      document.getElementById('escolarizacao').textContent = valor + '%';
    })
    .catch(() => {
      document.getElementById('escolarizacao').textContent = 'Dados não disponíveis';
    });
}

function buscarSalario(cidadeId) {
  fetch(`https://servicodados.ibge.gov.br/api/v1/indicadores/29171/municipios/${cidadeId}`)
    .then(response => response.json())
    .then(data => {
      const valor = data[0]?.res[0]?.res?.toFixed(2) || 'Dados não disponíveis';
      document.getElementById('salario').textContent = 'R$ ' + valor;
    })
    .catch(() => {
      document.getElementById('salario').textContent = 'Dados não disponíveis';
    });
}

function buscarPIB(cidadeId) {
  fetch(`https://servicodados.ibge.gov.br/api/v1/indicadores/5938/municipios/${cidadeId}`)
    .then(response => response.json())
    .then(data => {
      const valor = data[0]?.res[0]?.res?.toFixed(2) || 'Dados não disponíveis';
      document.getElementById('pib').textContent = 'R$ ' + valor;
    })
    .catch(() => {
      document.getElementById('pib').textContent = 'Dados não disponíveis';
    });
}
