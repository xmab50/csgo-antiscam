<template>
  <div class="scam-report">
    <p class="scam-report__title app-title">
      {{ $t('scamReport.title') }}
    </p>

    <form
      class="scam-report__form"
      @submit.prevent="submit"
    >
      <input
        class="scam-report__form__field"
        v-model="reportUrl"
        :placeholder="$t('scamReport.placeholder')"
      />
      <button class="scam-report__form__btn">
        {{ $t('scamReport.report') }}
      </button>
    </form>

    <div
      class="scam-report__message"
      :class="hintConfig.class"
    >
      {{ hintConfig.text }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'
import { required, minLength } from 'vuelidate/lib/validators'
import { url } from '@/utils/validators'
import { validationMixin } from '@/mixins/validation.mixin'

import { hintConfig } from '@/types';

const VALIDATION_LOCALIZE_PATH = 'scamReport'

export default Vue.extend({
  name: 'ScamReport',

  data () {
    return {
      reportUrl: '',
      loadFailed: false,
      showHint: false,
      VALIDATION_LOCALIZE_PATH,
    }
  },

  mixins: [validationMixin],

  validations: {
    reportUrl: {
      required,
      minLength: minLength(2),
      url,
    },
  },

  computed: {
    hintConfig () {
      const config: hintConfig = {
        class: '',
        text: '',
      }

      const fieldError = this.getFieldErrorMessage('reportUrl')

      if (fieldError) {
        config.text = fieldError
      } else {
        config.text = this.loadFailed ? this.$t('scamReport.reportUrl.wrong') : this.$t('scamReport.reportUrl.thx')
      }

      if (!this.showHint) {
        return config
      }

      if (fieldError) {
        config.class = 'error'
      } else {
        config.class = this.loadFailed ? 'error' : 'success'
      }

      return config
    },
  },

  methods: {
    ...mapActions(['sendAnalyticsEvent', 'sendReport']),

    async submit (): Promise<void> {
      if (this.$v.$invalid) {
        this.$v.$touch()

        this.showHint = true
        setTimeout(() => {
          this.showHint = false
        }, 2000)

        this.sendAnalyticsEvent({
          event: 'extension_website_reported',
          data: {
            successful: false,
          },
        })

        return
      }

      this.sendAnalyticsEvent({
        event: 'extension_website_reported',
        data: {
          successful: true,
        },
      })

      const response = await this.sendReport({ reportUrl: this.reportUrl })
      const { result } = response.data || {}

      if (result?.insertedId) {
        this.loadFailed = false
      } else {
        this.loadFailed = true

        this.sendAnalyticsEvent({
          event: 'extension_website_reported',
          data: {
            successful: false,
          },
        })
      }

      this.showHint = true
      setTimeout(() => {
        this.showHint = false
      }, 2000)
    },
  },
})
</script>

<style lang="scss" scoped>
.scam-report__title {
  font-size: 18px;
  margin: 0 0 12px;
}

.scam-report__form {
  display: flex;
  width: 100%;
}

.scam-report__form__field {
  font-size: 16px;
  line-height: 22px;
  color: $color-text;
  height: 38px;
  background: $color-dark-bg;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  width: 100%;
  outline: none;
  box-sizing: border-box;
}

.scam-report__form__btn {
  color: rgba($color-text, .5);
  font-size: 12px;
  line-height: 20px;
  font-weight: 400;
  text-transform: uppercase;
  height: 38px;
  width: 100%;
  min-width: 110px;
  max-width: 110px;
  border-radius: 4px;
  background-color: rgba($color-purple-500, .5);
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;

  margin-left: 8px;
}

.scam-report__form__btn:hover {
  background-color: $color-purple-500;
  color: $color-text;
}

.scam-report__form__btn:active {
  background: $color-blue-accent;
}

.scam-report__message {
	font-size: 13px;
	text-align: center;
	width: 100%;
	margin-top: 3px;

	opacity: 0;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scam-report__message.success {
  color: $color-success;
  opacity: 1;
}

.scam-report__message.error {
  color: $color-error;
  opacity: 1;

  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.scam-report__message.shown {
  opacity: 1;
}
</style>
