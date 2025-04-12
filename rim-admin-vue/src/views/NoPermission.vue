<template>
  <n-result status="403" title="403 无权限访问" description="权限不足，请与网站管理员确认！">
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