<template>
  <div class="auth-page">
    <div class="auth-bg">
      <div class="auth-blob blob1"></div>
      <div class="auth-blob blob2"></div>
      <div class="auth-blob blob3"></div>
    </div>

    <div class="auth-card card fade-in">
      <div class="auth-logo">🏥</div>
      <h1>ClínicaMed</h1>
      <p class="auth-sub">Crie sua conta para agendar consultas</p>

      <form @submit.prevent="registrar" class="auth-form">

        <!-- Dados pessoais -->
        <div class="form-section">
          <span class="section-label">👤 Dados Pessoais</span>
          <div class="field">
            <label>Nome completo</label>
            <input class="input" v-model="form.nome" placeholder="Seu nome completo" required />
          </div>
          <div class="field">
            <label>E-mail</label>
            <input class="input" v-model="form.email" type="email" placeholder="seu@email.com" required />
          </div>
          <div class="field">
            <label>Senha</label>
            <div class="input-senha">
              <input
                class="input"
                v-model="form.senha"
                :type="mostrarSenha ? 'text' : 'password'"
                placeholder="Mínimo 6 caracteres"
                required
                minlength="6"
              />
              <button type="button" class="toggle-senha" @click="mostrarSenha = !mostrarSenha">
                {{ mostrarSenha ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Endereço -->
        <div class="form-section">
          <span class="section-label">📍 Endereço</span>
          <div class="field">
            <label>CEP</label>
            <div class="cep-wrapper">
              <input
                class="input"
                v-model="form.cep"
                placeholder="00000-000"
                maxlength="9"
                @input="formatarCep"
                @blur="buscarCep"
              />
              <span v-if="buscandoCep" class="cep-loading">
                <span class="spinner" style="border-top-color: var(--primary); border-color: var(--border);"></span>
              </span>
              <span v-if="cepOk" class="cep-ok">✅</span>
            </div>
            <small v-if="cepErro" class="erro-msg">{{ cepErro }}</small>
          </div>

          <div class="field">
            <label>Logradouro</label>
            <input class="input" v-model="form.logradouro" placeholder="Rua, Avenida..." />
          </div>

          <div class="fields-row">
            <div class="field flex-2">
              <label>Bairro</label>
              <input class="input" v-model="form.bairro" placeholder="Bairro" />
            </div>
            <div class="field flex-1">
              <label>UF</label>
              <input class="input" v-model="form.uf" placeholder="UF" maxlength="2" style="text-transform:uppercase" />
            </div>
          </div>

          <div class="field">
            <label>Cidade</label>
            <input class="input" v-model="form.cidade" placeholder="Cidade" />
          </div>
        </div>

        <p v-if="erro" class="erro-msg">⚠️ {{ erro }}</p>
        <div v-if="sucesso" class="sucesso-banner">✅ {{ sucesso }}</div>

        <button type="submit" class="btn btn-primary w-full" :disabled="carregando">
          <span v-if="carregando" class="spinner"></span>
          {{ carregando ? 'Criando conta...' : 'Criar conta' }}
        </button>
      </form>

      <div class="auth-footer">
        <span>Já tem conta?</span>
        <router-link to="/login">Fazer login</router-link>
      </div>

      <button class="btn-tema-flutuante" @click="toggleTema" :title="temaAtual === 'dark' ? 'Modo claro' : 'Modo noturno'">
        {{ temaAtual === 'dark' ? '☀️' : '🌙' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useTema } from '../composables/useTema';

const router = useRouter();
const { temaAtual, toggleTema } = useTema();

const form = reactive({ nome: '', email: '', senha: '', cep: '', logradouro: '', bairro: '', cidade: '', uf: '' });
const erro = ref('');
const sucesso = ref('');
const carregando = ref(false);
const buscandoCep = ref(false);
const cepOk = ref(false);
const cepErro = ref('');
const mostrarSenha = ref(false);

function formatarCep() {
  let v = form.cep.replace(/\D/g, '').slice(0, 8);
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
  form.cep = v;
  if (v.length < 9) { cepOk.value = false; cepErro.value = ''; }
}

async function buscarCep() {
  const cep = form.cep.replace(/\D/g, '');
  if (cep.length !== 8) return;
  buscandoCep.value = true;
  cepErro.value = '';
  cepOk.value = false;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (data.erro) {
      cepErro.value = 'CEP não encontrado';
    } else {
      form.logradouro = data.logradouro || '';
      form.bairro = data.bairro || '';
      form.cidade = data.localidade || '';
      form.uf = data.uf || '';
      cepOk.value = true;
    }
  } catch {
    cepErro.value = 'Erro ao buscar CEP';
  } finally {
    buscandoCep.value = false;
  }
}

async function registrar() {
  try {
    carregando.value = true;
    erro.value = '';
    await api.post('/auth/registro', form);
    sucesso.value = 'Conta criada com sucesso! Redirecionando...';
    setTimeout(() => router.push('/login'), 1800);
  } catch (e) {
    erro.value = e.response?.data?.erro || 'Erro ao criar conta';
  } finally {
    carregando.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  position: relative;
  overflow: hidden;
  padding: 2rem 1rem;
}
.auth-bg { position: absolute; inset: 0; pointer-events: none; }
.auth-blob { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .12; }
.blob1 { width: 480px; height: 480px; background: #2563eb; top: -160px; left: -120px; }
.blob2 { width: 360px; height: 360px; background: #7c3aed; bottom: -80px; right: -80px; }
.blob3 { width: 280px; height: 280px; background: #0891b2; top: 40%; left: 60%; }

.auth-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  padding: 2.25rem 2.5rem;
  z-index: 1;
}
.auth-logo { font-size: 2.5rem; text-align: center; margin-bottom: .25rem; }
h1 { text-align: center; font-size: 1.65rem; font-weight: 800; color: var(--primary); margin-bottom: .2rem; }
.auth-sub { text-align: center; color: var(--text-muted); margin-bottom: 1.75rem; font-size: .9rem; }

.auth-form { display: flex; flex-direction: column; gap: 1.25rem; }

.form-section {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: .75rem;
}
.section-label {
  font-size: .78rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .06em;
  margin-bottom: .1rem;
}

.field label {
  display: block;
  font-size: .83rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: .3rem;
}

.input-senha { position: relative; }
.input-senha .input { padding-right: 3rem; }
.toggle-senha {
  position: absolute;
  right: .75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
}

.cep-wrapper { position: relative; display: flex; align-items: center; }
.cep-wrapper .input { padding-right: 2.5rem; }
.cep-loading, .cep-ok {
  position: absolute;
  right: .75rem;
  display: flex;
  align-items: center;
}
.cep-loading .spinner {
  width: 14px; height: 14px;
  border-width: 2px;
}

.fields-row { display: flex; gap: .75rem; }
.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

.sucesso-banner {
  background: var(--success-light);
  color: var(--success);
  border: 1px solid rgba(22,163,74,.25);
  padding: .75rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: .9rem;
  text-align: center;
}

.w-full { width: 100%; padding: .875rem; font-size: 1rem; }

.auth-footer {
  display: flex;
  justify-content: center;
  gap: .4rem;
  margin-top: 1.25rem;
  font-size: .9rem;
  color: var(--text-muted);
}
.auth-footer a { color: var(--primary); font-weight: 600; text-decoration: none; }
.auth-footer a:hover { text-decoration: underline; }

.btn-tema-flutuante {
  position: absolute;
  top: 1rem; right: 1rem;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: .32rem .58rem;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
  line-height: 1;
}
.btn-tema-flutuante:hover { transform: scale(1.15); border-color: var(--primary); }
</style>
