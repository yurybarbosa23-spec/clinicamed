import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: () => import('../views/LoginView.vue') },
  { path: '/registro', component: () => import('../views/RegistroView.vue') },
  { path: '/dashboard', component: () => import('../views/DashboardView.vue'), meta: { requerAuth: true } },
  { path: '/agendar', component: () => import('../views/AgendarView.vue'), meta: { requerAuth: true } },
  { path: '/admin', component: () => import('../views/AdminView.vue'), meta: { requerAuth: true, apenasAdmin: true } }
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.requerAuth && !auth.estaLogado) return next('/login');
  if (to.meta.apenasAdmin && !auth.ehAdmin) return next('/dashboard');
  next();
});

export default router;
