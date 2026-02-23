import { useApi } from '~/composables/useApi'
import type { User } from '~/types'

const CUSTOMERS_QUERY = `
  query Customers($shopDomain: String!, $search: String) {
    customers(shopDomain: $shopDomain, search: $search) {
      id
      email
      first_name
      last_name
      full_name
    }
  }
`

export interface CustomersFilters {
  search?: string
}

export async function fetchCustomers(
  shopDomain: string,
  { search }: CustomersFilters = {}
): Promise<User[]> {
  const { graphql } = useApi()
  const res: any = await graphql(CUSTOMERS_QUERY, { shopDomain, search }) // todo replace any with interface
  const customers = res?.data?.customers ?? []

  return customers.map((c: any) => ({
    id: Number(c.id),
    name:
      c.full_name ||
      [c.first_name, c.last_name].filter(Boolean).join(' ') ||
      c.email,
    email: c.email || '',
    status: 'subscribed',
    location: '',
  }))
}

