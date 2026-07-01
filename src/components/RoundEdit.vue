
<template>
    <div class="roundEditWrapper">
				<el-input 
					type="number" 
					v-model="innerRound"
					@focus="handleFocus"
				 	@blur="handleBlur"
					@change="handleConfirm"
				  prefix-icon="el-icon-date"
					class="roundNumberInput"
				/>
				
				<el-button plain  @click="prev" class="roundBtn"> 期数-{{ prevStep }}</el-button>
				<el-button plain	@click="next" class="roundBtn"> 期数+{{ nextStep }}</el-button>
		</div>
</template>

<script>
export default {
	props: {
		value: {
			type: [Number, String],
			required: true,
		},
		prevStep: {
			type: Number,
			default: 1,		
		},
		nextStep: {
			type: Number,
			default: 1,
		},
		debounceTime: {
			type: Number,
			default: 300,
		}
	},
	data() {
		return {
			innerRound: this.value, // v-model == :value="sharedRound" @input="sharedRound=$event"
		};
	},
	watch: {
		value(val) {
			this.innerRound = val
		}
	},
	methods: {
		prev() {
			this.innerRound = Number(this.innerRound) - Number(this.prevStep)
			this.$emit('focus')
      this.handleConfirm()
		},
		next() {
			this.innerRound = Number(this.innerRound) + Number(this.nextStep)
			this.$emit('focus')
      this.handleConfirm()
		},
		handleFocus() {
			this.$emit('focus')
		},
		handleBlur() {
			if (this.value == this.innerRound) {
				this.$emit('blur')
				return	
			}
			else this.handleConfirm()
		},
		handleConfirm() {
			this.$emit('input', Number(this.innerRound)) // v-model == :value="sharedRound" @input="sharedRound=$event"
			this.$emit('blur') // 通知父组件退出编辑状态
		},
	}
}
</script>
<style scoped>
  .roundEditWrapper{
		display: flex;
		gap: 4px;
	}
	.roundNumberInput{
		flex: 1!important;
	}
	.roundBtn{
		flex: 1;
		white-space: nowrap; /* 强制文字不换行 */
		overflow: hidden;  /* 隐藏溢出内容 */
		text-overflow: ellipsis; /* 文字过长显示省略号 */
	}
</style>