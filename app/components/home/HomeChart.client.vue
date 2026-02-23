<script setup lang="ts">
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  addDays,
  endOfMonth,
} from "date-fns";
import {
  VisXYContainer,
  VisLine,
  VisAxis,
  VisArea,
  VisCrosshair,
  VisTooltip,
} from "@unovis/vue";
import type { Period, Range } from "~/types";

const cardRef = useTemplateRef<HTMLElement | null>("cardRef");

const props = defineProps<{
  period: Period;
  range: Range;
  series: {
    date: string;
    revenue: number;
    orders_count: number;
  }[];
}>();

type DataRecord = {
  date: Date;
  amount: number;
};

const { width } = useElementSize(cardRef);

const data = ref<DataRecord[]>([]);

const normalizeSeries = () => {
  return props.series.map((point) => ({
    date: new Date(point.date),
    amount: point.revenue,
  }));
};

watch(
  [() => props.period, () => props.range, () => props.series],
  () => {
    const points = normalizeSeries();

    if (!points.length) {
      data.value = [];
      return;
    }

    if (props.period === "daily") {
      const byDay = new Map<string, number>();

      for (const point of points) {
        const key = format(point.date, "yyyy-MM-dd");
        byDay.set(key, (byDay.get(key) ?? 0) + point.amount);
      }

      data.value = eachDayOfInterval(props.range).map((date) => ({
        date,
        amount: byDay.get(format(date, "yyyy-MM-dd")) ?? 0,
      }));

      return;
    }

    if (props.period === "weekly") {
      const weeks = eachWeekOfInterval(props.range);

      data.value = weeks.map((start) => {
        const end =
          addDays(start, 6) > props.range.end
            ? props.range.end
            : addDays(start, 6);

        const amount = points
          .filter((point) => point.date >= start && point.date <= end)
          .reduce((acc, point) => acc + point.amount, 0);

        return { date: start, amount };
      });

      return;
    }

    const months = eachMonthOfInterval(props.range);

    data.value = months.map((start) => {
      const end =
        endOfMonth(start) > props.range.end
          ? props.range.end
          : endOfMonth(start);

      const amount = points
        .filter((point) => point.date >= start && point.date <= end)
        .reduce((acc, point) => acc + point.amount, 0);

      return { date: start, amount };
    });
  },
  { immediate: true },
);

const x = (_: DataRecord, i: number) => i;
const y = (d: DataRecord) => d.amount;

const total = computed(() =>
  data.value.reduce((acc: number, { amount }) => acc + amount, 0),
);

const formatNumber = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
}).format;

const formatDate = (date: Date): string => {
  return {
    daily: format(date, "d MMM"),
    weekly: format(date, "d MMM"),
    monthly: format(date, "MMM yyy"),
  }[props.period];
};

const xTicks = (i: number) => {
  if (i === 0 || i === data.value.length - 1 || !data.value[i]) {
    return "";
  }

  return formatDate(data.value[i].date);
};

const template = (d?: DataRecord) => {
  if (!d) {
    return "";
  }

  return `${formatDate(d.date)}: ${formatNumber(d.amount ?? 0)}`;
};
</script>

<template>
  <UCard
    ref="cardRef"
    :ui="{ root: 'overflow-visible', body: '!px-0 !pt-0 !pb-3' }"
  >
    <template #header>
      <div>
        <p class="text-xs text-muted uppercase mb-1.5">Revenue</p>
        <p class="text-3xl text-highlighted font-semibold">
          {{ formatNumber(total) }}
        </p>
      </div>
    </template>

    <VisXYContainer
      :data="data"
      :padding="{ top: 40 }"
      class="h-96"
      :width="width"
    >
      <VisLine :x="x" :y="y" color="var(--ui-primary)" />
      <VisArea :x="x" :y="y" color="var(--ui-primary)" :opacity="0.1" />

      <VisAxis type="x" :x="x" :tick-format="xTicks" />

      <VisCrosshair color="var(--ui-primary)" :template="template" />

      <VisTooltip />
    </VisXYContainer>
  </UCard>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(--ui-primary);
  --vis-crosshair-circle-stroke-color: var(--ui-bg);

  --vis-axis-grid-color: var(--ui-border);
  --vis-axis-tick-color: var(--ui-border);
  --vis-axis-tick-label-color: var(--ui-text-dimmed);

  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>
