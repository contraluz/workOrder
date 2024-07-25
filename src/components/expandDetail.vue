<template>
  <div class="expandDetail" ref="expandDetail">
    <div class="inline" v-for="step in steps" :key="step.columnName">
      <Checkbox
        v-model="row[step.columnName]"
        @on-change="handleCheck(row, step.columnName, row[step.columnName])"
      >
        {{ step.chineseName }}
      </Checkbox>
    </div>
  </div>
</template>

<script>
export default {
  name: "expandDetail",
  props: {
    steps: {
      type: Array,
      default: () => [],
    },
    row: {
      type: Object,
      default: () => {},
    },
    handleCheck: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {};
  },
};
</script>

<style lang="less">
.expandDetail {
  display: flex;
  justify-content: space-between;
  .inline {
    width: 0;
    flex: 0 0 30px;
    .ivu-checkbox-label-text {
      padding-left: 0;
    }
  }
}
</style>