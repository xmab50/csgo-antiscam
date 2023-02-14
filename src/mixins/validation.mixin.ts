import { validationMixin as vuelidate } from 'vuelidate'
import { TranslateResult } from 'vue-i18n/types';
import Vue from 'vue';

export const validationMixin = Vue.extend({
  mixins: [vuelidate],

  computed: {
    getFieldErrorMessage () {
      return ( path: string ): TranslateResult | undefined => {
        const inputValue = path.split('.').reduce((obj: any, key: string) => obj && obj[key] || null, this.$v)

        if (!inputValue.$dirty) {
          return ''
        }

        for (const rule of Object.keys(inputValue.$params)) {
          if (!inputValue[rule]) {
            return this.$t(`${this.VALIDATION_LOCALIZE_PATH}.${path}.${rule}`)
          }
        }
      }
    },
  },
})