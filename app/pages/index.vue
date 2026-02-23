<script setup lang="ts">
import { sub } from "date-fns";
import type { Period, Range } from "~/types";
import { fetchDashboard } from "~/services/dashboard.service";
import type { DashboardStats } from "~/services/dashboard.service";

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date(),
});
const period = ref<Period>("daily");

const { shopDomain } = useShopDomain();

const { data: dashboardData, status: dashboardStatus } =
  await useAsyncData<DashboardStats | null>(
    `dashboard-${range.value.start.toISOString()}-${range.value.end.toISOString()}`,
    async () => fetchDashboard(shopDomain.value, range.value),
    {
      watch: [() => range.value.start, () => range.value.end],
      lazy: true,
    },
  );
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right> </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <HomeDateRangePicker v-model="range" class="-ms-1" />

          <HomePeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <HomeStats
        :period="period"
        :range="range"
        :customers="dashboardData?.customers ?? 0"
        :revenue="dashboardData?.revenue ?? 0"
        :orders-count="dashboardData?.ordersCount ?? 0"
        :average-order-value="dashboardData?.averageOrderValue ?? 0"
        :repeat-customers="dashboardData?.repeatCustomers ?? 0"
        :unique-customers="dashboardData?.uniqueCustomers ?? 0"
        :repeat-customer-rate="dashboardData?.repeatCustomerRate ?? 0"
        :orders-per-customer="dashboardData?.ordersPerCustomer ?? 0"
        :revenue-per-customer="dashboardData?.revenuePerCustomer ?? 0"
      />
      <HomeChart
        :period="period"
        :range="range"
        :series="dashboardData?.revenueByDay ?? []"
      />
      <HomeSales :period="period" :range="range" />
    </template>
  </UDashboardPanel>
</template>
