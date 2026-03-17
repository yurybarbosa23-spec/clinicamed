<template>
  <div class="login-page" :class="{ dark: temaAtual === 'dark' }">

    <!-- Fundo animado -->
    <div class="bg-animated">
      <div class="orb orb1"></div>
      <div class="orb orb2"></div>
      <div class="orb orb3"></div>
      <div class="grid-overlay"></div>
    </div>

    <!-- Coluna esquerda: branding -->
    <div class="branding-col">
      <div class="branding-content">
        <div class="brand-logo">🏥</div>
        <h1 class="brand-name">ClínicaMed</h1>
        <p class="brand-slogan">Sua saúde em boas mãos,<br>agendamentos sem complicação.</p>

        <div class="features">
          <div class="feature-item" v-for="(f, i) in features" :key="i" :style="{ animationDelay: `${i * 0.12}s` }">
            <span class="feature-icon">{{ f.icon }}</span>
            <div>
              <strong>{{ f.titulo }}</strong>
              <small>{{ f.desc }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Coluna direita: formulário -->
    <div class="form-col">
      <div class="form-card">

        <!-- Topo -->
        <div class="form-top">
          <div class="form-badge">Portal do Paciente</div>
          <button class="tema-toggle" @click="toggleTema" :title="temaAtual === 'dark' ? 'Modo claro' : 'Modo noturno'">
            <span class="tema-icon">{{ temaAtual === 'dark' ? '☀️' : '🌙' }}</span>
          </button>
        </div>

        <h2>Bem-vindo de volta!</h2>
        <p class="form-sub">Entre com suas credenciais para continuar</p>

        <!-- Formulário -->
        <form @submit.prevent="entrar" class="form" autocomplete="on">

          <div class="field-group" :class="{ focused: focusEmail, filled: email }">
            <label>E-mail</label>
            <div class="input-wrapper">
              <span class="input-icon">✉️</span>
              <input
                v-model="email"
                type="email"
                placeholder="seu@email.com"
                autocomplete="email"
                required
                @focus="focusEmail = true"
                @blur="focusEmail = false"
              />
            </div>
          </div>

          <div class="field-group" :class="{ focused: focusSenha, filled: senha }">
            <label>Senha</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                v-model="senha"
                :type="mostrarSenha ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                required
                @focus="focusSenha = true"
                @blur="focusSenha = false"
              />
              <button type="button" class="toggle-senha" @click="mostrarSenha = !mostrarSenha" tabindex="-1">
                {{ mostrarSenha ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <!-- Erro -->
          <transition name="shake">
            <div v-if="erro" class="erro-box">
              <span>⚠️</span>
              <span>{{ erro }}</span>
            </div>
          </transition>

          <!-- Botão -->
          <button type="submit" class="btn-entrar" :disabled="carregando" :class="{ loading: carregando }">
            <span v-if="carregando" class="btn-spinner"></span>
            <span v-else class="btn-icon">→</span>
            {{ carregando ? 'Entrando...' : 'Entrar' }}
          </button>

        </form>

        <!-- Divisor -->
        <div class="divisor">
          <span></span>
          <small>Não tem conta?</small>
          <span></span>
        </div>

        <!-- Link registro -->
        <router-link to="/registro" class="btn-registro">
          Criar conta gratuita
        </router-link>

        <!-- Rodapé -->
        <p class="form-footer">
          Acesso administrativo? <br>
          <small>Entre com as credenciais fornecidas pela clínica.</small>
        </p>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTema } from '../composables/useTema';

const auth = useAuthStore();
const router = useRouter();
const { temaAtual, toggleTema } = useTema();

const email       = ref('');
const senha       = ref('');
const erro        = ref('');
const carregando  = ref(false);
const mostrarSenha = ref(false);
const focusEmail  = ref(false);
const focusSenha  = ref(false);

const features = [
  { icon: '📅', titulo: 'Agendamento fácil',    desc: 'Marque consultas em segundos' },
  { icon: '🌧️', titulo: 'Alerta de clima',       desc: 'Aviso automático de chuva no dia' },
  { icon: '👨‍⚕️', titulo: 'Médicos especializados', desc: 'Diversas especialidades disponíveis' },
  { icon: '🔒', titulo: 'Dados protegidos',      desc: 'Autenticação segura com JWT' },
];

async function entrar() {
  try {
    carregando.value = true;
    erro.value = '';
    await auth.login(email.value, senha.value);
    router.push(auth.ehAdmin ? '/admin' : '/dashboard');
  } catch (e) {
    erro.value = e.response?.data?.erro || 'E-mail ou senha incorretos';
  } finally {
    carregando.value = false;
  }
}
</script>

<style scoped>
/* ===== LAYOUT GERAL ===== */
.login-page {
  min-height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
  background: var(--bg);
}

/* ===== FUNDO ANIMADO ===== */
.bg-animated {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  animation: floatOrb 10s ease-in-out infinite;
}
.orb1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(37,99,235,.18), transparent 70%);
  top: -200px; left: -150px;
  animation-duration: 12s;
}
.orb2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(124,58,237,.14), transparent 70%);
  bottom: -150px; right: -100px;
  animation-duration: 9s;
  animation-delay: -4s;
}
.orb3 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(6,182,212,.10), transparent 70%);
  top: 40%; left: 40%;
  animation-duration: 14s;
  animation-delay: -7s;
}
@keyframes floatOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(30px, -20px) scale(1.05); }
  66%       { transform: translate(-20px, 15px) scale(.97); }
}

/* Grade sutil de fundo */
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(37,99,235,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37,99,235,.03) 1px, transparent 1px);
  background-size: 48px 48px;
}
[data-theme="dark"] .grid-overlay {
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
}

/* ===== COLUNA BRANDING ===== */
.branding-col {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 4rem;
  position: relative;
  z-index: 1;
}
@media (max-width: 900px) { .branding-col { display: none; } }

.branding-content { max-width: 420px; }

.brand-logo {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
  animation: bounceIn .8s cubic-bezier(.4,0,.2,1) both;
}
@keyframes bounceIn {
  0%   { opacity: 0; transform: scale(.5); }
  70%  { transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

.brand-name {
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--primary), #7c3aed, #0891b2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -.03em;
  line-height: 1;
  margin-bottom: .75rem;
  animation: fadeInLeft .7s .1s ease both;
}

.brand-slogan {
  font-size: 1.1rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 2.5rem;
  animation: fadeInLeft .7s .2s ease both;
}

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
}

.features { display: flex; flex-direction: column; gap: 1rem; }

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: .875rem 1.1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  animation: fadeInLeft .6s ease both;
  transition: var(--transition);
}
.feature-item:hover {
  border-color: var(--primary);
  transform: translateX(6px);
  box-shadow: var(--shadow);
}
.feature-icon { font-size: 1.5rem; flex-shrink: 0; }
.feature-item strong { display: block; font-size: .9rem; color: var(--text); }
.feature-item small  { font-size: .78rem; color: var(--text-muted); }

/* ===== COLUNA FORMULÁRIO ===== */
.form-col {
  width: 480px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 1;
}
@media (max-width: 900px) {
  .form-col { width: 100%; }
}

.form-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-card);
  border-radius: 24px;
  border: 1px solid var(--border);
  padding: 2.25rem 2rem;
  box-shadow: var(--shadow-lg);
  animation: scaleIn .5s cubic-bezier(.4,0,.2,1) both;
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(.93) translateY(16px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* Topo do card */
.form-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.75rem;
}
.form-badge {
  background: var(--primary-light);
  color: var(--primary);
  font-size: .72rem;
  font-weight: 700;
  padding: .28rem .8rem;
  border-radius: 999px;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.tema-toggle {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--bg);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition);
  font-size: 1rem;
}
.tema-toggle:hover { border-color: var(--primary); transform: rotate(20deg) scale(1.1); }

/* Títulos */
.form-card h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: .25rem;
}
.form-sub {
  color: var(--text-muted);
  font-size: .9rem;
  margin-bottom: 1.75rem;
}

/* ===== CAMPOS ===== */
.form { display: flex; flex-direction: column; gap: 1rem; }

.field-group label {
  display: block;
  font-size: .8rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: .35rem;
  transition: color .2s;
  text-transform: uppercase;
  letter-spacing: .05em;
}
.field-group.focused label { color: var(--primary); }

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: .875rem;
  font-size: .95rem;
  pointer-events: none;
  z-index: 1;
}
.input-wrapper input {
  width: 100%;
  padding: .8rem 1rem .8rem 2.75rem;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-size: .95rem;
  background: var(--bg-input);
  color: var(--text);
  outline: none;
  transition: all .25s;
}
.input-wrapper input::placeholder { color: var(--text-light); }
.input-wrapper input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37,99,235,.12);
  background: var(--bg-card);
}
.field-group.focused .input-wrapper input {
  border-color: var(--primary);
}

.toggle-senha {
  position: absolute;
  right: .875rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: .95rem;
  padding: 0;
  line-height: 1;
  opacity: .6;
  transition: opacity .2s;
}
.toggle-senha:hover { opacity: 1; }

/* ===== ERRO ===== */
.erro-box {
  display: flex;
  align-items: center;
  gap: .6rem;
  background: var(--danger-light);
  color: var(--danger);
  padding: .75rem 1rem;
  border-radius: 10px;
  font-size: .88rem;
  font-weight: 600;
  border: 1px solid rgba(220,38,38,.2);
}

/* Animação de shake para erro */
.shake-enter-active { animation: shake .4s ease; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%      { transform: translateX(-8px); }
  40%      { transform: translateX(8px); }
  60%      { transform: translateX(-5px); }
  80%      { transform: translateX(5px); }
}

/* ===== BOTÃO ENTRAR ===== */
.btn-entrar {
  width: 100%;
  padding: .9rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .6rem;
  transition: all .3s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 4px 14px rgba(37,99,235,.35);
  letter-spacing: .02em;
  margin-top: .25rem;
  position: relative;
  overflow: hidden;
}
.btn-entrar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.12), transparent);
  opacity: 0;
  transition: opacity .25s;
}
.btn-entrar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(37,99,235,.45);
}
.btn-entrar:hover:not(:disabled)::before { opacity: 1; }
.btn-entrar:active:not(:disabled) { transform: translateY(0); }
.btn-entrar:disabled { opacity: .65; cursor: not-allowed; }
.btn-entrar.loading { background: linear-gradient(135deg, #3b82f6, #2563eb); }

.btn-icon { font-size: 1.1rem; transition: transform .25s; }
.btn-entrar:hover .btn-icon { transform: translateX(4px); }

.btn-spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== DIVISOR ===== */
.divisor {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin: 1.5rem 0 1rem;
}
.divisor span {
  flex: 1;
  height: 1px;
  background: var(--border);
}
.divisor small { color: var(--text-muted); font-size: .82rem; white-space: nowrap; }

/* ===== BOTÃO REGISTRO ===== */
.btn-registro {
  display: block;
  width: 100%;
  padding: .8rem;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  font-size: .95rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: var(--transition);
}
.btn-registro:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
  transform: translateY(-1px);
}

/* ===== RODAPÉ ===== */
.form-footer {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--text-muted);
  font-size: .8rem;
  line-height: 1.5;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
}
.form-footer small { color: var(--text-light); }
</style>
