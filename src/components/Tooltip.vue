<template>
  <VTooltip
    class="tooltip"
    :distance="4"
    :autoHide="true"
  >
    <svg
      class="tooltip__icon"
      :class="protectionStatus"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.32505 6.30029C8.32505 6.54882 8.52652 6.75029 8.77505 6.75029H9.22505C9.47358 6.75029 9.67505 6.54882 9.67505 6.30029V5.85029C9.67505 5.60176 9.47358 5.40029 9.22505 5.40029H8.77505C8.52652 5.40029 8.32505 5.60176 8.32505 5.85029V6.30029Z"
      />
      <path
        d="M8.77505 13.0503C8.52652 13.0503 8.32505 12.8488 8.32505 12.6003V8.55029C8.32505 8.30176 8.52652 8.10029 8.77505 8.10029H9.22505C9.47358 8.10029 9.67505 8.30176 9.67505 8.55029V12.6003C9.67505 12.8488 9.47358 13.0503 9.22505 13.0503H8.77505Z"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M9.00005 1.80029C12.9765 1.80029 16.2 5.02384 16.2 9.00029C16.2 12.9767 12.9765 16.2003 9.00005 16.2003C5.0236 16.2003 1.80005 12.9767 1.80005 9.00029C1.80005 5.02384 5.0236 1.80029 9.00005 1.80029ZM9.00005 3.15029C12.2309 3.15029 14.85 5.76943 14.85 9.00029C14.85 12.2312 12.2309 14.8503 9.00005 14.8503C5.76918 14.8503 3.15005 12.2312 3.15005 9.00029C3.15005 5.76943 5.76918 3.15029 9.00005 3.15029Z"
      />
    </svg>

    <template #popper>
      {{ content }}
    </template>
  </VTooltip>
</template>

<script lang="ts">
import Vue from 'vue'
import { Tooltip } from 'floating-vue'
import 'floating-vue/dist/style.css'

Vue.component('VTooltip', Tooltip)

export default Vue.extend({
  name: 'Tooltip',

  props: {
    protectionStatus: {
      default: () => '',
      type: String,
      required: false
    },

    content: {
      default: () => '',
      type: String,
      required: true
    }
  }
})
</script>

<style lang="scss" scoped>
.tooltip__icon path {
  fill: $color-gray-base-200
}

.tooltip__icon.safe path {
  fill: $color-green-100
}

.tooltip__icon.scam path {
  fill: $color-red-accent-100
}

.tooltip__icon.unknown path {
  fill: $color-yellow-accent-100
}

</style>

<style lang="scss">
.v-popper__popper {
  max-width: 280px;
  word-break: normal;
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  color: $color-gray-base-100;
}

.v-popper__inner {
  border-radius: 4px !important;
  padding: 10px 14px !important;
  background-color: $color-gray-base-800 !important;
  width: 200px;
}
</style>
