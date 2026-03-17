import { ref } from 'vue';

const temaAtual = ref(localStorage.getItem('tema') || 'light');

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
  localStorage.setItem('tema', tema);
  temaAtual.value = tema;
}

// Aplica na inicialização
aplicarTema(temaAtual.value);

export function useTema() {
  function toggleTema() {
    aplicarTema(temaAtual.value === 'dark' ? 'light' : 'dark');
  }
  return { temaAtual, toggleTema };
}
