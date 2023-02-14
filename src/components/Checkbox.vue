<template>
  <label class="checkbox">
    <input
      class="checkbox__input"
      type="checkbox"
      :checked="value"
      @change="onChange"
    >
    <i class="checkbox__icon" />
  </label>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Checkbox',

  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },

  methods: {
    onChange (event: any) {
      this.$emit('input', event.target.checked)
    },
  },
})
</script>

<style lang="scss" scoped>
.checkbox {
  cursor: pointer;
}

.checkbox__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkbox__icon {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
  background-color: $color-gray-base-100;
  border-radius: 20px;
  vertical-align: text-bottom;
  transition: all 0.3s linear;
}

.checkbox__icon::before {
  content: '';
  position: absolute;
  left: 0;
  width: 38px;
  height: 18px;
  background-color: $color-gray-base-100;
  border-radius: 20px;
  transform: translate3d(2px, 3px, 0) scale3d(1, 1, 1);
  transition: all 0.25s linear;
}

.checkbox__icon::after {
  content: '';
  position: absolute;
  left: 0;
  width: 18px;
  height: 18px;
  background-color: $color-white-bg;
  border-radius: 100%;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  transform: translate3d(3px, 3px, 0);
  transition: all 0.2s ease-in-out;
}

.checkbox__input:checked + .checkbox__icon {
  background-color: $color-green-accent-100;
}

.checkbox__input:checked + .checkbox__icon::before {
  transform: translate3d(18px, 3px, 0) scale3d(0, 0, 0);
}

.checkbox__input:checked + .checkbox__icon::after {
  transform: translate3d(18px, 3px, 0);
}
</style>
