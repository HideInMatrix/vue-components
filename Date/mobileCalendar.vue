<template>
    <van-action-sheet
        v-model="$attrs.show"
        :lock-scroll="false"
        :close-on-click-action="true"
        @open="openActionSheet"
        @click-overlay="closeActionSheet"
    >
        <div class="content">
            <van-picker
                :key="$attrs.dkey"
                show-toolbar
                :title="title"
                @cancel="closeActionSheet"
                @confirm="getSelectedDate"
                @change="selectChange"
                :columns="columns"
                :cancel-button-text="$attrs.cancelText || '取消'"
            />
        </div>
    </van-action-sheet>
</template>

<script>
import { Picker, ActionSheet } from "vant";
export default {
    name: "date-hours-picker",
    inheritAttrs: false,
    props: {
        title: {
            type: String,
            default: () => "发布时间",
        },
    },
    components: {
        [Picker.name]: Picker,
        [ActionSheet.name]: ActionSheet,
    },
    data() {
        return {
            columns: [],
            dateMap: new Map(), //年月日对应面板值
        };
    },
    watch: {
        show(newVal, oldVal) {
            if (newVal) {
            }
        },
    },
    methods: {
        /**
         * @description: 载入新的天数
         * @param {*} startMonth
         * @param {*} willMonth 将要渲染未来的几个月
         * @return {*}
         * @Date: 2022-06-10 14:20:45
         * @Author: David
         */
        generateCalendar(startMonth, willMonth = 3) {
            let today = this.getNewDate(new Date());
            // let today = this.getNewDate(new Date("2022-12-31"));
            let month = { values: [], defaultIndex: 0 };
            let timeSection = 3; // 今天明天后天剩余
            let year = today.year;
            let monthIndex = today.month;
            let day = today.day;

            while (month.values.length < willMonth) {
                let daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
                for (let j = day; j <= daysInMonth; j++) {
                    if (timeSection > 0) {
                        let str = this.generateStrWithDay(timeSection);
                        month.values.push(str);
                        let date = this.$utils.dateFormat(new Date(year, monthIndex, j), "yyyy年MM月dd日");
                        this.recordTime(str, date);
                        timeSection--;
                    } else {
                        let str = `${monthIndex + 1}月${j}日`;
                        month.values.push(str);
                        let date = this.$utils.dateFormat(new Date(year, monthIndex, j), "yyyy年MM月dd日");
                        this.recordTime(str, date);
                    }
                }
                monthIndex++;
                if (monthIndex > 12) {
                    year++;
                    monthIndex = 1;
                }
                day = 1;
            }

            let hours = { values: [], defaultIndex: 1 };
            for (let i = 0; i < 24; i++) {
                hours.values.push(`${i}时`);
                if (i === today.hour) hours.defaultIndex = i;
            }
            let minutes = { values: [], defaultIndex: 1 };
            for (let i = 0; i < 60; i++) {
                minutes.values.push(`${i}分`);
                if (i === today.minute) minutes.defaultIndex = i;
            }
            this.columns = [month, hours, minutes];
        },

        generateStrWithDay(timeSection) {
            let str = "";
            switch (timeSection) {
                case 3:
                    str = "今天";
                    break;
                case 2:
                    str = "明天";
                    break;
                case 1:
                    str = "后天";
                    break;
            }
            return str;
        },

        getDate(year, month, day, hour, minute) {
            return new Date(year, month, day, hour, minute);
        },
        /**
         * @description: 记录年月日对应对日期字符串
         * @param {*} date
         * @param {*} str
         * @return {*}
         * @Date: 2022-06-10 15:12:17
         * @Author: David
         */
        recordTime(str, date) {
            this.dateMap.set(str, date);
        },
        /**
         * @description: 获取输入天的年月日时分
         * @param {*} date
         * @return {*}
         * @Date: 2022-06-09 17:56:18
         * @Author: David
         */
        getNewDate(date) {
            let year = date.getFullYear();
            let month = date.getMonth();
            let day = date.getDate();
            let hour = date.getHours();
            let minute = date.getMinutes();
            return {
                year,
                month,
                day,
                hour,
                minute,
            };
        },

        /**
         * @description: 动作框打开触发
         * @return {*}
         * @Date: 2022-06-09 17:56:10
         * @Author: David
         */
        openActionSheet() {
            this.$emit("visible", true);
            this.generateCalendar();
        },
        /**
         * @description: 动作框关闭触发
         * @return {*}
         * @Date: 2022-06-09 17:55:50
         * @Author: David
         */
        closeActionSheet() {
            this.$emit("visible", false);
            this.$emit("setTime", "");
        },
        /**
         * @description: 选中返回值处理
         * @param {*} val
         * @return {*}
         * @Date: 2022-06-09 17:55:42
         * @Author: David
         */
        getSelectedDate(val, index) {
            let day = val[0];
            let hour = val[1];
            let minute = val[2];
            let result = `${this.dateMap.get(day)} ${hour}:${minute}`;
            let toEnResult = result
                .replace("年", "/")
                .replace("月", "/")
                .replace("日", "")
                .replace("时", "")
                .replace("分", "");
            this.$emit("setTime", this.$utils.dateFormat(toEnResult, "yyyy/MM/dd HH:mm"));
            this.$emit("visible", false);
        },
        selectChange(object, val, index) {
            // console.log(object, val, index);
        },
    },
};
</script>
