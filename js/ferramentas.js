// Variável global para armazenar o JSON lido
let dadosCarregados = [];

// ==================== MÓDULO 1: JSON -> TABELA ====================
function carregarArquivoJSON() {
  const fileInput = document.getElementById('jsonFileInput');
  if (fileInput.files.length === 0) {
    alert("Por favor, selecione um arquivo .json primeiro.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    try {
      dadosCarregados = JSON.parse(event.target.result);
      if (!Array.isArray(dadosCarregados)) {
        // Se o JSON for um único objeto, transforma em array para virar tabela
        dadosCarregados = [dadosCarregados];
      }
      renderizarTabela(dadosCarregados);
    } catch (error) {
      alert("Erro ao ler o arquivo JSON. O formato parece inválido.");
      console.error(error);
    }
  };

  reader.readAsText(file);
}

function renderizarTabela(dados) {
  const tHead = document.getElementById('jsonTableHead');
  const tBody = document.getElementById('jsonTableBody');
  const btnCopiar = document.getElementById('btnCopiarTabela');

  tHead.innerHTML = '';
  tBody.innerHTML = '';

  if (dados.length === 0) {
    tBody.innerHTML = '<tr><td>O JSON está vazio.</td></tr>';
    btnCopiar.style.display = 'none';
    return;
  }

  // Extrai os cabeçalhos (pegando as chaves do primeiro objeto)
  const colunas = Object.keys(dados[0]);

  // Monta o Header
  let trHead = '<tr>';
  colunas.forEach(col => {
    trHead += `<th>${col}</th>`;
  });
  trHead += '</tr>';
  tHead.innerHTML = trHead;

  // Monta o Body
  dados.forEach(linha => {
    let tr = '<tr>';
    colunas.forEach(col => {
      let valor = linha[col] !== undefined && linha[col] !== null ? linha[col] : '';
      tr += `<td>${valor}</td>`;
    });
    tr += '</tr>';
    tBody.innerHTML += tr;
  });

  // Mostra o botão de copiar
  btnCopiar.style.display = 'inline-block';
}

function copiarTabelaParaExcel() {
  if (dadosCarregados.length === 0) return;

  const colunas = Object.keys(dadosCarregados[0]);
  
  // O segredo do Excel: colunas separadas por \t (TAB) e linhas por \n
  let textoParaCopiar = colunas.join('\t') + '\n';

  dadosCarregados.forEach(linha => {
    const valoresLinha = colunas.map(col => {
      let valor = linha[col] !== undefined && linha[col] !== null ? linha[col] : '';
      // Limpa quebras de linha dentro do valor para não quebrar a linha do Excel
      return String(valor).replace(/(\r\n|\n|\r|\t)/gm, " ");
    });
    textoParaCopiar += valoresLinha.join('\t') + '\n';
  });

  navigator.clipboard.writeText(textoParaCopiar).then(() => {
    alert("✅ Tabela copiada! Agora basta ir ao Excel e colar (Ctrl+V).");
  }).catch(err => {
    console.error('Erro ao copiar', err);
    alert("Erro ao tentar copiar.");
  });
}

// ==================== MÓDULO 2: TABELA -> JSON ====================
function converterParaJSON() {
  const tsv = document.getElementById('tsvInput').value;
  
  if (tsv.trim() === '') {
    alert("Cole os dados da tabela primeiro.");
    return;
  }

  // Divide o texto por linhas (enters)
  const linhas = tsv.split('\n').filter(linha => linha.trim() !== '');
  
  if (linhas.length < 2) {
    alert("A tabela precisa ter pelo menos um cabeçalho e uma linha de dados.");
    return;
  }

  // A primeira linha é o cabeçalho
  const cabecalho = linhas[0].split('\t').map(h => h.trim());
  const resultadoJSON = [];

  // Percorre as linhas de dados
  for (let i = 1; i < linhas.length; i++) {
    const valores = linhas[i].split('\t');
    const objeto = {};

    cabecalho.forEach((coluna, index) => {
      // Associa a chave da coluna ao valor correspondente
      objeto[coluna] = valores[index] ? valores[index].trim() : '';
    });

    resultadoJSON.push(objeto);
  }

  // Exibe o JSON formatado bonitinho com 2 espaços de indentação
  document.getElementById('jsonOutput').value = JSON.stringify(resultadoJSON, null, 2);
}

function copiarJSON() {
  const jsonOut = document.getElementById('jsonOutput');
  if (jsonOut.value.trim() === '') return;
  
  jsonOut.select();
  navigator.clipboard.writeText(jsonOut.value).then(() => {
    alert("✅ Código JSON copiado!");
  });
}

function baixarJSON() {
  const jsonTexto = document.getElementById('jsonOutput').value;
  
  // Verifica se a caixa de texto está vazia
  if (jsonTexto.trim() === '') {
    alert("⚠️ Não há nenhum JSON gerado para baixar. Converta uma tabela primeiro.");
    return;
  }

  // 1. Empacota o texto da tela em um arquivo tipo JSON
  const blob = new Blob([jsonTexto], { type: 'application/json;charset=utf-8;' });
  
  // 2. Cria o link invisível para download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  // Define o nome padrão do arquivo que será baixado
  link.setAttribute("download", "tabela_convertida_sigaa.json"); 
  link.style.visibility = 'hidden';
  
  // 3. Adiciona na tela, clica automaticamente e remove em seguida
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}