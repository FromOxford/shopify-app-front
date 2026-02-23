import type { Range } from '~/types'
import { useApi } from '~/composables/useApi'
import { formatDate } from '~/utils/date'

const DASHBOARD_QUERY = `
  query Dashboard($shopDomain: String!, $from: DateTime!, $to: DateTime!) {
    dashboard(shopDomain: $shopDomain, range: { from: $from, to: $to }) {
      revenue
      ordersCount
      averageOrderValue
      customers
      repeatCustomers
      repeatCustomerRate
      revenuePerCustomer
      ordersPerCustomer
      uniqueCustomers
      revenueByDay {
        date
        revenue
        orders_count
      }
    }
  }
`

export interface RevenueByDay {
  date: string;
  revenue: number;
  orders_count: number;
}

export interface DashboardStats {
  revenue: number;
  ordersCount: number;
  averageOrderValue: number;
  customers: number;
  repeatCustomers: number;
  repeatCustomerRate: number;
  revenuePerCustomer: number;
  ordersPerCustomer: number;
  uniqueCustomers: number;
  revenueByDay?: RevenueByDay[];
}


export async function fetchDashboard(
  shopDomain: string,
  range: Range
): Promise<DashboardStats> {
  const { graphql } = useApi()
  const res: any = await graphql(DASHBOARD_QUERY, { // todo replace any with interface
    shopDomain,
    from: formatDate(range.start),
    to: formatDate(range.end)
  })
  return res?.data?.dashboard
}
