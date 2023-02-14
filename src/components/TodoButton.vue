<template>
  <button
    class="todo-button"
    :class="state"
    @click="buttonClickHandler"
  >
    <img
      v-if="state === 'loading'"
      class="todo-button__loading-image"
      src="@/assets/images/ui/loader.svg"
      alt="loader icon"
    >
    <span
      v-else
      class="todo-button__message"
    >
      {{ text || $t(`todoButton.state.${state}`) }}
    </span>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'
import { protectionStatuses } from '@/consts/protectionStatuses.const'

export default Vue.extend({
  name: 'TodoButton',

  props: {
    state: {
      default: () => 'loading',
      type: String,
      required: true
    },

    text: {
      default: () => null,
      type: String,
      required: false
    }
  },

  methods: {
    ...mapActions(['sendAnalyticsEvent']),

    async buttonClickHandler (): Promise<void> {
      this.$emit('click')

      if (this.state === protectionStatuses.scam) {
        this.sendAnalyticsEvent({
          event: 'extension_todo_danger',
        })

        return
      }

      if (this.state === protectionStatuses.unknown) {
        this.sendAnalyticsEvent({
          event: 'extension_todo_unknown',
        })

        return
      }

      return
    },
  },
})
</script>

<style lang="scss" scoped>
.todo-button {
  width: 100%;
  padding: 10px 12px 8px;
  box-sizing: border-box;
  border-radius: 4px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  line-height: 20px;
  font-size: 12px;
  letter-spacing: 0.05em;
  font-weight: regular;
  text-transform: uppercase;
  background-color: $color-gray-base-500;
  color: $color-sub-text;
}

.todo-button.loading {
  background-color: rgba($color-purple-500, 0.5);
  color: $color-sub-text;
}

.todo-button.safe,
.todo-button.success {
  background-color: $color-gray-base-500;
  color: $color-sub-text;
}

.todo-button.scam,
.todo-button.needReloadPage,
.todo-button.error {
  background-color: $color-gray-base-500;
  color: $color-red-accent-200;
}

.todo-button.unknown,
.todo-button.action {
  background-color: $color-purple-500;
  color: $color-text;
  cursor: pointer;
}

.todo-button.unknown:active,
.todo-button.action:active {
  background-color: rgba($color-purple-500, 0.5);
  color: $color-sub-text;
}

.todo-button.signin {
  background-color: $color-purple-500;
  color: $color-text;
}

.todo-button__loading-image {
  width: 20px;
  height: 20px;
}
</style>
