<template>
  <div
    v-if="steps"
    class="pagination"
  >
    <div
      class="pagination__button"
      :class="currentStep <= 1 ? 'disabled' : 'active'"
      @click="prev"
    >
      <img src="@/assets/images/prev.svg" alt="prev">
    </div>
    <div class="pagination__steps">
      <div
        v-for="step in steps"
        :key="step"
        class="pagination__step"
        :class="{ 'active': step === currentStep }"
        @click="setStep(step)"
      />
    </div>
    <div
      class="pagination__button"
      :class="currentStep >= steps ? 'disabled' : 'active'"
      @click="next"
    >
      <img src="@/assets/images/next.svg" alt="next">
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pagination',

  props: {
    steps: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      currentStep: 1
    }
  },

  methods: {
    next() {
      if (this.currentStep < this.steps) {
        this.currentStep++

        this.$emit('change', this.currentStep)
      }
    },

    prev() {
      if (this.currentStep > 1) {
        this.currentStep--

        this.$emit('change', this.currentStep)
      }
    },

    setStep(step) {
      this.currentStep = step

      this.$emit('change', step)
    }
  },
}
</script>

<style lang="scss" scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 420px;
}

.pagination__button {
  width: 32px;
  height: 32px;
  padding: 6px;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 0);
}

.pagination__button.disabled {
  pointer-events: none;
  opacity: 0.3;
}

.pagination__button.active:hover {
  background: rgba($color-white-bg, 0.1);
}

.pagination__steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 20px;
}

.pagination__step {
  width: 100%;
  min-width: 50px;
  height: 4px;
  border-radius: 50px;
  margin-right: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 0);
  background: $color-sub-text-dark;
}

.pagination__step.active {
  background: $color-white-bg;
}

.pagination__step:hover {
  background: $color-sub-text-brighter;
}

.pagination__step:last-child {
  margin-right: 0;
}
</style>