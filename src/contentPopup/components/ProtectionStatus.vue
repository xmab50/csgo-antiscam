<template>
  <div class="protection-status">
    <div
      class="protection-status__status-message"
      :class="protectionStatus"
    >
      {{ $t(`protectionStatus.button.${protectionStatus}`) }}
      <Tooltip
        v-if="
          protectionStatus === protectionStatuses.safe ||
          protectionStatus === protectionStatuses.scam ||
          protectionStatus === protectionStatuses.unknown
        "
        :protectionStatus="protectionStatus"
        :content="$t(`protectionStatus.tooltip.${protectionStatus}`)"
      />
    </div>

    <div
      class="protection-status__hint"
      :class="protectionStatus"
    >
      <span v-if="comment">
        {{ comment }}
      </span>
      <span v-else>
        {{ $t(`protectionStatus.hint.${protectionStatus}`) }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { protectionStatuses } from '@/consts/protectionStatuses.const'
import Tooltip from '@/components/Tooltip.vue'

export default Vue.extend({
  name: 'ProtectionStatus',

  data () {
    return {
      protectionStatuses
    }
  },

  props: {
    protectionStatus: {
      default: () => 'loading',
      type: String,
      required: true,
    },

    comments: {
      default: () => {},
      type: Object,
      required: false,
    }
  },

  components: {
    Tooltip
  },

  computed: {
    comment (): string | undefined {
      const locale = this.$i18n.locale
      const comment = this.comments?.[locale]

      return comment
    }
  },
})
</script>

<style lang="scss" scoped>
.protection-status__status-message {
  font-size: 18px;
  font-weight: 500;
  line-height: 26px;
  text-align: center;
  padding: 11px 6px;
  border-radius: 4px;
  background: $color-default-bg;
  color: $color-default;
  transition: all 0.3s ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.protection-status__status-message .tooltip {
  margin-left: 4px;
  max-height: 18px;
  max-width: 18px;
}

.protection-status__status-message.safe {
  background: rgba($color-green-100, 0.1);
  color: $color-green-accent-100;
}

.protection-status__status-message.scam,
.protection-status__status-message.failed,
.protection-status__status-message.needReloadPage {
  background: rgba($color-pink-100, 0.1);
  color: $color-red-accent-200;
}

.protection-status__status-message.unknown,
.protection-status__status-message.canNotCheck {
  background: rgba($color-yellow-accent-100, 0.1);
  color: $color-yellow-accent-100;
}

.protection-status__status-message.loading,
.protection-status__status-message.disabled {
  background: rgba($color-white-100, 0.1);
  color: $color-gray-base-200;
}

.protection-status__hint {
  color: $color-gray-base-200;
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  line-height: 20px;
}

.protection-status__hint.danger {
  cursor: pointer;
  color: $color-blue-accent;
}
</style>
