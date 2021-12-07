<template>
  <div class="mx-precent-wrapper">
    <div class="mx-precent">
      <svg width="18px" height="18px" viewBox="0 0 18 18">
        <circle
          r="7"
          cx="9"
          cy="9"
          fill="#fff"
          stroke="#FFC858"
          stroke-width="14"
          stroke-dasharray="0 44"
          :id="`precentCircle${id}`"
        />
      </svg>
    </div>

    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      v-if="precent == 100"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M9 0C13.9706 0 18 4.02944 18 9C18 13.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9C0 4.02944 4.02944 0 9 0ZM9 1.92857C5.09456 1.92857 1.92857 5.09456 1.92857 9C1.92857 12.9054 5.09456 16.0714 9 16.0714C12.9054 16.0714 16.0714 12.9054 16.0714 9C16.0714 5.09456 12.9054 1.92857 9 1.92857ZM4.68213 9.29028L6.04583 7.92658L8.09139 9.97214L11.9552 6.1083L13.3189 7.47201L8.09139 12.6995L4.68213 9.29028Z"
        fill="#67C23A"
      />
    </svg>
  </div>
</template>

<script>
export default {
  props: {
    precent: {
      type: Number | String,
      default: 100,
    },
    id: {
      type: Number | String,
      default: 1,
    },
  },

  watch: {
    precent(newVal) {
      let pre = this.getPercent(newVal)
      this.paintingCircle(pre)
    },
  },
  mounted() {
    let pre = this.getPercent(this.precent)
    this.paintingCircle(pre)
  },

  methods: {
    /**
     * @description: 给圆填充色
     * @param {*}
     * @return {*}
     * @Date: 2021-12-07 09:10:43
     * @Author: David
     */
    paintingCircle(pre) {
      let circle = document.getElementById(`precentCircle${this.id}`)
      console.log(circle)
      circle.style['stroke-dasharray'] = `${pre} 44`
    },
    /**
     * @description: 计算百分比
     * @param {*} num 百分比
     * @return {*}
     * @Date: 2021-12-07 09:06:15
     * @Author: David
     */
    getPercent(num) {
      //圆周长
      let init = 44
      let percent = Math.round((init * num) / 100)
      console.log(percent, 'percent')
      return percent
    },
  },
}
</script>

<style lang="scss" scoped>
.mx-precent-wrapper {
  height: 18px;
  width: 18px;
  .mx-precent {
    position: relative;
    .frame {
      position: absolute;
      width: 18px;
      height: 18px;
      border: 2px solid #ffc858;
      border-radius: 50%;
      top: -1px;
      left: -1.5px;
    }
    // @keyframes fillup {
    //   to {
    //     stroke-dasharray: 44 44;
    //   }
    // }
    svg {
      transform: rotate(-90deg);
      background: #ffc858;
      border-radius: 50%;
    }
    // circle {
    //   animation: fillup 5s linear infinite;
    // }
  }
}
</style>
