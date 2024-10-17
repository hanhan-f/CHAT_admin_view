<template>
    <div id="from" :class="[type.isLogin_view ? 'login':'enroll']">
        <div class="tips">
            <span class="l-tip">
                <span class="type">{{type.isLogin_view ? 'Login' : 'Enroll'}}</span>
                <span class="smalltip">{{type.isLogin_view ? 'Wellcom back' : 'Wellcom to join us'}}</span>
            </span>
            <span class="r-tip sp-button" @click="type.changeView()">{{type.isLogin_view ? '注册' : '登录'}}</span>
        </div>
        <div class="from" v-if="type.isLogin_view">
            <bottonLineInput class="input" v-model:value="login.params.email" placeholder="input your email"/>
            <bottonLineInput class="input" v-model:value="login.params.password" placeholder="input your password"/>
            <bottonLineInput class="input" v-model:value="login.params.code" placeholder="input code">
                <button :class="['but',type.waittingForCode?'dis-gap':'flot-style']" v-loading="type.waittingForRes" @click="code.getCode()" :disabled="type.waittingForCode">{{ type.waittingForCode ? code.text: '获取验证码' }}</button>
            </bottonLineInput>
            
            <div class="input rbut">
                <button class="but flot-style" @click="login.log()">登录</button>
            </div>
        </div>
        <div class="from" v-else>
            <bottonLineInput class="input" v-model:value="enroll.params.email" placeholder="input your email"/>
            <bottonLineInput class="input" v-model:value="enroll.params.password" placeholder="input your password"/>
            <bottonLineInput class="input" v-model:value="enroll.params.repassword" placeholder="input your password ones again"/>
            <bottonLineInput class="input" v-model:value="enroll.params.code" placeholder="input code">
                <button :class="['but',type.waittingForCode?'dis-gap':'flot-style']" v-loading="type.waittingForRes" @click="code.getCode()" :disabled="type.waittingForCode">{{ type.waittingForCode ? code.text: '获取验证码' }}</button>
            </bottonLineInput>
            
            <div class="input rbut">
                <button class="but flot-style" @click="enroll.sinUp()">注册</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import bottonLineInput from '../../../components/inputBox/bottonLineInput.vue';
import api from '../../../requestUtils/apis'
import {reactive} from 'vue'

/**
 * 状态种类
 */
const type = reactive({
    isLogin_view:true,      //是否处于登录页
    waittingForCode:false,  //等待输入验证码（验证代码发送成功后的等待标识）
    waittingForRes:false,   //等待响应（用于点击操作后的加载动画）

    changeView:()=>{
        type.isLogin_view = !type.isLogin_view
    },
    changewaittingForCode:()=>{
        type.waittingForCode = !type.waittingForCode
    },
    changeWaittingForRes:()=>{
        type.waittingForRes = !type.waittingForRes
    }

})

//登录操作
const login = reactive({
    params:{
        email:'',
        password:'',
        code:''
    },
    log:()=>{
        api.login(login.params).then(res=>{
            if(res){
                localStorage.setItem('access_token',res.data.data.token)
                localStorage.setItem('refresh_token',res.data.data.l_token)
            }
            console.log(res)
        })
    }
})

//注册操作
const enroll = reactive({
    params:{
        email:'',
        password:'',
        repassword:'',
        code:''
    },
    sinUp:()=>{
        api.enroll(enroll.params).then(res=>{

        }).catch(err=>{

        })
    }
})


// 验证码操作
const code = reactive({
    text:'',
    params:{
        email:'',
        login:true
    },
    getCode:()=>{
        type.changeWaittingForRes()
        code.setParams();

        api.getCode(code.params).then(res=>{
            type.changeWaittingForRes()
            code.timeSleep();
        }).catch(err=>{
            type.changeWaittingForRes()
        })
    },
    setParams:()=>{
        code.params.email = type.isLogin_view ? login.params.email : enroll.params.email
        code.params.login = type.isLogin_view
    },
    timeSleep:()=>{
        type.changewaittingForCode()
        let time = 30;
        code.text = time + 's'
        const t = setInterval(()=>{
            code.text = time + 's'
            time--
            if(time < 0){
                clearInterval(t)
                type.changewaittingForCode()
            }
        },1000)
    }
})

</script>

<style scoped lang="scss">
#from{
    background:#F5F5F5;
    border-radius: 15px;
    box-shadow: 4px 4px 7px 3px rgba(0,0,0,0.25);
    padding-top: 20px;
}

.login{
    width: 537px;
    height: 614px;
    .from{
        width: 417px;
        height: 367px;
    }
}

.enroll{
    width: 537px;
    height: 684px;
    .from{
        width: 417px;
        height: 442px;
    }
}

.tips{
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    span{
        height: fit-content;
        transition: 0.3s ease transform,text-shadow;
        // user-select:none;
    }

    .l-tip{
        display: flex;
        flex-direction: column;

        span:nth-child(1){
            font-size: 68px;
        }
        span:nth-child(2){
            font-size: 19px;
        }
    }

    .sp-button:hover{
        border-bottom: #000 2px solid;
        padding-bottom: 1px;
        transform: translateY(-3px);
        text-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
    }
    .sp-button:active{
        transform: translateY(0px);
    }
}


.from{
    margin: 0 auto;
    background-color: #fff;
    border-radius: 15px;
    margin-top: 30px;
    padding-top: 49px;

    .input{
        margin: 0 auto;
        width: 376px;
        height: 53px;
        margin-top: 21px;
    }

    .but{
        min-width: fit-content;
        padding: 0 20px;
        width: 124px;
        height: 53px;
        border: none;
        color: #fff;
        background-color: #000;
        border-radius: 10px;
        font-size: 18px;
        overflow: hidden;
    }

    .input.rbut{
        display: flex;
        justify-content: flex-end;
    }
}

</style>