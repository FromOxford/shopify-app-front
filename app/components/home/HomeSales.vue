<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Period, Range, Sale } from "~/types";
import { fetchOrders } from "~/services/orders.service";

const props = defineProps<{
  period: Period;
  range: Range;
}>();

const UBadge = resolveComponent("UBadge");
const { shopDomain } = useShopDomain();

type SaleStatus = Sale["status"];

function mapStatus(financialStatus?: string | null): SaleStatus {
  const value = financialStatus?.toLowerCase() ?? "";

  if (value.includes("paid")) return "paid";
  if (value.includes("refund")) return "refunded";

  return "failed";
}

const { data } = await useAsyncData<Sale[]>(
  () =>
    `orders-${props.range.start.toISOString()}-${props.range.end.toISOString()}`,
  async () => {
    const orders = await fetchOrders(shopDomain.value, {
      from: props.range.start,
      to: props.range.end,
    });

    return orders
      .map(
        (order: any): Sale => ({
          id: String(order.id),
          date: order.shopify_created_at,
          status: mapStatus(order.financial_status),
          email: order.customer?.email ?? "",
          amount: Number(order.total_price ?? 0),
        }),
      )
      .sort(
        (a: Sale, b: Sale) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
  },
  {
    watch: [() => props.range.start, () => props.range.end],
    lazy: true,
  },
);

/* formatters */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = (date: string) =>
  new Date(date).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const columns: TableColumn<Sale>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => `#${row.getValue("id")}`,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => dateFormatter(row.getValue("date")),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as SaleStatus;

      const color = {
        paid: "success",
        failed: "error",
        refunded: "neutral",
      }[status];

      return h(
        UBadge,
        { class: "capitalize", variant: "subtle", color },
        () => status,
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: () => h("div", { class: "text-right" }, "Amount"),
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right font-medium" },
        currencyFormatter.format(Number(row.getValue("amount"))),
      ),
  },
];
</script>

<template>
  <UTable
    :data="data"
    :columns="columns"
    class="shrink-0"
    :ui="{
      base: 'table-fixed border-separate border-spacing-0',
      thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
      td: 'border-b border-default',
    }"
  />
</template>
