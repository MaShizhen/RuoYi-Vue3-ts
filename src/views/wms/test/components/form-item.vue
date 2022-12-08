<template>
  <div>
    <el-input
      v-if="element === 'input'"
      v-model="value_change"
      style="width: 100%"
      :type="type"
      :style="{ width }"
      :placeholder="placeholder"
    />
    <el-date-picker
      v-else-if="element === 'el-date-picker'"
      v-model="value_change"
      style="width: 100%"
      :type="type"
      :style="{ width }"
      value-format="timestamp"
      :placeholder="placeholder"
    />
    <el-select
      v-else-if="element === 'el-select'"
      v-model="value_change"
      style="width: 100%"
      :style="{ width }"
      :placeholder="placeholder"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>
  
  <script>
export default {
  model: {
    prop: "value",
    event: "change",
  },
  props: {
    element: {
      type: String,
      default: "input",
    },
    type: {
      type: String,
      default: "input",
    },
    width: {
      type: String,
      default: "100%",
    },
    placeholder: {
      type: String,
      default: "",
    },
    prop: {
      type: String,
      default: "",
    },
    value: {
      type: String,
      default: "",
    },
    options: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  computed: {
    value_change: {
      get() {
        // 针对日期区间选择器的处理
        if (this.element === "el-date-picker") {
          if (this.type === "daterange" || this.type === "dates") {
            const v = this.value
              ? this.value.split(",").map((i) => {
                  return Number(i);
                })
              : [];
            return v;
          } else {
            return this.value === "" ? "" : Number(this.value);
          }
        } else {
          return this.value;
        }
      },
      set(v) {
        // 针对日期区间选择器的处理
        if (this.element === "el-date-picker") {
          if (Array.isArray(v)) {
            this.emit(
              v.map((i) => {
                return this.parse_date(i);
              })
            );
          } else {
            this.emit(this.parse_date(v));
          }
        } else {
          this.emit(v);
        }
      },
    },
  },
  methods: {
    parse_date(timestamp) {
      if (timestamp === null) {
        return "";
      }
      return new Date(timestamp).getTime();
    },
    emit(v) {
      this.$emit("change", v.toString());
    },
  },
};
</script>
  
  <style lang="scss" scoped>
</style>
  