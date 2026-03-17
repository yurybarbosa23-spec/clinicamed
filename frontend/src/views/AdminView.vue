<template>
  <div class="page">
    <AppHeader />
    <main class="container">
      <div class="page-header fade-in">
        <h2>⚙️ Painel Administrativo</h2>
        <p>Gerencie todos os atendimentos da clínica</p>
      </div>

      <!-- Métricas -->
      <div class="metricas fade-in" v-if="metricas">
        <div class="metrica-card card" v-for="m in metricasExibidas" :key="m.label">
          <span class="metrica-icon">{{ m.icon }}</span>
          <strong :style="{ color: m.cor }">{{ m.valor }}</strong>
          <small>{{ m.label }}</small>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filtros card fade-in">
        <div class="filtro-grupo">
          <label>Status</label>
          <select class="input" v-model="filtroStatus" @change="buscar">
            <option value="">Todos</option>
            <option value="agendada">Agendada</option>
            <option value="confirmada">Confirmada</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div class="filtro-grupo">
          <label>Data</label>
          <input class="input" v-model="filtroData" type="date" @change="buscar" />
        </div>
        <button class="btn btn-ghost" @click="limparFiltros">✕ Limpar</button>
      </div>

      <!-- Tabela -->
      <div class="tabela-wrapper card fade-in">
        <div v-if="carregando" class="loading">Carregando...</div>
        <table v-else>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Especialidade</th>
              <th>Data/Hora</th>
              <th>Status</th>
              <th>🌧️</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in consultas" :key="c.id" class="table-row">
              <td>
                <div class="paciente-info">
                  <strong>{{ c.paciente?.nome }}</strong>
                  <small>{{ c.paciente?.email }}</small>
                </div>
              </td>
              <td>{{ c.medicoNome }}</td>
              <td>{{ c.especialidade }}</td>
              <td>{{ formatarData(c.dataHora) }}</td>
              <td><span class="badge" :class="badgeStatus(c.status)">{{ c.status }}</span></td>
              <td>{{ c.alertaChuva ? '🌧️' : '—' }}</td>
              <td>
                <select class="select-status" @change="atualizarStatus(c.id, $event.target.value)" :value="c.status">
                  <option value="agendada">Agendada</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="realizada">Realizada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </td>
            </tr>
            <tr v-if="consultas.length === 0">
              <td colspan="7" class="sem-dados">Nenhuma consulta encontrada</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import api from '../services/api';

const consultas = ref([]);
const metricas = ref(null);
const filtroStatus = ref('');
const filtroData = ref('');
const carregando = ref(false);

const metricasExibidas = computed(() => metricas.value ? [
  { icon: '📋', label: 'Total', valor: metricas.value.total, cor: 'var(--primary)' },
  { icon: '⏳', label: 'Agendadas', valor: metricas.value.agendadas, cor: '#2563eb' },
  { icon: '✅', label: 'Realizadas', valor: metricas.value.realizadas, cor: 'var(--success)' },
  { icon: '❌', label: 'Canceladas', valor: metricas.value.canceladas, cor: 'var(--danger)' },
  { icon: '👥', label: 'Pacientes', valor: metricas.value.pacientes, cor: 'var(--secondary)' },
] : []);

onMounted(() => { buscar(); buscarMetricas(); });

async function buscar() {
  carregando.value = true;
  const params = {};
  if (filtroStatus.value) params.status = filtroStatus.value;
  if (filtroData.value) params.data = filtroData.value;
  const { data } = await api.get('/admin/consultas', { params });
  consultas.value = data;
  carregando.value = false;
}

async function buscarMetricas() {
  const { data } = await api.get('/admin/metricas');
  metricas.value = data;
}

async function atualizarStatus(id, status) {
  await api.patch(`/admin/consultas/${id}/status`, { status });
  buscar(); buscarMetricas();
}

function limparFiltros() {
  filtroStatus.value = ''; filtroData.value = ''; buscar();
}

function formatarData(dt) {
  return new Date(dt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function badgeStatus(s) {
  return { agendada: 'badge-blue', confirmada: 'badge-green', realizada: 'badge-green', cancelada: 'badge-red', }[s] || 'badge-gray';
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--bg); }
.container { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }
.page-header { margin-bottom: 1.5rem; }
.page-header h2 { font-size: 1.5rem; font-weight: 800; }
.page-header p { color: var(--text-muted); }

.metricas { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
@media (max-width: 900px) { .metricas { grid-template-columns: repeat(3, 1fr); } }
.metrica-card { padding: 1.25rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: .35rem; }
.metrica-icon { font-size: 1.75rem; }
.metrica-card strong { font-size: 2rem; font-weight: 800; line-height: 1; }
.metrica-card small { color: var(--text-muted); font-size: .8rem; }

.filtros { padding: 1.25rem 1.5rem; display: flex; align-items: flex-end; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.filtro-grupo { display: flex; flex-direction: column; gap: .3rem; min-width: 160px; }
.filtro-grupo label { font-size: .82rem; font-weight: 600; color: var(--text-muted); }
.filtro-grupo .input { padding: .6rem .85rem; }

.tabela-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
thead tr { border-bottom: 2px solid var(--border); }
th { padding: 1rem 1.25rem; text-align: left; font-size: .82rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; }
.table-row { border-bottom: 1px solid var(--border); transition: background .15s; }
.table-row:hover { background: var(--bg); }
td { padding: .9rem 1.25rem; font-size: .9rem; color: var(--text); }
.paciente-info strong { display: block; }
.paciente-info small { color: var(--text-muted); font-size: .8rem; }

.select-status { padding: .35rem .65rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: .85rem; background: var(--bg-input); color: var(--text); cursor: pointer; }
.sem-dados { text-align: center; color: var(--text-muted); padding: 2.5rem; }
.loading { text-align: center; padding: 2rem; color: var(--text-muted); }
</style>
