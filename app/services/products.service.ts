import { useApi } from '~/composables/useApi'

const PRODUCTS_QUERY = `
  query Products($shopDomain: String!, $search: String, $status: String) {
    products(shopDomain: $shopDomain, search: $search, status: $status) {
      id
      title
      price
      status
    }
  }
`

export interface ProductsFilters {
  search?: string
  status?: string
}

export async function fetchProducts(
  shopDomain: string,
  { search, status }: ProductsFilters = {}
) {
  const { graphql } = useApi()
  const res: any = await graphql(PRODUCTS_QUERY, { shopDomain, search, status }) // todo replace any with interface
  return res?.data?.products ?? []
}

