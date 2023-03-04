<template>
  <table class=" table-wrapper">
    <thead class="thead-dark">
      <tr>
        <th
          scope="col"
          v-for="column in columns"
          class="table-th"
          :style="{
            '--maxWidth': column.maxWidth ? column.maxWidth : 'unset',
            '--minWidth': column.minWidth ? column.minWidth : 'unset',
            '--width': column.width ? column.width : 'unset',
            '--align': column.align ? column.align : 'center',
          }"
        >
          {{ column.title }}
        </th>
      </tr>
    </thead>
    <draggable v-model="cTableData" tag="tbody">
      <tr v-for="(row, index) in cTableData" :key="index">
        <td
          v-for="(column, colIndex) in columns"
          :key="colIndex"
          class="table-td"
          :style="{
            '--maxWidth': column.maxWidth ? column.maxWidth : 'unset',
            '--minWidth': column.minWidth ? column.minWidth : 'unset',
            '--width': column.width ? column.width : 'unset',
            '--align': column.align ? column.align : 'center',
          }"
        >
          <slot
            :name="column.slot"
            v-if="column.slot"
            v-bind="{ row, index, colIndex }"
          ></slot>
          <span v-else>{{ row[column.key] }}</span>
        </td>
      </tr>
    </draggable>
  </table>
</template>

<script>
import draggable from 'vuedraggable';
export default {
  name: 'table-draggable',
  // display: 'Table',
  // order: 8,
  components: {
    draggable,
  },
  props: {
    columns: {
      type: Array,
      default: () => [], //[{title:'xxxx',key:'xxx',slot:'xxx',maxWidth:'xxx',minWidth:'xxx'}]
    },
    tableData: {
      type: Array,
      require: true,
      default: () => [],
    },
  },
  watch: {
    tableData: {
      handler(newVal, oldVal) {
        this.cTableData.length = 0;
        this.cTableData = JSON.parse(JSON.stringify(newVal));
      },
      immediate: true,
    },
  },

  mounted() {},
  data() {
    return {
      cTableData: [],
    };
  },
};
</script>
<style scoped>
.buttons {
  margin-top: 35px;
}
.table-wrapper {
  width: 100%;
  height: 100%;
}

.table-th,
.table-td {
  width: var(--width);
  max-width: var(--maxWidth);
  min-width: var(--minWidth);
  text-align: var(--align);
}
</style>
