<template>
  <div class="home">
    <SiteStatus />
    <ApikeyStatus />
    <ScamReport />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import ScamReport from '../components/ScamReport.vue'
import SiteStatus from '../components/SiteStatus.vue'
import ApikeyStatus from '../components/ApikeyStatus.vue'

export default Vue.extend({
  name: 'Home',

  components: {
    ScamReport,
    SiteStatus,
    ApikeyStatus
  },
})
</script>

<style lang="scss" scoped>
.home {
  opacity: 0;
  animation: fadeIn 0.5s 0.2s forwards;
}
</style>
