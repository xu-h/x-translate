<template>
  <div id="app">
    <!-- <router-view></router-view> -->
    <el-input v-model="input" placeholder="请输入内容"></el-input>
    <el-card class="box-card" el-card shadow="always">
      <div slot="header" class="clearfix">
        <span>卡片名称</span>
        <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
      </div>
      <div v-for="o in 4" :key="o" class="text item">{{'列表内容 ' + o }}</div>
    </el-card>
  </div>
</template>

<script>

import { ipcRenderer } from 'electron'; // eslint-disable-line
import md5 from 'md5';

export default {
  name: 'x-translate',
  data() {
    return {
      input: '',
    };
  },
  created() {
    console.log('created');
    ipcRenderer.on('query', (event, message) => {
      message = 'hello';
      console.log(`query message: ${message}`);
      const from = 'auto';
      const to = 'zh-CHS';
      const s = md5(`${from}${to}${message}front_9ee4f0a1102eee31d09b55e4d66931fd`);
      const text = encodeURIComponent(message).replace(/%20/g, '+');

      // uuid
      let uuid = '';
      for (let t = 0; t < 32; t += 1) {
        const e = 16 * Math.random() | 0; // eslint-disable-line
        if (t === 8 || t === 12 || t === 16 || t === 20) {
          uuid += '-';
        }
        uuid += (12 === t ? 4 : 16 === t ? 3 & e | 8 : e).toString(16); // eslint-disable-line
      }

      const sougou = this.$http.create({
        baseURL: 'https://fanyi.sogou.com',
        headers: {
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      let data = {
        from,
        to,
        text,
        s,
        uuid,
        client: 'pc',
        fr: 'browser_pc',
        useDetect: 'on',
        useDetectResult: 'on',
        needQc: 1,
        oxford: 'on',
        pid: 'sogou-dict-vr',
        isReturnSugg: 'on',
      };
      data = Object.entries(data).map(([k, v]) => `${k}=${v}`).join('&');
      sougou.post('/reventondc/translateV1', data).then((response) => {
        console.log('success');
        console.log(response);
      }).catch((error) => {
        console.log('error');
        console.log(error.message);
      });
    });
  },
};
</script>

<style>
  text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .box-card {
    width: 480px;
  }
</style>
