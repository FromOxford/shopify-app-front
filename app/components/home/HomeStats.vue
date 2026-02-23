<script setup lang="ts">
import type { Period, Range, Stat } from "~/types";

const props = defineProps<{
  period: Period;
  range: Range;
  revenue: number;
  ordersCount: number;
  averageOrderValue: number;
  customers: number;
  repeatCustomers?: number;
  uniqueCustomers?: number;
  repeatCustomerRate?: number;
  revenuePerCustomer?: number;
  ordersPerCustomer?: number;
}>();

function formatCurrency(value: number): string {
  return (
    value?.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }) ?? "Unset"
  );
}

const stats = computed<Stat[]>(() => {
  return [
    {
      title: "Revenue",
      icon: "i-lucide-circle-dollar-sign",
      value: formatCurrency(props.revenue),
      variation: 0,
    },
    {
      title: "Orders",
      icon: "i-lucide-shopping-cart",
      value: props.ordersCount,
      variation: 0,
    },
    {
      title: "Average Order Value (AOV)",
      icon: "i-lucide-circle-dollar-sign",
      value: formatCurrency(props.averageOrderValue),
      variation: 0,
    },
    {
      title: "Customers",
      icon: "i-lucide-users",
      value: props.customers,
      variation: 0,
    },
    {
      title: "Unique customers",
      icon: "i-lucide-users",
      value: props.uniqueCustomers ?? 0,
      variation: 0,
    },
    {
      title: "Repeat Customer Rate",
      icon: "i-lucide-users",
      value:
        props.repeatCustomerRate !== undefined
          ? `${props.repeatCustomerRate.toFixed(1)}%`
          : "0%",
      variation: 0,
    },
    {
      title: "Conversions (Orders per Customer)",
      icon: "i-lucide-chart-pie",
      value:
        props.ordersPerCustomer !== undefined
          ? props.ordersPerCustomer.toFixed(2)
          : "0.00",
      variation: 0,
    },
    {
      title: "Revenue per Customer",
      icon: "i-lucide-chart-pie",
      value: formatCurrency(props.revenuePerCustomer ?? 0),
      variation: 0,
    },
  ];
});
</script>

<template>
  <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      to="/customers"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading:
          'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase',
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          {{ stat.value }}
        </span>

        <!-- <UBadge
          :color="stat.variation > 0 ? 'success' : 'error'"
          variant="subtle"
          class="text-xs"
        >
          {{ stat.variation > 0 ? "+" : "" }}{{ stat.variation }}%
        </UBadge> -->
      </div>
    </UPageCard>
  </UPageGrid>
</template>
