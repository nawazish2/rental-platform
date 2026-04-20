/** Post-login/register route by role */
export function getDashboardPath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'owner') return '/owner';
  return '/dashboard';
}
