<template>
  <n-result status="404" title="404 资源不存在" description="访问的页面不存在！">
    <template #footer>
      <n-button @click="goBack">返回</n-button>
    </template>
  </n-result>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter()
const goBack = () => router.go(-1)
</script>