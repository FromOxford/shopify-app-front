export default defineNuxtRouteMiddleware((to) => {
  const cookie = useCookie<string | null>('shopDomain', { sameSite: 'lax' })
  const state = useState<string | null>('shopDomain', () => null)

  const q = to.query.domain

  if (typeof q === 'string' && q.length) {
    state.value = q
    cookie.value = q
    return
  }

  const domain = state.value || cookie.value
  if (domain) {
    return navigateTo(
      { path: to.path, query: { ...to.query, domain } },
      { replace: true }
    )
  }
})

