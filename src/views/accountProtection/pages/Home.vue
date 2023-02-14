<template>
  <div class="home">
    <header class="home__header">
      <p class="home__subtitle">{{ $t('accountProtection.home.subtitle') }}</p>
      <h1 class="home__title app-title">{{ $t('accountProtection.home.title') }}</h1>
    </header>

    <main class="home__content">
      <section
        v-for="(paragraph, index) in paragraphs"
        :key="index"
        class="home__section app-paragraph"
      >
        <i18n
          class="home__section_text app-paragraph__text"
          :path="`accountProtection.home.paragraphs.${paragraph}.text`"
          tag="div"
        >
          <template #accent>
            <h3 class="home__section_title app-paragraph__accent">
              {{ $t(`accountProtection.home.paragraphs.${paragraph}.accent`) }}
            </h3>
          </template>
        </i18n>
      </section>

      <section class="home__section app-paragraph home__buttons">
        <button
          class="home__button app-button primary"
          @click="$emit('onProtectAccount')"
        >
          {{ $t('accountProtection.home.button.protectAccount') }}
        </button>
        <button
          class="home__button app-button secondary"
          @click="$emit('onDisableApiScam')"
        >
          {{ $t('accountProtection.home.button.useApi') }}
        </button>
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { messages } from '@/i18n/messages';

export default Vue.extend({
  name: 'Home',

  data (): any {
    return {
      messages
    }
  },

  computed: {
    paragraphs (): Array<string> {
      const paragraphs = this.messages.en.accountProtection.home.paragraphs
      const paragraphsKeys = Object.keys(paragraphs)

      return paragraphsKeys
    }
  }
})
</script>

<style lang="scss" scoped>
.home__subtitle {
  color: $color-error;
  font-size: 13px;
  margin: 0 0 12px;
}

.home__title {
  font-size: 24px;
  margin: 0;
}

.home__header {
  text-align: center;
  font-weight: 500;
  line-height: 1;
  margin-bottom: 32px;
}

.home__buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 28px 0 0;
}

.home__buttons .home__button:first-child {
  margin-right: 10px;
}
</style>
