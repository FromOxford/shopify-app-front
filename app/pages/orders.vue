<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { upperFirst } from "scule";
import { getPaginationRowModel } from "@tanstack/table-core";
import type { Row } from "@tanstack/table-core";
import { fetchOrders } from "~/services/orders.service";

interface OrderItemRow {
  id: number;
  title: string;
  quantity: number;
  price: number;
}

interface OrderRow {
  id: number;
  total_price: number;
  currency: string;
  financial_status: string;
  fulfillment_status: string;
  shopify_created_at: string;
  customer_name: string;
  items: OrderItemRow[];
}

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UTable = resolveComponent("UTable");

const toast = useToast();
const table = useTemplateRef<{ tableApi?: any }>("table");

const columnFilters = ref([
  {
    id: "customer_name",
    value: "",
  },
]);
const columnVisibility = ref();
const rowSelection = ref({ 1: true });

const { shopDomain } = useShopDomain();

const { data, status } = await useAsyncData<OrderRow[]>(
  "orders",
  async () => {
    const orders = await fetchOrders(shopDomain.value);

    return orders.map((o: any) => ({
      id: Number(o.id),
      total_price: o.total_price ?? 0,
      currency: o.currency ?? "",
      financial_status: o.financial_status ?? "",
      fulfillment_status: o.fulfillment_status ?? "",
      shopify_created_at: o.shopify_created_at ?? "",
      customer_name: o.customer?.full_name ?? o.customer?.email ?? "",
      items: (o.items ?? []).map((item: any) => ({
        id: Number(item.id),
        title: item.title ?? "",
        quantity: item.quantity ?? 0,
        price: item.price ?? 0,
      })),
    }));
  },
  { lazy: true },
);

function getRowItems(row: Row<OrderRow>) {
  return [
    {
      type: "label",
      label: "Actions",
    },
    {
      label: "Copy order ID",
      icon: "i-lucide-copy",
      onSelect() {
        navigator.clipboard.writeText(row.original.id.toString());
        toast.add({
          title: "Copied to clipboard",
          description: "Order ID copied to clipboard",
        });
      },
    },
  ];
}

const columns: TableColumn<OrderRow>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "customer_name",
    header: "Customer",
  },
  {
    accessorKey: "total_price",
    header: "Total",
    cell: ({ row }) => {
      return `${row.original.total_price.toFixed(2)} ${row.original.currency}`;
    },
  },
  {
    accessorKey: "financial_status",
    header: "Payment",
    cell: ({ row }) => {
      const color =
        {
          paid: "success" as const,
          pending: "warning" as const,
          refunded: "neutral" as const,
          failed: "error" as const,
        }[row.original.financial_status] ?? "neutral";

      return h(
        UBadge,
        { class: "capitalize", variant: "subtle", color },
        () => row.original.financial_status || "unknown",
      );
    },
  },
  {
    accessorKey: "fulfillment_status",
    header: "Fulfillment",
    cell: ({ row }) => {
      const color =
        {
          fulfilled: "success" as const,
          partial: "warning" as const,
          unfulfilled: "neutral" as const,
          cancelled: "error" as const,
        }[row.original.fulfillment_status] ?? "neutral";

      return h(
        UBadge,
        { class: "capitalize", variant: "subtle", color },
        () => row.original.fulfillment_status || "unknown",
      );
    },
  },
  {
    accessorKey: "shopify_created_at",
    header: "Created at",
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => {
      return h(
        UDropdownMenu,
        {
          content: {
            align: "end",
          },
          items: row.original.items.map((item) => ({
            label: item.title,
            trailingIcon: "i-lucide-shopping-bag",
            description: `${item.quantity} × ${item.price.toFixed(2)}`,
          })),
        },
        () =>
          h(UButton, {
            label: "View items",
            color: "neutral",
            variant: "ghost",
            icon: "i-lucide-list",
          }),
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: {
              align: "end",
            },
            items: getRowItems(row),
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              class: "ml-auto",
            }),
        ),
      );
    },
  },
];

const fulfillmentFilter = ref("all");

watch(
  () => fulfillmentFilter.value,
  (newVal) => {
    if (!table?.value?.tableApi) return;

    const fulfillmentColumn =
      table.value.tableApi.getColumn("fulfillment_status");
    if (!fulfillmentColumn) return;

    if (newVal === "all") {
      fulfillmentColumn.setFilterValue(undefined);
    } else {
      fulfillmentColumn.setFilterValue(newVal);
    }
  },
);

const customerFilter = computed({
  get: (): string => {
    return (
      (table.value?.tableApi
        ?.getColumn("customer_name")
        ?.getFilterValue() as string) || ""
    );
  },
  set: (value: string) => {
    table.value?.tableApi
      ?.getColumn("customer_name")
      ?.setFilterValue(value || undefined);
  },
});

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});
</script>

<template>
  <UDashboardPanel id="orders">
    <template #header>
      <UDashboardNavbar title="Orders">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          v-model="customerFilter"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Filter by customer..."
        />

        <div class="flex flex-wrap items-center gap-1.5">
          <USelect
            v-model="fulfillmentFilter"
            :items="[
              { label: 'All', value: 'all' },
              { label: 'Fulfilled', value: 'fulfilled' },
              { label: 'Partial', value: 'partial' },
              { label: 'Unfulfilled', value: 'unfulfilled' },
              { label: 'Cancelled', value: 'cancelled' },
            ]"
            :ui="{
              trailingIcon:
                'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
            placeholder="Filter fulfillment"
            class="min-w-28"
          />
          <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column: any) => column.getCanHide())
                .map((column: any) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi
                      ?.getColumn(column.id)
                      ?.toggleVisibility(!!checked);
                  },
                  onSelect(e?: Event) {
                    e?.preventDefault();
                  },
                }))
            "
            :content="{ align: 'end' }"
          >
            <UButton
              label="Display"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-settings-2"
            />
          </UDropdownMenu>
        </div>
      </div>

      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:column-visibility="columnVisibility"
        v-model:row-selection="rowSelection"
        v-model:pagination="pagination"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel(),
        }"
        class="shrink-0"
        :data="data"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0',
        }"
      />

      <div
        class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto"
      >
        <div class="flex items-center gap-1.5">
          <UPagination
            :default-page="
              (table?.tableApi?.getState().pagination.pageIndex || 0) + 1
            "
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
