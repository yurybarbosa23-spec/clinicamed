<template>
  <div class="page">
    <AppHeader />

    <main class="container">
      <!-- Boas-vindas -->
      <div class="welcome fade-in">
        <div>
          <h2>Olá, {{ auth.usuario?.nome?.split(' ')[0] }}! 👋</h2>
          <p>{{ saudacao }} — veja suas consultas abaixo</p>
        </div>
        <router-link to="/agendar" class="btn btn-success">
          + Nova Consulta
        </router-link>
      </div>

      <!-- Stats -->
      <div class="stats fade-in">
        <div class="stat-card card">
          <span class="stat-icon">📋</span>
          <div>
            <strong>{{ total }}</strong>
            <small>Total</small>
          </div>
        </div>
        <div class="stat-card card">
          <span class="stat-icon">⏳</span>
          <div>
            <strong>{{ agendadas }}</strong>
            <small>Agendadas</small>
          </div>
        </div>
        <div class="stat-card card">
          <span class="stat-icon">✅</span>
          <div>
            <strong>{{ realizadas }}</strong>
            <small>Realizadas</small>
          </div>
        </div>
      </div>

      <!-- Lista -->
      <h3 class="section-title">Minhas Consultas</h3>

      <div v-if="carregando" class="loading">
        <div class="spinner-lg"></div>
        <span>Carregando consultas...</span>
      </div>

      <div v-else-if="consultas.length === 0" class="empty card">
        <span>🗓️</span>
        <p>Nenhuma consulta agendada ainda.</p>
        <router-link to="/agendar" class="btn btn-primary">Agendar agora</router-link>
      </div>

      <div v-else class="consultas-grid">
        <div v-for="c in consultas" :key="c.id" class="consulta-card card fade-in" :class="`status-${c.status}`">
          <div class="consulta-header">
            <div class="medico-info">
              <span class="especialidade-icon">{{ iconeEspecialidade(c.especialidade) }}</span>
              <div>
                <strong>{{ c.especialidade }}</strong>
                <small>{{ c.medicoNome }}</small>
              </div>
            </div>
            <span class="badge" :class="badgeStatus(c.status)">{{ c.status }}</span>
          </div>

          <div class="consulta-body">
            <div class="info-row">
              <span>📅</span>
              <span>{{ formatarData(c.dataHora) }}</span>
            </div>
            <div v-if="c.observacoes" class="info-row">
              <span>📝</span>
              <span>{{ c.observacoes }}</span>
            </div>
            <div v-if="c.alertaChuva" class="alerta-chuva">
              🌧️ Previsão de chuva neste dia — leve um guarda-chuva!
            </div>
          </div>

          <div v-if="c.status === 'agendada'" class="consulta-footer">
            <button @click="cancelar(c.id)" class="btn btn-danger btn-sm-full">
              Cancelar consulta
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';

const auth = useAuthStore();
const consultas = ref([]);
const carregando = ref(true);

const total = computed(() => consultas.value.length);
const agendadas = computed(() => consultas.value.filter(c => c.status === 'agendada').length);
const realizadas = computed(() => consultas.value.filter(c => c.status === 'realizada').length);

const hora = new Date().getHours();
const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

onMounted(async () => {
  const { data } = await api.get('/consultas/minhas');
  consultas.value = data;
  carregando.value = false;
});

function formatarData(dt) {
  return new Date(dt).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' });
}

function iconeEspecialidade(e) {
  const map = { 'Cardiologia': '❤️', 'Ortopedia': '🦴', 'Dermatologia': '🧴', 'Pediatria': '👶', 'Ginecologia': '🌸', 'Clínica Geral': '🩺' };
  return map[e] || '🏥';
}

function badgeStatus(s) {
  return { agendada: 'badge-blue', confirmada: 'badge-green', realizada: 'badge-green', cancelada: 'badge-gray' }[s] || 'badge-gray';
}

async function cancelar(id) {
  if (!confirm('Deseja cancelar esta consulta?')) return;
  await api.patch(`/consultas/${id}/cancelar`);
  consultas.value = consultas.value.map(c => c.id === id ? { ...c, status: 'cancelada' } : c);
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--bg); }
.container { max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem; }

.welcome {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
}
.welcome h2 { font-size: 1.5rem; font-weight: 800; color: var(--text); }
.welcome p { color: var(--text-muted); font-size: .95rem; }

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
.stat-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; }
.stat-icon { font-size: 1.75rem; }
.stat-card strong { display: block; font-size: 1.75rem; font-weight: 800; color: var(--primary); line-height: 1; }
.stat-card small { color: var(--text-muted); font-size: .8rem; }

.section-title { font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 1rem; }

.loading { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; color: var(--text-muted); }
.spinner-lg { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty { text-align: center; padding: 3.5rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.empty span { font-size: 3rem; }
.empty p { color: var(--text-muted); }

.consultas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
.consulta-card { overflow: hidden; }
.status-cancelada { opacity: .65; }

.consulta-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.25rem; border-bottom: 1px solid var(--border); }
.medico-info { display: flex; align-items: center; gap: .75rem; }
.especialidade-icon { font-size: 1.75rem; }
.medico-info strong { display: block; font-size: 1rem; color: var(--text); }
.medico-info small { color: var(--text-muted); font-size: .82rem; }

.consulta-body { padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: .5rem; }
.info-row { display: flex; align-items: flex-start; gap: .6rem; font-size: .9rem; color: var(--text-muted); }

.consulta-footer { padding: 1rem 1.25rem; border-top: 1px solid var(--border); }
.btn-sm-full { width: 100%; padding: .6rem; font-size: .88rem; }
</style>
