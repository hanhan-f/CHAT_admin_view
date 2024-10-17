<template>
    <div class="input-lab">
        <input :value="value" :placeholder="placeholder" @input="onInput">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">

import {defineProps,defineEmits} from "vue"

defineProps(['value','placeholder'])

const emit = defineEmits(['update:value'])

const onInput = (event:Event)=>{
    const newValue = (event.target as HTMLInputElement).value
    emit('update:value',newValue)
}

</script>

<style lang="scss" scoped>
.input-lab{
    display: flex;
    gap: 24px;
    justify-content: space-between;
    
    $input_color:#8b8b8b;
    $input_color_focus:#000;
    
    input{
        width: 100%;
        border: none;
        border-bottom: 1px solid $input_color;
        color: $input_color;
        font-size: 18px;
        font-weight: 100;
        line-height: 43px;
        transition: 0.5s linear border-color;
    }
    input:focus{
        outline: none;
        border-bottom: 2px solid $input_color_focus;
    }
}


</style>