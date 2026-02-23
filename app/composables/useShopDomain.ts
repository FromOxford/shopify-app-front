export function useShopDomain(defaultValue = 'test-laravel-lighthouse.myshopify.com') {
  const route = useRoute()
  const cookie = useCookie<string | null>('shopDomain', { sameSite: 'lax' })
  const state = useState<string | null>('shopDomain', () => null)

  const shopDomain = computed<string>(() => {
    const q = route.query.domain
    if (typeof q === 'string' && q.length) return q
    if (state.value) return state.value
    if (cookie.value) return cookie.value || defaultValue
    return defaultValue
  })

  function setShopDomain(domain: string) {
    state.value = domain
    cookie.value = domain
  }

  return { shopDomain, setShopDomain }
}

