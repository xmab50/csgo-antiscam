<template>
  <div class="faq">
    <div class="faq__container">
      <h2 class="faq__title">{{ $t("faq.frequentlyAskedQuestions.title") }}</h2>

      <p>{{ $t("faq.frequentlyAskedQuestions.text1") }}</p>
      <p>{{ $t("faq.frequentlyAskedQuestions.text2") }}</p>

      <h3 class="faq__sub-title">{{ $t("faq.whatNeedToKnow.title") }}</h3>

      <ul>
        <li>
          <b class="faq__accent">
            {{ $t("faq.whatNeedToKnow.protectionFakeSites.accent") }}
          </b>
          <span>{{ $t("faq.whatNeedToKnow.protectionFakeSites.text") }}</span>

          <img
            class="faq__img"
            src="https://lh5.googleusercontent.com/1vuHwPJWngrsLum6gWWRQxSszi9eq9CEjR-togBvUssx2kyj2oct9W_3Byf_urvjAizHxAvMBCkDV13vW4jSlL82vT0uc8yPU5FZmjtwBHYRZ6hm4yg1-QtkIFr_JcjtVPLba7AR"
            alt="faq__img"
          />
        </li>
        <li>
          <b class="faq__accent">
            {{ $t("faq.whatNeedToKnow.protectionApiKey.accent") }}
          </b>
          <span>{{ $t("faq.whatNeedToKnow.protectionApiKey.text") }}</span>

          <img
            class="faq__img"
            src="https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F448d611e-2031-47e3-9f19-1512473ece67%2F__12.png?table=block&id=c26d3ebb-d11e-4602-957e-22b7a50edf60&width=860&cache=v2"
            alt="faq__img"
          />
        </li>
        <li>
          <b class="faq__accent">
            {{ $t("faq.whatNeedToKnow.liveAnalysis.accent") }}
          </b>
          <span>{{ $t("faq.whatNeedToKnow.liveAnalysis.text") }}</span>

          <img
            class="faq__img"
            src="https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Ffa3b3dd1-0369-47e4-942c-1947fb908c2c%2F__10_.png?table=block&id=b2b24534-afe0-4c3a-98ae-8256f5bf3e30&width=960&cache=v2"
            alt="faq__img"
          />
          <img
            class="faq__img"
            src="https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F81d867c8-bb99-4933-94b7-856dbe826977%2F__10.png?table=block&id=ed2e31ff-6863-4eeb-b451-5dcb1b3d4ead&width=960&cache=v2"
            alt=""
          />
        </li>
        <li>
          <b class="faq__accent">
            {{ $t("faq.whatNeedToKnow.foundScamSite.accent") }}
          </b>
          <span>{{ $t("faq.whatNeedToKnow.foundScamSite.text") }}</span>

          <img
            class="faq__img"
            src="https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F08b83259-47dc-4b06-8464-123abe8a91db%2F__11.png?table=block&id=811145b3-bea5-452d-82c8-c6f868f062b7&width=690&cache=v2"
            alt="faq__img"
          />
        </li>
      </ul>

      <h3 class="faq__sub-title">{{ $t("faq.extensionWork.title") }}</h3>
      <p>
        <i>{{ $t("faq.extensionWork.text") }}</i>
      </p>

      <h3 class="faq__sub-title">{{ $t("faq.mobileVersion.title") }}</h3>
      <p>
        <i>{{ $t("faq.mobileVersion.text") }}</i>
      </p>

      <h3 class="faq__sub-title">{{ $t("faq.aboutPersonalInfo.title") }}</h3>
      <p>
        <i>{{ $t("faq.aboutPersonalInfo.text") }}</i>
      </p>

      <h3 class="faq__sub-title">{{ $t("faq.whyIsItNeeded.title") }}</h3>
      <p>
        <i>{{ $t("faq.whyIsItNeeded.text") }}.</i>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: "Faq",
})
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
}

body, body * {
  font-family: $font-family;
}
</style>
<style lang="scss" scoped>
.faq {
  background: $color-darker-bg;
  color: $color-sub-text-brighter;
  line-height: 1.6;
  font-size: 17px;
  display: flex;
  justify-content: center;
}

.faq__container {
  width: 760px;
  margin: 100px 0;
}

.faq__title {
  color: $color-text;
  line-height: 1.6;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 34px;
}

.faq__sub-title {
  color: $color-text;
  line-height: 1.6;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 20px;
}

.faq__img {
  max-width: 700px;
  margin-top: 16px;
  margin-bottom: 32px;
}

.faq__accent {
  margin-right: 5px;
}
</style>
