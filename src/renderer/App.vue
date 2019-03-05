<template>
  <div id="app">
    <!-- <router-view></router-view> -->
    <!-- 添加标题栏 -->
    <el-card class="card" el-card shadow="always" :style="cardStyle">
      <div slot="header" class="card-header">
        <span>{{ refinedText }}</span>
        <i class="el-icon-rank dragable"></i>
        <i class="el-icon-close" @click="hide"></i>
      </div>
      <el-scrollbar class="card-content" :style="contentStyle">
        <div v-for="item in trans" :key="item.values[0]" class="text item"> {{ item.pos }} {{ item.values[0] }}</div>
      </el-scrollbar>
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
      token: 'b33bf8c58706155663d1ad5dba4192dc',
      cardStyle: {
        height: '300px',
      },
      contentStyle: {
        height: '200px',
      },
      input: '',
      text: '',
      trans: [],
    };
  },
  computed: {
    refinedText() {
      return this.text.slice(0, 120);
    },
  },
  created() {
    console.log('created');
    // 获取token
    this.$http.get('https://fanyi.sogou.com/').then((response) => {
      let jsUrl = /js\/app\.([^.]+)/.exec(response.data);
      jsUrl = `https://dlweb.sogoucdn.com/translate/pc/static/js/app.${jsUrl[1]}.js`;
      console.log(jsUrl);
      return this.$http.get(jsUrl);
    }).then((response) => {
      const token = /""\+\w\+\w\+\w\+"(\w{32})"/.exec(response.data)[1];
      if (token !== this.token) {
        this.token = token;
        console.log(`new token:${token}`);
      }
      // 监听query信息
      ipcRenderer.on('query', (event, message, winSize) => {
        this.cardStyle.height = `${winSize.height}px`;
        this.contentStyle.height = `${winSize.height - 51 - 40}px`;
        message = message.replace(/-\n/g, '');
        this.query(message);
      });
    });
  },
  methods: {
    hide: () => {
      ipcRenderer.send('close');
    },
    query(message) {
      console.log(`query message: ${message}`);
      const from = 'auto';
      const to = 'zh-CHS';
      const s = md5(`${from}${to}${message}${this.token}`);
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
        // response.data.data.bilingual 例句
        const { data } = response.data;
        if ('common_dict' in data && 'oxford' in data.common_dict) {
          const dict = data.common_dict.oxford.dict[0];
          this.text = dict.ori_word;
          // simple mode
          this.trans = dict.content[0].usual;
          // TODO detail mode
        } else {
          // 句子或短语
          const { translate } = data;
          this.text = translate.orig_text;
          this.trans = [{ values: [translate.dit] }];
        }
      }).catch((error) => {
        console.log('error');
        console.log(error.message);
      });
    },
  },
};
</script>

<style lang="scss">
  .el-card__header {
    padding: 15px 20px;
  };
  .el-card__body {
    padding-right: 0px;
  }
  .el-scrollbar__wrap{
    overflow-x:hidden;
  }

  .card {
    //border-radius: 15px;
  }

  .card-header {
    height: 20px;
  }

  text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .dragable {
    -webkit-app-region: drag;
  }
</style>
