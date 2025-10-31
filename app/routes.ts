import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('pages/index.tsx'),
  route('/auth/login', 'pages/auth/login.tsx'),
  route('/auth/forgot-password', 'pages/auth/forgot-password.tsx'),
  route('/dashboard', 'pages/dashboard.tsx'),
  route('/users', 'pages/users.tsx'),
  route('/brands', 'pages/brands.tsx'),
  route('/banners', 'pages/banners.tsx'),
] satisfies RouteConfig;
