<template>
  <n-layout>
    <n-layout-header :inverted="inverted" :bordered="bordered">
      <div :style="`min-height: ${layoutHeaderHeight}px`">

      </div>
    </n-layout-header>
    <n-layout has-sider>
      <n-layout-sider :bordered="bordered" collapse-mode="width" :collapsed-width="64" :width="240" show-trigger
        :inverted="inverted">
        <n-menu :inverted="inverted" :collapsed-width="64" :collapsed-icon-size="22" :options="menuOptions" />
      </n-layout-sider>
      <n-layout>
        <n-layout-content :content-style="mainBodyStyle">
          <RouterView />
        </n-layout-content>
        <n-layout-footer :inverted="inverted" :bordered="bordered">
          <div :style="`min-height: ${layoutFooterHeight}px`">

          </div>
        </n-layout-footer>
      </n-layout>
    </n-layout>
  </n-layout>
</template>

<script lang="ts" setup>
import { RouterView } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import type { Component } from 'vue'
import {
  BookOutline as BookIcon,
  PersonOutline as PersonIcon,
  WineOutline as WineIcon
} from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import { reactive, h, ref, computed } from 'vue'

// 布局高度默认配置
const bordered = ref(true)
const layoutHeaderHeight = ref(64)
const layoutFooterHeight = ref(64)
const mainBodyStyle = computed(() => {
  const otherHeight = bordered.value ? 2 : 0
  return `min-height: calc(100vh - ${layoutHeaderHeight.value + layoutFooterHeight.value + otherHeight}px)`
})

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = reactive([
  {
    label: '且听风吟',
    key: 'hear-the-wind-sing',
    icon: renderIcon(BookIcon)
  },
  {
    label: '1973年的弹珠玩具',
    key: 'pinball-1973',
    icon: renderIcon(BookIcon),
    disabled: true,
    children: [
      {
        label: '鼠',
        key: 'rat'
      }
    ]
  },
  {
    label: '寻羊冒险记',
    key: 'a-wild-sheep-chase',
    disabled: true,
    icon: renderIcon(BookIcon)
  },
  {
    label: '舞，舞，舞',
    key: 'dance-dance-dance',
    icon: renderIcon(BookIcon),
    children: [
      {
        type: 'group',
        label: '人物',
        key: 'people',
        children: [
          {
            label: '叙事者',
            key: 'narrator',
            icon: renderIcon(PersonIcon)
          },
          {
            label: '羊男',
            key: 'sheep-man',
            icon: renderIcon(PersonIcon)
          }
        ]
      },
      {
        label: '饮品',
        key: 'beverage',
        icon: renderIcon(WineIcon),
        children: [
          {
            label: '威士忌',
            key: 'whisky'
          }
        ]
      },
      {
        label: '食物',
        key: 'food',
        children: [
          {
            label: '三明治',
            key: 'sandwich'
          }
        ]
      },
      {
        label: '过去增多，未来减少',
        key: 'the-past-increases-the-future-recedes'
      }
    ]
  }
])

const inverted = ref(false)

</script>