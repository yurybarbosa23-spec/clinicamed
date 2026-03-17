<template>
  <header class="app-header">
    <div class="header-left">
      <span class="logo">🏥 ClínicaMed</span>
    </div>
    <div class="header-right">
      <span class="user-name">{{ auth.usuario?.nome }}</span>
      <span class="user-badge" :class="perfilClass">{{ auth.usuario?.perfil }}</span>
      <router-link v-if="auth.ehAdmin" to="/admin" class="hbtn">⚙️ Admin</router-link>
      <router-link v-if="auth.ehAdmin" to="/dashboard" class="hbtn">🏠 Dashboard</router-link>
      <button class="btn-tema" @click="toggleTema" :title="temaAtual === 'dark' ? 'Modo claro' : 'Modo noturno'">
        {{ temaAtual === 'dark' ? '☀️' : '🌙' }}
      </button>
      <button class="hbtn hbtn-sair" @click="sair">Sair</button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTema } from '../composables/useTema';

const auth = useAuthStore();
const router = useRouter();
const { temaAtual, toggleTema } = useTema();

const perfilClass = computed(() => ({
  'pb-blue':   auth.usuario?.perfil === 'paciente',
  'pb-yellow': auth.usuario?.perfil === 'secretario',
  'pb-green':  auth.usuario?.perfil === 'admin',
}));

function sair() { auth.logout(); router.push('/login'); }
</script>

<style scoped>
.app-header {
  background: var(--bg-header);
  padding: .875rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 16px rgba(0,0,0,.2);
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.logo {
  color: white;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -.02em;
  text-shadow: 0 1px 4px rgba(0,0,0,.2);
}
.header-right { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }
.user-name { color: rgba(255,255,255,.8); font-size: .88rem; }
.user-badge { font-size: .7rem; font-weight: 700; padding: .18rem .55rem; border-radius: 999px; }
.pb-blue   { background: rgba(219,234,254,.9); color: #1d4ed8; }
.pb-yellow { background: rgba(254,243,199,.9); color: #92400e; }
.pb-green  { background: rgba(220,252,231,.9); color: #15803d; }

.hbtn {
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.2);
  color: rgba(255,255,255,.9);
  padding: .38rem .85rem;
  border-radius: var(--radius-sm);
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition);
}
.hbtn:hover { background: rgba(255,255,255,.22); color: white; }
.hbtn-sair { color: rgba(255,180,180,.9); border-color: rgba(255,150,150,.25); }
.hbtn-sair:hover { background: rgba(220,38,38,.25); color: white; }

.btn-tema {
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.2);
  border-radius: var(--radius-sm);
  padding: .38rem .6rem;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
  line-height: 1;
}
.btn-tema:hover { background: rgba(255,255,255,.24); transform: scale(1.12); }
</style>
