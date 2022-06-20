<template>
    <div class="wechat-voice-wrapper">
        <audio ref="wechatVoice" src="http://f3.htqyy.com/gedan/play9/2027/mp3/6">
            Your browser does not support the
            <code>audio</code>
            element.
        </audio>
        <div class="voice-play-wrapper" @click="playMusic()">
            <div class="play-wrapper">
                <div class="wifi-symbol" ref="playing"></div>
                <div class="audio-time">{{ audioDuration }}</div>
            </div>
            <div class="red-btn" v-show="!isRead"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: "wechatVoice",
    props: {
        audioSrc: {
            type: String,
            default: () => "",
        },
        // isRead: {
        //     //是否显示小红点
        //     type: String | Boolean,
        //     default: false,
        // },
    },
    data() {
        return {
            audioDuration: 0,
        };
    },

    mounted() {
        let audio = this.$refs.wechatVoice;
        audio.onended = () => {
            //播放完了就关闭动画
            this.$refs.playing.classList.remove("playing");
        };
        audio.onloadedmetadata = () => {
            this.audioDuration = parseInt(audio.duration);
        };
    },
    methods: {
        playMusic() {
            let audio = this.$refs.wechatVoice;
            if (audio !== null) {
                //检测播放是否已暂停.audio.paused 在播放器播放时返回false.

                if (audio.paused) {
                    // 暂停播放之后再次点击就重新播放
                    // audio.load();
                    audio.play(); // 这个就是播放
                    this.$refs.playing.classList.add("playing");
                } else {
                    audio.pause(); // 这个就是暂停
                    audio.load();
                    this.$refs.playing.classList.remove("playing");
                }
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.play-wrapper {
    width: 86px;
    height: 28px;
    background: linear-gradient(180deg, #fcfcfc 0%, #eaeaea 100%);
    border-radius: 4px;
    border: 1px solid #e0e0e0;
    position: relative;
    display: flex;
    align-items: center;

    .wifi-symbol {
        background: url(data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAANgAAAA2CAYAAAClblcfAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAVhSURBVHgB7Z3dUSNHEMdbfOrNcgTei8B2BIYMIIJDLwiKh+MiMJeB74mSUBV3ERwXgZWBycB7GeAnQAhwt2vkklezq5n90Eyv/78qaqkerUp/7fRMT8+HiAAAAAAAAACgOpeXl3vUQurWtUEAeDIaja43NjZ+H4/Hb6lFNKGrQwB4IJXw9fX1aMF0OBgMbkg5TemCgwFnLJVQuJvNZvtnZ2e3pJQmdcHBgBM8Nkk4fPqD/+1ZitOdnZ2f+/3+HSmjaV0YgwEnTk9PU2nR+V9bZUum0+k1KaRpXejBgBeSZZNEQE6x2vFYU7rQgwEvuMWf8OV9TvE10yOFNKULDga84db8N77YWvTew8PDOSmlCV1wMFAKHvz3yTJu4TDrndZeTKhbFxysJMPh8IBaiKsuk1n7YCmKshcLpQsOVgKZN+HLl6urq1+pRfjqMiFVmrXH1ouF1AUH82RxUvLl5eWiLU5WVhe/Nq+1j6KHD60LDuaBbcZfHpr2cLGKrm63K0mBpTHL5uZm8HWKMeiCgzkiM/78sPZyiq+lnBRSVZeMWbjSfsza5T1Dhomx6IKDOSIz/vyFy4x/ainuccumMlSsSdfEZry/v9+jQMSiCw7mwcJDWwodJBTRukeqqi4zSWtLbRfe1zQx6IKDeSIPjS99W1mn01E7FquqiyvyV8t9v1BgQuuCg5VA1qXxlzzJ2tn2VvMkaxVd3CPcWswJRUBIXXCwkjw/P+elcX8ixZTVtbW1NbHdNx6Pf6AICKVrizwxcWvCf6mJUVuBry55Dad7JT7/TwvI8bk8sJX3r4t16eIKfMevWbI/Pj5+z5dvVDNadDk7mNmYJsv5k7mNP/CNrN3SuNFuThVdEnZwCHGQsf1IEbBuXTLW4fe3vVfCl1uqCW26nEPErCjDgdaNdnOq6OIB8DeLLaEICKQrzRq4ItY6JtWmy8nBFrpjGwdaB/ZVdXFrGGXPDV12Quhy7cGSokKOU78jnSRFhdAVHUlRYYy6XB0sLSrkWfG/SCdpUeEqXVxui99j+C7SosIGdSVZQ829RlpUGKMuJweTDIxtHkGQVcdakxxVdfGXbEvxphSYELrywjP+HLXVDY26nJMc29vbhyzi84JJFkN+YNEXpJiyukajkTysJGvneycUAevW9fT0lNjsfF+tja82Xc5petM6HLFHn/PkXK/b7d5pTs/PqaDrnc3ILVttKekqrFsX9w6JzV73gaTadHlPNBsx6h0ri48usxXiKGtn28SsfYuGdemSbRxcWbPmxhobLbqwVKoEeefn8cP4TIqposu2AJbvq30FRxlC6oKDeWLOd0gsRbJk5xMppYous3lxKYHAFfGGAhNal3eI+H9Fskk84P2St0t2NpsdkkJq0rWXY59QIGLRBQdzQFqy6XRqW6LzD5LF0vjrInXpktOWLObbUOPRmHQhRHTA7Iy1xutmoHxBCqlDl1m+tBRG2c6zWBcx6YKDOSIPJXuUl6R4d3d3VYaGc6rqKjhlaUIBiUUXHMyDxYcmLSRPeu63YS6wrC5p5W3pb67In2KYrohBV4eAN/IA2rTZdI6vruFw+CfZV0e8iWk+MKQuOBgohZyQK4d4Zu3Syh8fH/dJKXXrQogIvJEsna0SCjlnX6igCV1wMODFwpb9Jcyi25QU0pQuhIjAGZm85fkl+cHwxFKcDgaDN6SQJnWhBwNOmJURRZO3+6SQpnXBwcBK5pUwZ8Oi8F5jaLgOXXAwsBKZO+JB/ldbmYxPzA/WqWMdujAGA85wIuCCEwH//ioJt/wfT05Ozkk5TeqCgwEv5pWxLc41p626gEK0/kzTKtqqCwAAAAAARMXfAGgkMraIVUYAAAAASUVORK5CYII=)
            right 0 no-repeat;
        width: 18px;
        height: 18px;
        background-size: 400%;
        margin-left: 11px;
    }
    .playing {
        animation-name: voicePlay;
        animation-duration: 1s;
        animation-direction: normal;
        animation-iteration-count: infinite;
        animation-timing-function: steps(3);
    }
    @keyframes voicePlay {
        0% {
            background-position: 0;
        }
        100% {
            background-position: 100%;
        }
    }
    .audio-time {
        margin-left: 6px;
        font-size: 12px;
        font-weight: 500;
        color: #999999;
    }
}
.play-wrapper::before {
    content: "";
    position: absolute;
    border-style: solid;
    border-width: 6px 6px 6px 6px;
    border-color: transparent #eaeaea transparent transparent;
    width: 0px;
    height: 0px;
    top: 50%;
    transform: translateY(-50%);
    left: -12px;
    z-index: 1;
}
.play-wrapper::after {
    content: "";
    position: absolute;
    border-style: solid;
    border-width: 7px 7px 7px 7px;
    border-color: transparent #e0e0e0 transparent transparent;
    width: 0px;
    height: 0px;
    top: 50%;
    transform: translateY(-50%);
    left: -14px;
    z-index: 0;
}

.voice-play-wrapper {
    display: flex;
    align-items: center;
    // gap: 6px;
    .red-btn {
        width: 6px;
        height: 6px;
        background: #ff5555;
        border-radius: 50%;
        margin-left: 6px;
    }
}
</style>
