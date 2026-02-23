export const useApi = () => {
  const config = useRuntimeConfig()

  const graphql = async (query: string, variables = {}) => {
    return await $fetch(config.public.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { query, variables },
      credentials: 'omit'
    })
  }

  return { graphql }
}
