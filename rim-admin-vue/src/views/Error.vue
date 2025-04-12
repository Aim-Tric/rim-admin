<template>
  <n-result status="500" title="500 服务器打了个盹" description="遇到错误了！">
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