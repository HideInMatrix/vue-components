<!--
 * @Author: David
 * @Date: 2021-09-26 09:06:22
 * @LastEditTime: 2021-09-27 14:05:37
 * @LastEditors: David
 * @Description: 下拉表格，组件参数说明
 * @FilePath: /PC/src/page/afterCourseTimeSetting/components/table.vue
 * 可以输入预定的版权声明、个性签名、空行等
-->

<template>
  <div class="table-wrap">
    <table class="table-main" cellspacing="0" cellpadding="0" border="0">
      <thead v-for="(tr, trIndex) in hearderTable" :key="trIndex">
        <tr class="table-tr">
          <th
            v-for="(th, index) in tr.columns"
            :key="index"
            class="table-th"
            :style="{
              textAlign: th.align ? `${th.align}` : 'unset',
              minWidth: th.minWidth ? `${th.minWidth}px` : '',
              maxWidth: th.maxWidth ? `${th.maxWidth}px` : '',
            }"
            :width="th.width ? `${th.width}px` : `${averageWidth}px`"
          >
            <span v-if="!th.headerSlot">{{ th.title }}</span>
            <div v-else>
              <slot :name="th.headerSlot" :row="tr" :index="trIndex"></slot>
            </div>
          </th>
        </tr>
        <tr
          v-for="(tdata, dataIndex) in data"
          :key="dataIndex"
          v-show="tdata.id === tr.id"
        >
          <td
            v-for="(th, index) in tr.columns"
            :key="index"
            :class="[th.sonIndentation ? 'son-data-columns' : '']"
            :style="{
              textAlign: th.align ? `${th.align}` : '',
              borderBottom: `1px solid #eee`,
              paddingTop: `28px`,
              paddingBottom: `28px`,
            }"
          >
            <div v-for="(tsdata, tsIndex) in tdata.moreData" :key="tsIndex">
              <ul
                class="son-data-ul"
                v-if="
                  tdata.id === tr.id &&
                    Object.prototype.toString.call(tsdata[th.key]) ===
                      '[object Array]'
                "
              >
                <li
                  v-for="(ssitem, ssIndex) in tsdata[th.key]"
                  :key="ssIndex"
                  class="son-data-li"
                >
                  <div
                    v-if="
                      Object.prototype.toString.call(ssitem) ===
                        '[object Array]'
                    "
                  >
                    <div v-for="(em, emIndex) in ssitem" :key="emIndex">
                      {{ em }}
                    </div>
                  </div>
                  <div
                    :class="[th.sonIndentation ? 'son-data-item' : '']"
                    v-else
                  >
                    <span :class="[th.needDot ? 'son-data-span-dot' : '']">
                    </span>
                    {{ ssitem }}
                  </div>
                </li>
              </ul>
              <div
                v-if="
                  tdata.id === tr.id &&
                    Object.prototype.toString.call(tsdata[th.key]) !==
                      '[object Array]'
                "
              >
                <div
                  v-if="
                    Object.prototype.toString.call(tsdata[th.key]) ===
                      '[object Undefined]' &&
                      Object.prototype.toString.call(th.sonSlot) !==
                        '[object Undefined]'
                  "
                >
                  <slot
                    :name="th.sonSlot"
                    :sonRow="tsdata"
                    :sonIndex="dataIndex"
                  ></slot>
                </div>
                <div v-else>
                  {{ tsdata[th.key] }}
                </div>
              </div>
            </div>
          </td>
        </tr>
      </thead>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    /**
     * @description: 表头渲染，该表头是动态的，数据实例:{id: 1,columns:[]}
     * 表头 width:[number]:表头的宽度, slot:[string]:表头渲染, sonSlot:[string]:子表渲染, align:[string]:文字位居哪边
     * 主表(数据)sonIndentation:[boolean]:子表数据首行缩进, needDot:[boolean]:字表数据时候需要在文字首行加点
     * @Date: 2021-09-27 09:55:24
     * @Author: David
     */
    hearderTable: {
      type: Array,
      default: () => {
        return []
      },
    },

    /**
     * @description: 数据
     * @Date: 2021-09-27 09:56:08
     * @Author: David
     */
    data: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      sumWidth: 0, //平均宽度
      count: 0, //未被分配宽度的个数
      averageWidth: 0, //平均宽度
    }
  },
  beforeMount() {
    let sum = 0,
      count = 0
    this.hearderTable[0].columns.forEach((column) => {
      if (column.width) {
        sum += column.width
        count++
      }
    })
    this.averageWidth = Math.floor(sum / count)
  },
}
</script>

<style lang="scss" scoped>
.table-main {
  width: calc(100%);
}

.table-tr {
  background-color: #f7f8fa;
  .table-th {
    padding: 12px 0;
  }
}
.son-data-columns {
  padding-left: 18px;
}
.son-data-ul {
  .son-data-li {
    list-style: none;
    .son-data-item {
      padding-left: 10px;
    }
    .son-data-span-dot {
      position: relative;
    }
    .son-data-span-dot::before {
      content: '';
      position: absolute;
      width: 6px;
      height: 6px;
      background-color: #000;
      border-radius: 50%;
      left: -10px;
      top: 50%;
      transform: translate(0, -50%);
    }
  }
}
</style>
