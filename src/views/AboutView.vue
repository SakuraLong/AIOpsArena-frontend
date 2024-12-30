<script setup lang="ts">
import { message } from '@/utils/utils'
import { MapTree } from './tree'
import { ref, onMounted } from 'vue'

const mycanvas = ref()
const x = ref('')
const y = ref('')
const w = ref('')
const h = ref('')
const id = ref('')
const xORy = ref('')
const angle = ref('')

const amount = 1000
const size = 1000

const mapTree = new MapTree(size, 2)

onMounted(() => {
  const ctx = mycanvas.value.getContext('2d')
  ctx.translate(size / 2, size / 2)
  mapTree.setCtx(ctx)
  const from = Date.now()
  randomAdd(amount, size, 40, 20)
  // mapTree.add(200, 200, 50, 50)
  // mapTree.add(400, 400, 10, 10)
  mapTree.draw()
  console.log(Date.now() - from)
})

function addNode() {
  const ux = parseInt(x.value)
  const uy = parseInt(y.value)
  const uw = parseInt(w.value)
  const uh = parseInt(h.value)

  if (Number.isNaN(ux) || Number.isNaN(uy) || Number.isNaN(uw) || Number.isNaN(uh)) {
    message('请输入数字')
    return
  }

  x.value = ''
  y.value = ''
  w.value = ''
  h.value = ''

  mapTree.add(ux, uy, uw, uh)

  mapTree.draw()
}

function deleteNode() {
  const uid = parseInt(id.value)
  if (Number.isNaN(uid)) {
    message('请输入数字')
    return
  }

  id.value = ''

  mapTree.remove(uid)

  mapTree.draw()
}

function addLine() {
  const uxORy = parseInt(xORy.value)
  const uAngle = parseInt(angle.value)

  if (Number.isNaN(uxORy) || Number.isNaN(uAngle)) {
    message('请输入数字')
    return
  }

  // if (uAngle < 0 || uAngle > 180) {
  //   message('角度在0~180之间')
  //   return
  // }

  xORy.value = ''
  angle.value = ''

  mapTree.addLine(uxORy, uAngle)

  mapTree.draw()
}

function randomAdd(amount: number, size: number, w: number, h: number) {
  const wx = size - w * 2
  const hy = size - h * 2
  for (let i = 0; i < amount; i++) {
    const x = Math.floor(Math.random() * wx - wx / 2)
    const y = Math.floor(Math.random() * hy - hy / 2)
    const uw = Math.floor(Math.random() * w)
    const uy = Math.floor(Math.random() * h)
    mapTree.add(x, y, uw, uy)
  }
  mapTree.draw()
}
</script>

<template>
  <div class="about">
    <canvas
      ref="mycanvas"
      :width="size"
      :height="size"
    />
    <div class="about-container">
      <el-input
        v-model="x"
        style="width: 240px"
        placeholder="Please input x"
      />
      <el-input
        v-model="y"
        style="width: 240px"
        placeholder="Please input y"
      />
      <el-input
        v-model="w"
        style="width: 240px"
        placeholder="Please input w"
      />
      <el-input
        v-model="h"
        style="width: 240px"
        placeholder="Please input h"
      />
      <el-button
        type="primary"
        plain
        @click="addNode"
      >添加</el-button>
      <hr>
      <el-input
        v-model="id"
        style="width: 240px"
        placeholder="Please input id"
      />
      <el-button
        type="danger"
        plain
        @click="deleteNode"
      >删除</el-button>
      <hr>
      <el-input
        v-model="xORy"
        style="width: 240px"
        placeholder="Please input xORy"
      />
      <el-input
        v-model="angle"
        style="width: 240px"
        placeholder="Please input angle"
      />
      <el-button
        type="primary"
        plain
        @click="addLine"
      >添加</el-button>
    </div>
  </div>
</template>

<style>
.about {
  display: flex;
  gap: 20px
}
.about-container {
  display: flex;
  gap: 10px;
  flex-direction: column;
}
/* canvas {
  width: 1000px;
  height: 1000px;
} */
/* @media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
} */
</style>
