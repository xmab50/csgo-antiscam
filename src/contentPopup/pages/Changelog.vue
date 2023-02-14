<template>
  <div
    v-if="showChangelog"
    class="changelog"
  >
    <div class="changelog__header">
      <button
        class="changelog__close-button"
        @click="closeChangelog"
      >
        <img
          class="changelog__close-button-img"
          src="@/assets/images/close.svg"
          alt="close"
        >
      </button>
    </div>

    <div class="changelog__container">
      <h2 class="changelog__title"> {{ $t('changelog.title') }} </h2>

      <div class="changelog__subtitle-wrapper">
        <h4 class="changelog__subtitle"> {{ $t('changelog.subtitle') }} </h4>
        <img
          class="changelog__subtitle-img"
          src="@/assets/images/thinking-face.svg"
          alt="whats-new"
        >
      </div>

      <p class="changelog__version">
        {{ $t('changelog.version', { version: appVersion }) }}
      </p>

      <ul class="changelog__list">
        <li
          v-for="item in changeList"
          :key="item"
          class="changelog__list-item"
        >
          &nbsp; &nbsp; {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapMutations } from 'vuex'

export default Vue.extend({
  name: 'Changelog',

  data () {
    return {
      showChangelog: false,
      changeList: [],
    }
  },

  computed: {
    ...mapGetters(['getStorage', 'appVersion']), 
  },

  methods: {
    ...mapMutations(['setStorage']), 

    closeChangelog (): void {
      this.showChangelog = false
    },
  },

  async created () {
    const changelogSettings = await this.getStorage('changelogSettings')

    if (changelogSettings?.isShow) {
      this.showChangelog = true
      this.changeList = changelogSettings.changeList

      this.setStorage({
        name: 'changelogSettings',
        value: {
          isShow: false,
        },
      })
    }
  },
})
</script>

<style lang="scss" scoped>
.changelog {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: calc(100% - 60px);
	background: #31343b;
	color: #fff;
}

.changelog__wrapper--hidden {
  display: none;
}

.changelog__header {
  padding: 16px 16px 0 16px;
  display: flex;
}

.changelog__container {
  padding: 0 28px 28px 28px;
}

.changelog__close-button {
  background: none;
  border: none;
  cursor: pointer;
  margin: 0 0 0 auto;
}

.changelog__close-button-img {
  width: 20px;
}

.changelog__title {
  text-align: center;
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  margin-bottom: 27px;
}

.changelog__subtitle {
  font-size: 14px;
  font-weight: 400;
  margin: 0;
}

.changelog__subtitle-wrapper {
  display: flex;
  align-items: center;
}

.changelog__version {
  font-size: 14px;
  color: #c1c2c4;
  margin: 15px 0;
}

.changelog__list {
  font-size: 14px;
  list-style: none;
  color: #c1c2c4;
  padding: 0;
  margin: 0;
}
</style>
