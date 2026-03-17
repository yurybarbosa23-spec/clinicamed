import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    usuario: JSON.parse(localStorage.getItem('usuario') || 'null')
  }),
  getters: {
    estaLogado: (s) => !!s.token,
    ehAdmin: (s) => ['admin', 'secretario'].includes(s.usuario?.perfil)
  },
  actions: {
    async login(email, senha) {
      const { data } = await api.post('/auth/login', { email, senha });
      this.token = data.token;
      this.usuario = data.usuario;
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
    },
    logout() {
      this.token = null;
      this.usuario = null;
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
  }
});
