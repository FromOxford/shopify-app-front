import { useApi } from "~/composables/useApi";

const ORDERS_QUERY = `
  query Orders(
    $shopDomain: String!
    $financialStatus: String
    $fulfillmentStatus: String
    $from: DateTime
    $to: DateTime
  ) {
    orders(
      shopDomain: $shopDomain
      financial_status: $financialStatus
      fulfillment_status: $fulfillmentStatus
      from: $from
      to: $to
    ) {
      id
      total_price
      currency
      financial_status
      fulfillment_status
      shopify_created_at
      customer {
        full_name
        email
      }
      items {
        id
        title
        quantity
        price
      }
    }
  }
`;

export interface OrdersFilters {
  financialStatus?: string;
  fulfillmentStatus?: string;
  from?: Date;
  to?: Date;
}

export async function fetchOrders(
  shopDomain: string,
  filters: OrdersFilters = {}
) {
  const { graphql } = useApi();

  const variables: any = {
    shopDomain,
  };

  if (filters.financialStatus) {
    variables.financialStatus = filters.financialStatus;
  }

  if (filters.fulfillmentStatus) {
    variables.fulfillmentStatus = filters.fulfillmentStatus;
  }

  if (filters.from) {
    variables.from = formatDate(filters.from);
  }

  if (filters.to) {
    variables.to = formatDate(filters.to);
  }

  const res: any = await graphql(ORDERS_QUERY, variables);// todo replace any with interface

  return res?.data?.orders ?? [];
}
