<template>
  <div
    v-if="!signed"
    class="signin"
  >
    <div class="signin__container">
      <div class="signin__logo-wrapper">
        <img src="@/assets/images/steam_logo.svg" alt="steam-logo">
      </div>
      <div class="signin__header">
        <h4 class="signin__title">
          {{ $t('signin.title') }}
        </h4>
        <p class="signin__description">
          {{ $t('signin.description') }}
        </p>
      </div>
      <button
        class="signin__button"
        @click="onSignin"
      >
        {{ $t('signin.button') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Signin',

  methods: {
    onSignin () {
      window.open('https://steamcommunity.com/login', '_blank')
    }
  },
})
</script>

<style lang="scss" scoped>
  .signin {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100% - 60px);

    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 140px 20px 189px;
    box-sizing: border-box;
    background-color: $color-bg;
    opacity: 0;
    animation: fadeIn 0.5s 0.2s forwards;
  }

  .signin__container {
    width: 100%;
  }

  .signin__header {
    margin: 20px 0 40px;
  }

  .signin__title {
    font-size: 18px;
    line-height: 26px;
    margin: 0px 0 4px;
    font-weight: 400;
  }

  .signin__description {
    font-size: 16px;
    line-height: 22px;
    font-weight: 400;
    margin: 0;
    color: $color-gray;
  }

  .signin__button {
    background-color: $color-purple-500;
    color: $color-text;
    padding: 10px 12px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    border: none;
    text-align: center;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-size: 12px;
    line-height: 20px;
    font-weight: 400;
    cursor: pointer;
  }

  .steam-logo {
    width: 52px;
    height: 52px;
  }
</style>
