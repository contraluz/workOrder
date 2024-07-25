<template>
  <div class="expandDetail">
    <div class="inline" v-for="step in steps" :key="step.key">
      <Checkbox
        v-model="row[item.key]"
        @on-change="handleCheck(row, item.key, row[item.key])"
      >
        {{ item.title }}
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
    }
  },
  data() {
    return {};
  },
  methods: {
    handleCheck(row, key, value) {
      this.$emit("handleCheck", row, key, value);
    },
  },
};
</script>

<style lang="less">
.expandDetail {
  .inline {
    display: inline-block;
  }
}
</style>