<template>
  <div class="page">
    <AppHeader />

    <main class="agendar-page">

      <!-- Progress Bar -->
      <div class="progress-bar-wrapper">
        <div class="progress-bar-track">
          <div class="progress-bar-fill" :style="{ width: progressWidth }"></div>
        </div>
        <div class="steps-labels">
          <span
            v-for="(s, i) in stepLabels"
            :key="i"
            class="step-label"
            :class="{
              ativo: passoAtual === i,
              completo: passoAtual > i
            }"
            @click="passoAtual > i && irPara(i)"
          >
            <span class="step-dot">{{ passoAtual > i ? '✓' : i + 1 }}</span>
            <span class="step-nome">{{ s }}</span>
          </span>
        </div>
      </div>

      <!-- Painel do wizard -->
      <div class="wizard-container">
        <transition :name="direcaoTransicao" mode="out-in">

          <!-- PASSO 0: Especialidade -->
          <div v-if="passoAtual === 0" key="passo0" class="wizard-panel">
            <div class="panel-header">
              <h2>Qual especialidade você precisa?</h2>
              <p>Selecione a área médica para o seu atendimento</p>
            </div>
            <div class="esp-grid">
              <button
                v-for="e in especialidades"
                :key="e.nome"
                class="esp-card"
                :class="{ ativo: form.especialidade === e.nome }"
                @click="selecionarEspecialidade(e.nome)"
              >
                <span class="esp-emoji">{{ e.icon }}</span>
                <strong>{{ e.nome }}</strong>
                <span class="esp-arrow">→</span>
              </button>
            </div>
          </div>

          <!-- PASSO 1: Médico -->
          <div v-else-if="passoAtual === 1" key="passo1" class="wizard-panel">
            <div class="panel-header">
              <h2>Escolha o médico(a)</h2>
              <p>Profissionais disponíveis em <strong>{{ form.especialidade }}</strong></p>
            </div>
            <div class="medicos-lista">
              <button
                v-for="m in medicosFiltrados"
                :key="m.nome"
                class="medico-card"
                :class="{ ativo: form.medicoNome === m.nome }"
                @click="selecionarMedico(m.nome)"
              >
                <div class="medico-avatar">{{ iniciais(m.nome) }}</div>
                <div class="medico-info">
                  <strong>{{ m.nome }}</strong>
                  <small>{{ m.especialidade }} · {{ m.crm }}</small>
                  <div class="medico-estrelas">⭐⭐⭐⭐⭐ <span>{{ m.nota }}</span></div>
                </div>
                <span class="medico-arrow">→</span>
              </button>
            </div>
            <button class="btn-voltar" @click="voltar">← Voltar</button>
          </div>

          <!-- PASSO 2: Data -->
          <div v-else-if="passoAtual === 2" key="passo2" class="wizard-panel">
            <div class="panel-header">
              <h2>Quando você quer ser atendido?</h2>
              <p>Selecione uma data disponível no calendário</p>
            </div>
            <div class="calendario-wrapper">
              <div class="cal-nav-row">
                <button class="cal-nav-btn" @click="mesAnterior" :disabled="!podeMesAnterior">‹</button>
                <span class="cal-mes-titulo">{{ mesAnoExibido }}</span>
                <button class="cal-nav-btn" @click="proximoMes">›</button>
              </div>
              <div class="cal-semana">
                <span v-for="d in diasSemana" :key="d">{{ d }}</span>
              </div>
              <div class="cal-grid">
                <span
                  v-for="(dia, i) in diasDoMes"
                  :key="i"
                  class="cal-cell"
                  :class="{
                    vazio:       !dia,
                    passado:     dia && ehPassado(dia),
                    fds:         dia && ehFds(dia),
                    hoje:        dia && ehHoje(dia),
                    selecionado: dia && ehSelecionado(dia),
                    disponivel:  dia && !ehPassado(dia) && !ehFds(dia),
                  }"
                  @click="dia && !ehPassado(dia) && !ehFds(dia) && selecionarDia(dia)"
                >
                  <span class="cel-inner">{{ dia || '' }}</span>
                </span>
              </div>
            </div>
            <button class="btn-voltar" @click="voltar">← Voltar</button>
          </div>

          <!-- PASSO 3: Horário -->
          <div v-else-if="passoAtual === 3" key="passo3" class="wizard-panel">
            <div class="panel-header">
              <h2>Qual horário prefere?</h2>
              <p>{{ dataFormatadaBonita }}</p>
            </div>
            <div class="turnos">
              <div class="turno">
                <span class="turno-label">🌅 Manhã</span>
                <div class="horarios-grid">
                  <button
                    v-for="h in horariosManha"
                    :key="h"
                    class="hora-btn"
                    :class="{
                      ativo:       horaSelecionada === h,
                      ocupado:     horariosOcupados.includes(h),
                      verificando: verificandoHora === h,
                    }"
                    :disabled="horariosOcupados.includes(h)"
                    @click="selecionarHorario(h)"
                  >
                    <span v-if="verificandoHora === h" class="mini-spin"></span>
                    <span v-else-if="horariosOcupados.includes(h)">✕</span>
                    <span v-else-if="horaSelecionada === h">✓</span>
                    {{ h }}
                  </button>
                </div>
              </div>
              <div class="turno">
                <span class="turno-label">🌇 Tarde</span>
                <div class="horarios-grid">
                  <button
                    v-for="h in horariosTarde"
                    :key="h"
                    class="hora-btn"
                    :class="{
                      ativo:       horaSelecionada === h,
                      ocupado:     horariosOcupados.includes(h),
                      verificando: verificandoHora === h,
                    }"
                    :disabled="horariosOcupados.includes(h)"
                    @click="selecionarHorario(h)"
                  >
                    <span v-if="verificandoHora === h" class="mini-spin"></span>
                    <span v-else-if="horariosOcupados.includes(h)">✕</span>
                    <span v-else-if="horaSelecionada === h">✓</span>
                    {{ h }}
                  </button>
                </div>
              </div>
            </div>
            <div class="horarios-legenda">
              <span class="leg livre">disponível</span>
              <span class="leg ocupado">ocupado</span>
              <span class="leg selecionado">selecionado</span>
            </div>
            <button class="btn-voltar" @click="voltar">← Voltar</button>
          </div>

          <!-- PASSO 4: Confirmação -->
          <div v-else-if="passoAtual === 4" key="passo4" class="wizard-panel">
            <div class="panel-header">
              <h2>Confirmar agendamento</h2>
              <p>Revise os dados antes de confirmar</p>
            </div>

            <div class="resumo-card">
              <div class="resumo-linha">
                <span>{{ iconeEsp(form.especialidade) }} Especialidade</span>
                <strong>{{ form.especialidade }}</strong>
              </div>
              <div class="resumo-linha">
                <span>👨‍⚕️ Médico(a)</span>
                <strong>{{ form.medicoNome }}</strong>
              </div>
              <div class="resumo-linha">
                <span>📅 Data</span>
                <strong>{{ dataFormatadaBonita }}</strong>
              </div>
              <div class="resumo-linha">
                <span>🕐 Horário</span>
                <strong>{{ horaSelecionada }}</strong>
              </div>
            </div>

            <div class="field">
              <label>Observações <small>(opcional)</small></label>
              <textarea
                class="input"
                v-model="form.observacoes"
                rows="3"
                placeholder="Sintomas, convênio, alergias..."
              ></textarea>
            </div>

            <div v-if="alertaChuva" class="alerta-chuva">
              🌧️ Atenção: previsão de chuva neste dia!
            </div>
            <p v-if="erro" class="erro-msg">⚠️ {{ erro }}</p>

            <div class="confirmar-actions">
              <button class="btn-voltar-inline" @click="voltar">← Voltar</button>
              <button
                class="btn btn-success btn-confirmar"
                :disabled="carregando"
                @click="agendar"
              >
                <span v-if="carregando" class="spinner"></span>
                {{ carregando ? 'Agendando...' : '✅ Confirmar' }}
              </button>
            </div>
          </div>

        </transition>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '../components/AppHeader.vue';
import api from '../services/api';

const router = useRouter();

// Estado do wizard
const passoAtual = ref(0);
const direcaoTransicao = ref('slide-next'); // 'slide-next' | 'slide-prev'

const form = reactive({
  especialidade: '', medicoNome: '',
  dataHora: '', observacoes: ''
});

const dataSelecionada   = ref(null);
const horaSelecionada   = ref('');
const horariosOcupados  = ref([]);
const verificandoHora   = ref('');
const alertaChuva       = ref(false);
const erro              = ref('');
const carregando        = ref(false);

// Calendário
const hoje       = new Date();
const anoAtual   = ref(hoje.getFullYear());
const mesAtual   = ref(hoje.getMonth());
const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const meses      = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const horariosManha = ['07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30'];
const horariosTarde = ['13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];

const stepLabels = ['Especialidade', 'Médico', 'Data', 'Horário', 'Confirmar'];

const progressWidth = computed(() => `${(passoAtual.value / (stepLabels.length - 1)) * 100}%`);

const especialidades = [
  { nome: 'Clínica Geral',  icon: '🩺' },
  { nome: 'Cardiologia',    icon: '❤️' },
  { nome: 'Ortopedia',      icon: '🦴' },
  { nome: 'Dermatologia',   icon: '🧴' },
  { nome: 'Pediatria',      icon: '👶' },
  { nome: 'Ginecologia',    icon: '🌸' },
];

const medicos = {
  'Clínica Geral':  [
    { nome: 'Dr. Carlos Silva',    crm: 'CRM/RJ 12345', nota: '4.9 (128 avaliações)', especialidade: 'Clínica Geral' },
    { nome: 'Dra. Ana Lima',       crm: 'CRM/RJ 23456', nota: '4.8 (97 avaliações)',  especialidade: 'Clínica Geral' },
  ],
  'Cardiologia':    [
    { nome: 'Dr. Roberto Souza',   crm: 'CRM/RJ 34567', nota: '4.9 (214 avaliações)', especialidade: 'Cardiologia' },
    { nome: 'Dra. Marina Costa',   crm: 'CRM/RJ 45678', nota: '5.0 (88 avaliações)',  especialidade: 'Cardiologia' },
  ],
  'Ortopedia':    [{ nome: 'Dr. Paulo Mendes',     crm: 'CRM/RJ 56789', nota: '4.7 (156 avaliações)', especialidade: 'Ortopedia' }],
  'Dermatologia': [{ nome: 'Dra. Fernanda Alves',  crm: 'CRM/RJ 67890', nota: '4.9 (203 avaliações)', especialidade: 'Dermatologia' }],
  'Pediatria':    [{ nome: 'Dra. Juliana Rocha',   crm: 'CRM/RJ 78901', nota: '5.0 (312 avaliações)', especialidade: 'Pediatria' }],
  'Ginecologia':  [{ nome: 'Dra. Camila Ferreira', crm: 'CRM/RJ 89012', nota: '4.8 (175 avaliações)', especialidade: 'Ginecologia' }],
};

const medicosFiltrados = computed(() => medicos[form.especialidade] || []);

const mesAnoExibido = computed(() => `${meses[mesAtual.value]} ${anoAtual.value}`);

const podeMesAnterior = computed(() =>
  anoAtual.value > hoje.getFullYear() || mesAtual.value > hoje.getMonth()
);

const diasDoMes = computed(() => {
  const primeiroDia = new Date(anoAtual.value, mesAtual.value, 1).getDay();
  const totalDias   = new Date(anoAtual.value, mesAtual.value + 1, 0).getDate();
  const dias = [];
  for (let i = 0; i < primeiroDia; i++) dias.push(null);
  for (let d = 1; d <= totalDias; d++) dias.push(d);
  return dias;
});

const dataFormatadaBonita = computed(() => {
  if (!dataSelecionada.value) return '';
  const { ano, mes, dia } = dataSelecionada.value;
  return new Date(ano, mes, dia).toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
});

// Helpers calendário
function ehHoje(dia) {
  return dia === hoje.getDate() && mesAtual.value === hoje.getMonth() && anoAtual.value === hoje.getFullYear();
}
function ehPassado(dia) {
  const d = new Date(anoAtual.value, mesAtual.value, dia);
  return d < new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
}
function ehSelecionado(dia) {
  return dataSelecionada.value?.dia === dia &&
    dataSelecionada.value?.mes === mesAtual.value &&
    dataSelecionada.value?.ano === anoAtual.value;
}
function ehFds(dia) {
  const dow = new Date(anoAtual.value, mesAtual.value, dia).getDay();
  return dow === 0 || dow === 6;
}
function mesAnterior() {
  if (!podeMesAnterior.value) return;
  if (mesAtual.value === 0) { mesAtual.value = 11; anoAtual.value--; }
  else mesAtual.value--;
}
function proximoMes() {
  if (mesAtual.value === 11) { mesAtual.value = 0; anoAtual.value++; }
  else mesAtual.value++;
}

// Navegação wizard
function avancar() {
  direcaoTransicao.value = 'slide-next';
  passoAtual.value++;
}
function voltar() {
  direcaoTransicao.value = 'slide-prev';
  passoAtual.value--;
}
function irPara(i) {
  direcaoTransicao.value = i < passoAtual.value ? 'slide-prev' : 'slide-next';
  passoAtual.value = i;
}

// Ações
function selecionarEspecialidade(nome) {
  form.especialidade = nome;
  form.medicoNome = '';
  setTimeout(() => avancar(), 200);
}
function selecionarMedico(nome) {
  form.medicoNome = nome;
  setTimeout(() => avancar(), 200);
}
function selecionarDia(dia) {
  dataSelecionada.value = { ano: anoAtual.value, mes: mesAtual.value, dia };
  horaSelecionada.value = '';
  horariosOcupados.value = [];
  setTimeout(() => avancar(), 250);
}

async function selecionarHorario(hora) {
  verificandoHora.value = hora;
  const { ano, mes, dia } = dataSelecionada.value;
  const dataHora = `${ano}-${String(mes + 1).padStart(2,'0')}-${String(dia).padStart(2,'0')}T${hora}`;
  try {
    const { data } = await api.get('/consultas/disponibilidade', {
      params: { dataHora, medicoNome: form.medicoNome }
    });
    if (!data.disponivel) {
      horariosOcupados.value.push(hora);
    } else {
      horaSelecionada.value = hora;
      form.dataHora = dataHora;
      setTimeout(() => avancar(), 400);
    }
  } catch {
    horaSelecionada.value = hora;
    form.dataHora = dataHora;
    setTimeout(() => avancar(), 400);
  } finally {
    verificandoHora.value = '';
  }
}

async function agendar() {
  try {
    carregando.value = true;
    erro.value = '';
    const { data } = await api.post('/consultas', form);
    alertaChuva.value = data.alertaChuva;
    if (data.alertaChuva) await new Promise(r => setTimeout(r, 2500));
    router.push('/dashboard');
  } catch (e) {
    erro.value = e.response?.data?.erro || 'Erro ao agendar consulta';
  } finally {
    carregando.value = false;
  }
}

function iconeEsp(e) {
  return especialidades.find(x => x.nome === e)?.icon || '🏥';
}
function iniciais(nome) {
  return nome.replace('Dr. ','').replace('Dra. ','').split(' ').slice(0,2).map(n => n[0]).join('');
}
</script>

<style scoped>
/* ===== LAYOUT ===== */
.page { min-height: 100vh; background: var(--bg); }

.agendar-page {
  min-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem 3rem;
}

/* ===== PROGRESS ===== */
.progress-bar-wrapper {
  width: 100%;
  max-width: 680px;
  margin-bottom: 2.5rem;
}
.progress-bar-track {
  height: 4px;
  background: var(--border);
  border-radius: 99px;
  margin-bottom: 1rem;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), #7c3aed);
  border-radius: 99px;
  transition: width .5s cubic-bezier(.4,0,.2,1);
}
.steps-labels {
  display: flex;
  justify-content: space-between;
}
.step-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .35rem;
  cursor: default;
  transition: var(--transition);
}
.step-label.completo { cursor: pointer; }
.step-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--border);
  color: var(--text-muted);
  font-size: .78rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition);
}
.step-label.ativo .step-dot {
  background: var(--primary);
  color: white;
  box-shadow: 0 0 0 4px rgba(37,99,235,.18);
}
.step-label.completo .step-dot {
  background: var(--success);
  color: white;
}
.step-nome {
  font-size: .72rem;
  font-weight: 600;
  color: var(--text-muted);
  transition: var(--transition);
}
.step-label.ativo .step-nome { color: var(--primary); }
.step-label.completo .step-nome { color: var(--success); }

/* ===== WIZARD CONTAINER ===== */
.wizard-container {
  width: 100%;
  max-width: 680px;
  position: relative;
  overflow: hidden; /* impede conteúdo saindo da tela */
}

/* ===== PAINEL ===== */
.wizard-panel {
  width: 100%;
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  padding: 2rem 2rem 1.75rem;
}

.panel-header {
  text-align: center;
  margin-bottom: 1.75rem;
}
.panel-header h2 {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: .35rem;
}
.panel-header p {
  color: var(--text-muted);
  font-size: .93rem;
}

/* ===== TRANSIÇÕES DIRECIONAIS ===== */

/* Avançar → sai pela esquerda, entra pela direita */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: all .4s cubic-bezier(.4, 0, .2, 1);
  position: absolute;
  width: 100%;
}

.slide-next-enter-from  { transform: translateX(60px);  opacity: 0; }
.slide-next-leave-to    { transform: translateX(-60px); opacity: 0; }
.slide-prev-enter-from  { transform: translateX(-60px); opacity: 0; }
.slide-prev-leave-to    { transform: translateX(60px);  opacity: 0; }

.slide-next-enter-to,
.slide-next-leave-from,
.slide-prev-enter-to,
.slide-prev-leave-from  { transform: translateX(0); opacity: 1; }

/* Garante altura mínima durante transição */
.wizard-container { min-height: 380px; }

/* ===== ESPECIALIDADES ===== */
.esp-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: .75rem;
}
@media (min-width: 480px) { .esp-grid { grid-template-columns: repeat(3, 1fr); } }

.esp-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
  padding: 1.25rem .75rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text);        /* ← garante herança da cor do tema */
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}
.esp-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(37,99,235,.05), transparent);
  opacity: 0;
  transition: opacity .25s;
}
.esp-card:hover {
  border-color: var(--primary);
  transform: translateY(-3px);
  box-shadow: var(--shadow);
  color: var(--primary);     /* ← cor ao passar o mouse */
}
.esp-card:hover::before { opacity: 1; }
.esp-card.ativo {
  border-color: var(--primary);
  background: var(--primary);
  color: white;              /* ← branco quando selecionado */
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(37,99,235,.35);
}
.esp-card.ativo::before { opacity: 0; }

/* Força o strong a herdar a cor do pai */
.esp-card strong {
  color: inherit;
  font-size: .85rem;
  text-align: center;
}
.esp-emoji { font-size: 2rem; }
.esp-arrow { font-size: .8rem; opacity: .4; }
.esp-card.ativo .esp-arrow { opacity: .7; }

/* ===== MÉDICOS ===== */
.medicos-lista { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 1.25rem; }

.medico-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  cursor: pointer;
  text-align: left;
  transition: var(--transition);
  width: 100%;
}
.medico-card:hover { border-color: var(--primary); transform: translateX(6px); box-shadow: var(--shadow-sm); }
.medico-card.ativo { border-color: var(--primary); background: var(--primary-light); }

.medico-avatar {
  width: 46px; height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #7c3aed);
  color: white;
  font-weight: 800;
  font-size: .95rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  text-transform: uppercase;
}
.medico-info { flex: 1; }
.medico-info strong { display: block; font-size: .95rem; color: var(--text); }
.medico-info small  { color: var(--text-muted); font-size: .78rem; }
.medico-estrelas    { font-size: .75rem; color: var(--text-muted); margin-top: .2rem; }
.medico-estrelas span { color: var(--warning); font-weight: 600; }
.medico-arrow { color: var(--primary); font-size: 1.1rem; margin-left: auto; opacity: .4; transition: var(--transition); }
.medico-card:hover .medico-arrow { opacity: 1; transform: translateX(4px); }

/* ===== CALENDÁRIO ===== */
.calendario-wrapper { margin-bottom: 1.25rem; }

.cal-nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.cal-mes-titulo { font-size: 1rem; font-weight: 700; color: var(--text); }
.cal-nav-btn {
  width: 34px; height: 34px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 700;
  transition: var(--transition);
  display: flex; align-items: center; justify-content: center;
}
.cal-nav-btn:hover:not(:disabled) { background: var(--primary); color: white; border-color: var(--primary); }
.cal-nav-btn:disabled { opacity: .3; cursor: not-allowed; }

.cal-semana {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: .4rem;
}
.cal-semana span {
  text-align: center;
  font-size: .72rem;
  font-weight: 700;
  color: var(--text-muted);
  padding: .25rem 0;
}

.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }

.cal-cell {
  aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  border-radius: 50%;
}
.cel-inner {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  font-size: .88rem;
  font-weight: 500;
  transition: var(--transition);
}
.cal-cell.disponivel:hover .cel-inner {
  background: var(--primary-light);
  color: var(--primary);
  transform: scale(1.12);
  font-weight: 700;
}
.cal-cell.hoje .cel-inner {
  color: var(--primary);
  font-weight: 800;
  border: 2px solid var(--primary);
}
.cal-cell.passado .cel-inner,
.cal-cell.fds .cel-inner {
  color: var(--text-light);
  opacity: .4;
  cursor: not-allowed;
}
.cal-cell.passado, .cal-cell.fds { cursor: not-allowed; }
.cal-cell.selecionado .cel-inner {
  background: var(--primary) !important;
  color: white !important;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(37,99,235,.45);
  transform: scale(1.15);
}

/* ===== HORÁRIOS ===== */
.turnos { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 1rem; }
.turno-label { display: block; font-size: .82rem; font-weight: 700; color: var(--text-muted); margin-bottom: .6rem; text-transform: uppercase; letter-spacing: .05em; }

.horarios-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: .45rem; }
@media (max-width: 420px) { .horarios-grid { grid-template-columns: repeat(4, 1fr); } }

.hora-btn {
  padding: .55rem .25rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text);
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex; align-items: center; justify-content: center; gap: .2rem;
}
.hora-btn:not(.ocupado):not(:disabled):hover {
  border-color: var(--primary);
  background: var(--primary-light);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-xs);
}
.hora-btn.ativo {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 4px 14px rgba(37,99,235,.4);
  transform: translateY(-2px);
}
.hora-btn.ocupado {
  background: var(--danger-light);
  color: var(--danger);
  border-color: transparent;
  cursor: not-allowed;
  opacity: .55;
}
.mini-spin {
  width: 11px; height: 11px;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.horarios-legenda { display: flex; gap: 1.25rem; margin-bottom: 1.25rem; }
.leg { display: flex; align-items: center; gap: .35rem; font-size: .75rem; color: var(--text-muted); }
.leg::before { content: ''; width: 10px; height: 10px; border-radius: 3px; }
.livre::before    { background: var(--bg); border: 1.5px solid var(--border); }
.ocupado::before  { background: var(--danger-light); }
.selecionado::before { background: var(--primary); }

/* ===== RESUMO FINAL ===== */
.resumo-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 1.1rem;
  margin-bottom: 1.25rem;
}
.resumo-linha {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .5rem 0;
  border-bottom: 1px solid var(--border);
  font-size: .9rem;
}
.resumo-linha:last-child { border-bottom: none; }
.resumo-linha span { color: var(--text-muted); }
.resumo-linha strong { color: var(--text); }

.field { margin-bottom: 1rem; }
.field label { display: block; font-size: .83rem; font-weight: 600; color: var(--text-muted); margin-bottom: .35rem; }
.field small { font-weight: 400; color: var(--text-light); }

.alerta-chuva {
  display: flex; align-items: center; gap: .6rem;
  background: var(--warning-light); color: var(--warning);
  padding: .75rem 1rem; border-radius: var(--radius-sm);
  font-weight: 600; font-size: .9rem;
  border: 1px solid rgba(217,119,6,.2);
  margin-bottom: 1rem;
  animation: pulseWarning 2s ease infinite;
}
@keyframes pulseWarning {
  0%,100% { box-shadow: 0 0 0 0 rgba(217,119,6,.2); }
  50%      { box-shadow: 0 0 0 6px rgba(217,119,6,0); }
}
.erro-msg { color: var(--danger); font-size: .88rem; margin-bottom: .75rem; }

/* ===== BOTÕES DE NAVEGAÇÃO ===== */
.btn-voltar {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  margin-top: 1.25rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  padding: .4rem 0;
  transition: var(--transition);
}
.btn-voltar:hover { color: var(--primary); transform: translateX(-3px); }

.confirmar-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: .5rem;
}
.btn-voltar-inline {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  padding: .4rem 0;
}
.btn-voltar-inline:hover { color: var(--primary); transform: translateX(-3px); }
.btn-confirmar { flex: 1; padding: .9rem; font-size: 1rem; }
</style>
