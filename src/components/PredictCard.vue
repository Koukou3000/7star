<template>
  <div class="result">
    <div class="result-item">
      {{ title }}~期数：{{ showRound }}
    </div>
    
    <div :style="{opacity: showRound!=data.round ? 0 : 1}">
      <div class="result-item">
        <span :class="isHit(data.myriabit_hit)">
          万 - {{ data.myriabit }}
        </span>
      </div>
      <div class="result-item">
        <span :class="isHit(data.thousand_hit)">
          千 - {{ data.thousand }}
        </span>
      </div>
      <div class="result-item">
        <span :class="isHit(data.hundred_hit)">
          百 - {{ data.hundred }}
        </span>
      </div>
      <div class="result-item">
        <span :class="isHit(data.ten_hit)">
          十 - {{ data.ten }}
        </span>
      </div>
      <div class="result-item">
        <span :class="isHit(data.one_hit)">
          个 - {{ data.one }}
        </span>
      </div>
    </div>

  </div>
</template>

<script>
export default {
    components: {},
    props: {
      title: {
        type: String,
        required: true,
      },
      data: {
        type: Object,
        default: () => ({})
      },
      showRound: [Number, String]
    },
    data() {
      return {
        
      };
  },
  methods: {
    isHit(hit){
			if(hit==1){
				return "green"
			}
			else if(hit==null){
				return ""
			}
			else if(hit==0){
				return ""
			}
			return "red"
		},
  }
}
</script>
<style scoped>
  .result{
    font-weight: bold;
    font-size: 24px;
  } 
  .result-item{
		display: flex;
		position: relative;
	}
	.green{
		color: #2AB92A;
	}
	.red{
		color: #BA0000;
	}
</style>