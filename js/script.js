// ==================== LÓGICA DE DADOS (API IBGE) ====================
async function carregarEstados() {
  try {
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
    if (!response.ok) throw new Error('Falha ao buscar estados');
    const estados = await response.json();

    const selects = ['form:ufIdNatur', 'form:ufRG', 'form:ufEnd'];
    
    selects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if(!select) return;
      select.innerHTML = '<option value="-1">-- SELECIONE --</option>';
      estados.forEach(est => {
        select.innerHTML += `<option value="${est.sigla}">${est.sigla} - ${est.nome}</option>`;
      });
    });

    const selectUfEnd = document.getElementById('form:ufEnd');
    if (selectUfEnd) {
      selectUfEnd.value = "PA";
      atualizarMunicipios('form:ufEnd', 'listaEndMunicipio');
    }

  } catch (e) {
    console.error('Erro ao carregar UFs do IBGE:', e);
  }
}

async function atualizarMunicipios(ufSelectId, datalistId) {
  const uf = document.getElementById(ufSelectId).value;
  const datalist = document.getElementById(datalistId);
  
  if (!datalist) return;
  datalist.innerHTML = '';

  if (uf === '-1' || uf === '') return;

  try {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
    if (!response.ok) throw new Error('Falha ao buscar municípios');
    const municipios = await response.json();

    municipios.forEach(mun => {
      datalist.innerHTML += `<option value="${mun.nome}">`;
    });
  } catch (e) {
    console.error('Erro ao carregar municípios:', e);
  }
}

// ==================== MÁSCARAS ====================
function aplicarMascaraCPF(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 11);
  if (v.length > 9) v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  else if (v.length > 6) v = v.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3');
  else if (v.length > 3) v = v.replace(/^(\d{3})(\d{1,3})$/, '$1.$2');
  input.value = v;
}

function aplicarMascaraData(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 8);
  if (v.length > 4) v = v.replace(/^(\d{2})(\d{2})(\d{1,4})$/, '$1/$2/$3');
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d{1,2})$/, '$1/$2');
  input.value = v;
}

function aplicarMascaraCEP(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 8);
  if (v.length > 5) v = v.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
  input.value = v;
}

function aplicarMascaraTelefoneSIGAA(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 8); 
  if (v.length > 4) v = v.replace(/^(\d{4})(\d{1,4})$/, '$1-$2');
  input.value = v;
}

// ==================== LÓGICA DE FORMULÁRIO ====================
function replicateToSocial() {
  const oficial = document.getElementById('form:nomeOficial');
  const social = document.getElementById('form:nome');
  if (social.dataset.manual !== 'true') social.value = oficial.value;
}

document.getElementById('form:nome').addEventListener('input', function() {
  this.dataset.manual = (this.value !== document.getElementById('form:nomeOficial').value) ? 'true' : 'false';
});

function isFilled(elem) {
  if (!elem) return false;
  const val = elem.value.trim();
  if (val === '' || val === '-1') return false;
  
  if (elem.placeholder && elem.placeholder.includes('000.000.000-00') && val.replace(/\D/g, '').length < 11) return false;
  if (elem.placeholder && elem.placeholder.includes('DD/MM/AAAA') && val.replace(/\D/g, '').length < 8) return false;
  if (elem.placeholder && elem.placeholder.includes('00000-000') && val.replace(/\D/g, '').length < 8) return false;
  if (elem.placeholder && elem.placeholder === '0000-0000' && val.replace(/\D/g, '').length < 8) return false;

  return true;
}

function checkSection(accId) {
  let completo = false;

  if (accId === 'acc1') {
    const cpf = document.getElementById('form:txtCPF');
    const internacional = document.getElementById('form:internacional').checked;
    const nomeOficial = document.getElementById('form:nomeOficial');
    const nomeSocial = document.getElementById('form:nome');
    const nascimento = document.getElementById('form:Nascimento');
    completo = (internacional || isFilled(cpf)) && isFilled(nomeOficial) && isFilled(nomeSocial) && isFilled(nascimento);
    updateSectionStatus('acc1', 'status1', completo);
    if (completo) forceUnlock('acc2');
  } 
  else if (accId === 'acc2') {
    const mae = document.getElementById('form:mae');
    completo = isFilled(mae);
    updateSectionStatus('acc2', 'status2', completo);
    if (completo) forceUnlock('acc3');
  }
  else if (accId === 'acc4') {
    const rg = document.getElementById('form:rg');
    const orgao = document.getElementById('form:orgaoExpedicao');
    const ufRG = document.getElementById('form:ufRG');
    const dataExp = document.getElementById('form:Expedicao');
    const pais = document.getElementById('form:naturPais');
    const ufNat = document.getElementById('form:ufIdNatur');
    const municipio = document.getElementById('form:naturMunicipio');
    const nac = document.getElementById('form:paisNacionalidade');
    
    completo = isFilled(rg) && isFilled(orgao) && isFilled(ufRG) && isFilled(dataExp) &&
               isFilled(pais) && isFilled(ufNat) && isFilled(municipio) && isFilled(nac);
    updateSectionStatus('acc4', 'status4', completo);
    if (completo) forceUnlock('acc5');
  }
  else if (accId === 'acc5') {
    const cep = document.getElementById('form:endCEP');
    const logr = document.getElementById('form:logradouro');
    const num = document.getElementById('form:endNumero');
    const bairro = document.getElementById('form:endBairro');
    const uf = document.getElementById('form:ufEnd');
    const mun = document.getElementById('form:endMunicipio');
    const cel = document.getElementById('form:telCelNumero');
    
    completo = isFilled(cep) && isFilled(logr) && isFilled(num) && isFilled(bairro) &&
               isFilled(uf) && isFilled(mun) && isFilled(cel);
    updateSectionStatus('acc5', 'status5', completo);
    if (completo) forceUnlock('acc6');
  }
  else if (accId === 'acc7') {
    const ingresso = document.getElementById('formDiscenteTecnico:formaIngresso');
    const medio = document.querySelector('input[name="form:concluiuMedio"]:checked');
    completo = isFilled(ingresso) && ingresso.value !== "0" && medio !== null;
    updateSectionStatus('acc7', 'status7', completo);
  }
}

function updateSectionStatus(accId, statusId, complete) {
  const statusEl = document.getElementById(statusId);
  if (!statusEl) return;

  if (complete) {
    statusEl.textContent = 'Concluído';
    statusEl.className = 'status complete';
  } else {
    const acc = document.getElementById(accId);
    if (acc.classList.contains('locked')) {
      statusEl.textContent = 'Bloqueado';
      statusEl.className = 'status incomplete';
    } else {
      statusEl.textContent = 'Pendente';
      statusEl.className = 'status incomplete';
    }
  }
  updateProgressDots();
}

function forceUnlock(id) {
  const acc = document.getElementById(id);
  if (acc.classList.contains('locked')) {
    acc.classList.remove('locked');
    const statusId = 'status' + id.replace('acc', '');
    const statusEl = document.getElementById(statusId);
    if (statusEl.textContent === 'Bloqueado') {
      statusEl.textContent = 'Pendente';
      statusEl.className = 'status incomplete';
    }
  }
}

function toggleAccordion(id) {
  const acc = document.getElementById(id);
  if (acc.classList.contains('locked')) return;
  acc.classList.toggle('open');
}

function updateProgressDots() {
  for(let i=1; i<=7; i++) {
    const dot = document.getElementById('dot' + i);
    const statusEl = document.getElementById('status' + i);
    if (statusEl && dot) {
      if (statusEl.textContent === 'Concluído') dot.classList.add('active');
      else dot.classList.remove('active');
    }
  }
}

// ==================== CONFIGURAÇÃO DO CURSO (CADASTRO SEQUENCIAL) ====================
let courseLocked = false;

function saveCourseConfig() {
  const config = {
    curso: document.getElementById('fixedCurso').value,
    curriculo: document.getElementById('fixedCurriculo').value,
    turma: document.getElementById('fixedTurma').value,
    regime: document.getElementById('fixedRegime').value,
    locked: courseLocked
  };
  localStorage.setItem('cursoConfig', JSON.stringify(config));
}

function loadCourseConfig() {
  const saved = localStorage.getItem('cursoConfig');
  if (saved) {
    const config = JSON.parse(saved);
    document.getElementById('fixedCurso').value = config.curso || '';
    document.getElementById('fixedCurriculo').value = config.curriculo || '';
    document.getElementById('fixedTurma').value = config.turma || '';
    document.getElementById('fixedRegime').value = config.regime || '';
    courseLocked = config.locked || false;
    applyLockState();
  } else {
    showInitialModal();
  }
}

function applyLockState() {
  const inputs = ['fixedCurso', 'fixedCurriculo', 'fixedTurma', 'fixedRegime'];
  inputs.forEach(id => {
    const input = document.getElementById(id);
    input.disabled = courseLocked;
  });
  const lockBtn = document.getElementById('lockToggleBtn');
  lockBtn.textContent = courseLocked ? '🔒' : '🔓';
}

function toggleCourseLock() {
  if (!courseLocked) {
    const curso = document.getElementById('fixedCurso').value.trim();
    const curriculo = document.getElementById('fixedCurriculo').value.trim();
    const turma = document.getElementById('fixedTurma').value.trim();
    const regime = document.getElementById('fixedRegime').value.trim();
    if (!curso || !curriculo || !turma || !regime) {
      alert('Preencha todos os campos do curso antes de travar!');
      return;
    }
  }
  courseLocked = !courseLocked;
  applyLockState();
  saveCourseConfig();
}

function showInitialModal() {
  const modal = document.getElementById('initialModal');
  modal.style.display = 'flex';
  document.getElementById('modalCurso').value = '';
  document.getElementById('modalCurriculo').value = '';
  document.getElementById('modalTurma').value = '';
  document.getElementById('modalRegime').value = '';
}

function saveModalAndLock() {
  const curso = document.getElementById('modalCurso').value.trim();
  const curriculo = document.getElementById('modalCurriculo').value.trim();
  const turma = document.getElementById('modalTurma').value.trim();
  const regime = document.getElementById('modalRegime').value.trim();
  if (!curso || !curriculo || !turma || !regime) {
    alert('Preencha todos os campos!');
    return;
  }
  document.getElementById('fixedCurso').value = curso;
  document.getElementById('fixedCurriculo').value = curriculo;
  document.getElementById('fixedTurma').value = turma;
  document.getElementById('fixedRegime').value = regime;
  courseLocked = true;
  applyLockState();
  saveCourseConfig();
  document.getElementById('initialModal').style.display = 'none';
}

// ==================== SALVAMENTO, EXPORTAÇÃO, DASHBOARD ====================
function validateAll() {
  if (!courseLocked) {
    alert('⚠️ Antes de salvar, configure e trave os dados do curso (painel "Cadastro sequencial").');
    return;
  }
  const curso = document.getElementById('fixedCurso').value.trim();
  const curriculo = document.getElementById('fixedCurriculo').value.trim();
  const turma = document.getElementById('fixedTurma').value.trim();
  const regime = document.getElementById('fixedRegime').value.trim();
  if (!curso || !curriculo || !turma || !regime) {
    alert('Preencha todos os campos do curso antes de salvar!');
    return;
  }

  const idsObrigatorios = ['status1', 'status2', 'status4', 'status5', 'status7']; 
  let allValid = true;
  idsObrigatorios.forEach(id => {
    if(document.getElementById(id).textContent !== 'Concluído') allValid = false;
  });

  if (!allValid) {
    alert('⚠️ Preencha todas as seções obrigatórias (Marcadas com *) antes de prosseguir.');
    return;
  }

  const formElements = document.getElementById('mainForm').elements;
  const aluno = {};
  const necessidades = [];

  for (let i = 0; i < formElements.length; i++) {
    const el = formElements[i];
    if (el.type === 'button' || el.type === 'submit') continue;
    if (el.type === 'checkbox') {
      if (el.checked) {
        if (el.id === 'form:internacional' || el.id === 'form:deficienciaTemporaria') {
           aluno[el.id] = "SIM";
        } else if (el.value && el.value !== 'on') {
           necessidades.push(el.value);
        }
      } else {
        if (el.id === 'form:internacional' || el.id === 'form:deficienciaTemporaria') {
           aluno[el.id] = "NÃO";
        }
      }
    } 
    else if (el.type === 'radio') {
      if (el.checked) {
        aluno[el.name] = el.value;
      }
    }
    else {
      const chave = el.id || el.name;
      if (chave) aluno[chave] = el.value;
    }
  }

  aluno['necessidadesEspeciais'] = necessidades.join(', ');
  aluno['dataCadastro'] = new Date().toLocaleString('pt-BR');
  aluno['cursoFixo'] = curso;
  aluno['curriculoFixo'] = curriculo;
  aluno['turmaFixa'] = turma;
  aluno['regimeFixo'] = regime;

  let cadastros = JSON.parse(localStorage.getItem('alunosSIGAA')) || [];
  cadastros.push(aluno);
  localStorage.setItem('alunosSIGAA', JSON.stringify(cadastros));

  alert(`✅ Cadastro salvo!\nTotal de alunos na fila: ${cadastros.length}`);
  document.getElementById('mainForm').reset();
  window.location.reload(); 
}

function exportarParaJSON() {
  const cadastros = localStorage.getItem('alunosSIGAA'); 
  const config = localStorage.getItem('cursoConfig');
  
  if (!cadastros || cadastros === '[]') {
    alert("Não há nenhum aluno cadastrado para exportar.");
    return;
  }

  let alunosArray = JSON.parse(cadastros);
  let cursoConfig = config ? JSON.parse(config) : null;
  
  const exportObj = {
    cursoConfig: cursoConfig,
    alunos: alunosArray,
    dataExportacao: new Date().toLocaleString('pt-BR')
  };

  const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "cadastros_com_curso.json");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function abrirDashboard() {
  document.getElementById('dashboardModal').style.display = 'flex';
  renderizarTabela();
}

function fecharDashboard() {
  document.getElementById('dashboardModal').style.display = 'none';
}

function renderizarTabela() {
  const cadastros = JSON.parse(localStorage.getItem('alunosSIGAA')) || [];
  const tbody = document.getElementById('tabelaAlunosBody');
  tbody.innerHTML = '';

  if (cadastros.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b;">Nenhum aluno cadastrado no momento.</td></tr>';
    return;
  }

  cadastros.forEach((aluno, index) => {
    const cpf = aluno['form:txtCPF'] || 'N/A';
    const nome = aluno['form:nomeOficial'] || 'N/A';
    const data = aluno['dataCadastro'] || 'N/A';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data}</td>
      <td>${cpf}</td>
      <td>${nome}</td>
      <td>
        <button class="btn-danger" onclick="excluirAluno(${index})">🗑️ Excluir</button>
       </td>
    `;
    tbody.appendChild(tr);
  });
}

function excluirAluno(index) {
  if (confirm('Tem certeza que deseja excluir este cadastro?')) {
    let cadastros = JSON.parse(localStorage.getItem('alunosSIGAA')) || [];
    cadastros.splice(index, 1);
    localStorage.setItem('alunosSIGAA', JSON.stringify(cadastros));
    renderizarTabela(); 
  }
}

// ==================== MODO DESENVOLVEDOR (MOCK DATA) ====================
function preencherDadosFicticios() {
  document.getElementById('form:txtCPF').value = '123.456.789-00';
  document.getElementById('form:nomeOficial').value = 'ALUNO DE TESTE DA SILVA';
  document.getElementById('form:nome').value = 'ALUNO DE TESTE DA SILVA';
  document.getElementById('form:email').value = 'teste@sigaa.edu.br';
  document.getElementById('form:Nascimento').value = '15/05/1995';
  document.getElementById('form:mae').value = 'MÃE DO ALUNO DE TESTE';
  document.getElementById('form:rg').value = '1234567';
  document.getElementById('form:orgaoExpedicao').value = 'SSP';
  document.getElementById('form:Expedicao').value = '10/10/2010';
  document.getElementById('form:endCEP').value = '68000-000';
  document.getElementById('form:logradouro').value = 'RUA DOS TESTES, AV. PRINCIPAL';
  document.getElementById('form:endNumero').value = '123';
  document.getElementById('form:endBairro').value = 'CENTRO';
  document.getElementById('form:telCelNumero').value = '9999-8888';
  document.getElementById('form:estadoCivil').value = "1"; 
  document.getElementById('form:raca').value = "2"; 
  document.getElementById('form:naturPais').value = "31"; 
  document.getElementById('form:ufRG').value = "PA"; 
  document.getElementById('form:ufIdNatur').value = "PA";
  document.getElementById('form:naturMunicipio').value = "BELÉM";
  document.getElementById('form:ufEnd').value = "PA";
  document.getElementById('form:endMunicipio').value = "SANTARÉM";
  document.querySelector('input[name="form:sexo"][value="M"]').checked = true;
  document.querySelector('input[name="form:zonaResidencia"][value="urbana"]').checked = true;
  document.querySelector('input[value="Altas habilidades/superdotação"]').checked = true;
  document.getElementById('form:deficienciaTemporaria').checked = true;
  
  if (!courseLocked) {
    document.getElementById('fixedCurso').value = 'TÉCNICO EM INFORMÁTICA';
    document.getElementById('fixedCurriculo').value = 'INFO-2026';
    document.getElementById('fixedTurma').value = '2026.1';
    document.getElementById('fixedRegime').value = 'SEMESTRAL';
    courseLocked = true;
    applyLockState();
    saveCourseConfig();
  }

  const secoes = ['acc1', 'acc2', 'acc3', 'acc4', 'acc5', 'acc6', 'acc7'];
  secoes.forEach(secao => {
    checkSection(secao);
  });

  console.log("✅ Dados fictícios injetados e curso travado!");
}

// ==================== INICIALIZAÇÃO ====================
window.onload = () => {
  carregarEstados();
  loadCourseConfig();
  checkSection('acc1');
  for(let i = 2; i <= 7; i++) {
    forceUnlock('acc' + i);
  }
};