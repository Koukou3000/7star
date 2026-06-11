<template>
	<div>
		<el-button 
			plain round
			:loading="isLoading"
			@click="getMoreResult()" 
			v-if="hasMore">插入前 15 期
		</el-button>
		
		<div v-loading="isLoading">			
			<el-row>
				<el-col :span="4" class="numbers">期数</el-col>
				<el-col :span="4" align="center">万</el-col>
				<el-col :span="4" align="center">千</el-col>
				<el-col :span="4" align="center">百</el-col>
				<el-col :span="4" align="center">十</el-col>
				<el-col :span="4" align="center">个</el-col>
			</el-row>
		</div>
	
		
		<div class="scroll-wrap">

			<div v-for="(item, index) in results" 
				:key="item.round"
				class="line-container">
				<div :class="[zebraCSS(index)]">
					<el-row>
						<el-col :span="4" class="numbers">{{item.round}}</el-col>
						<el-col :span="4" align="center">{{item.myriabit}}</el-col>
						<el-col :span="4" align="center">{{item.thousand}}</el-col>
						<el-col :span="4" align="center">{{item.hundred}}</el-col>
						<el-col :span="4" align="center">{{item.ten}}</el-col>
						<el-col :span="4" align="center">{{item.one}}</el-col>
					</el-row>
				</div>
				
			</div>
		</div>
		
	</div>
</template>

<script>
	import axios from 'axios'
	import {server} from '@/utils/config.js'
	
	export default {
		name:"RoundResult",
		data() {
			return {
				page: 0,
				pageSize: 15,
				
				results:[],
				isLoading: true,
				hasMore: true,
			};
		},
		methods:{
			getResult(){
				let url = `${server}/api/results` //https://www.v2ex.com/t/1056504#reply272		

				axios.get(url,{
					params:{
						start: this.page * this.pageSize,
						end: this.pageSize
					}
				})
				.then(resp=>{
					let tmp = resp.data
					tmp.sort((a,b)=>a.round-b.round)
					this.results = tmp.concat(this.results)
					
					if(resp.data.length < this.pageSize){
						this.hasMore = false // 隐藏按钮
					}
			
					this.isLoading = false 
				})
				.catch(e=>{
					console.log(e)
					this.isLoading = false
				})
			},
			getMoreResult(){
				if(this.isLoading || !this.hasMore) 
					return
				this.isLoading = true
				this.page += 1
				this.getResult()
			}
		},
		computed:{
			zebraCSS() {
				return (index) => {
					return index % 2 === 0 ? 'zebra' : '';
				};
			}
		},
		mounted(){
			this.getResult()
		}
	}
</script>

<style>
.line-container{
	height: 60px;
	line-height: 60px;
	background-color: #fff;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	font-weight: bold;
	font-size: 30px;
}
.zebra{
	background-color: #f7f7f7;
}
.el-col{
	line-height: 60px;
}
.numbers{
	font-size: 20px;
	color: darkred;
}
html, body{
	height: 99%;
}
.scroll-wrap{
  height: 82vh; 
  overflow-y: scroll;
}
</style>