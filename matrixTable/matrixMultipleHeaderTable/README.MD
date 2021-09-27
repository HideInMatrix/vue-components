![image](https://user-images.githubusercontent.com/21361701/134881603-2fc879dc-22e2-4931-84a6-831adc378b49.png)
完成如上图的工作

使用实例：
``` vue

<template>
      <matrix-table :hearderTable="tableHeader" :data="tableData">
        <template v-slot:enable="{ row, index }">
          <div style="display:flex;align-items:center;justify-content:center;">
            <span style="margin-right:10px;">是否启用</span>
            <i-Switch
              v-model="row.switchValue"
              @on-change="change(row, index)"
            />
          </div>
        </template>
        <template v-slot:action="{ row, index }">
          <Button
            type="text"
            style="color:  #5979EA;"
            @click="editPlaneModal = true"
            >编辑</Button
          >
          <Button type="text" style="color:  #5979EA;margin-right:74px"
            >删除</Button
          >
          <Icon
            type="ios-arrow-down"
            style="cursor: pointer;transition: transform 0.4s ease-in-out;"
            :class="[row.ayncLoad ? 'rotate-180-deg' : 'rotate-360-deg']"
            @click="toMoreData(row, index)"
          />
        </template>

        <template v-slot:sonAction="{ sonRow, sonIndex }">
          <Button
            type="text"
            @click="addTime(sonRow, sonIndex)"
            style="color:  #5979EA;"
            >添加时间</Button
          >
          <Button
            type="text"
            style="color:  #5979EA;"
            @click="editTimeModal = true"
            >编辑</Button
          >
          <Button type="text" style="color:  #5979EA;">删除</Button>
        </template>
      </matrix-table>

</template>
<script>
      data(){
        tableHeader: [
        {
          id: 1,
          columns: [
            {
              title: '夏季课后安排',
              key: 'grade',
              align: 'center',
              sonIndentation: true,
              width: 220,
            },
            {
              title: '安排时间',
              key: 'week',
              align: 'left',
              needDot: true,
              sonIndentation: true,
              width: 280,
            },
            { title: '基本服务', key: 'time', align: 'center' },
            { title: '延时服务', key: 'delayTime', align: 'center' },
            {
              title: '是否启用',
              key: 'enable',
              headerSlot: 'enable',
              switchValue: true,
              align: 'center',
            },
            {
              headerSlot: 'action',
              sonSlot: 'sonAction',
              align: 'center',
              width: 285,
              ayncLoad: false,
            },
          ],
        },
        {
          id: 2,
          columns: [
            { title: '夏季课后安排', key: 'grade', align: 'center' },
            { title: '安排时间', key: 'week', align: 'left', needDot: true },
            { title: '基本服务', key: 'time', align: 'center' },
            { title: '延时服务', key: 'delayTime', align: 'center' },
            {
              title: '是否启用',
              key: 'enable',
              headerSlot: 'enable',
              switchValue: true,
              align: 'center',
            },
            { headerSlot: 'action', sonSlot: 'sonAction', align: 'center' },
          ],
        },
        {
          id: 3,
          columns: [
            { title: '夏季课后安排', key: 'grade', align: 'center' },
            { title: '安排时间', key: 'week', align: 'left', needDot: true },
            { title: '基本服务', key: 'time', align: 'center' },
            { title: '延时服务', key: 'delayTime', align: 'center' },
            {
              title: '是否启用',
              key: 'enable',
              headerSlot: 'enable',
              switchValue: true,
              align: 'center',
            },
            { headerSlot: 'action', sonSlot: 'sonAction', align: 'center' },
          ],
        },
      ],
      tableData: [
                {
                grade: '初3年级',
                week: ['1,2,3,4', '5'],
                time: ['4:40-5:30', '3:40-4:30'],
                delayTime: ['6:00-8:00', '5:00-6:00'],
              },
      ],
      }
</script>
```

      

      
      
