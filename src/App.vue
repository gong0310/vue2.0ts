<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { getLogger } from "@/common/common-log";
import { PAGE_SIZE_MAX } from "@/common/comm-defs";
import { IProjectItem } from "@/api-list/common";
import projectList, { IProjectItemReq } from "@/api-list/project-list";
const PageName = "app";
const logger = getLogger(PageName);

import Vue from "vue";
export default Vue.extend({
  name: "App",
  data() {
    return new (class {
      projectData: Array<IProjectItem> = [];
    })();
  },
  mounted() {
    logger.log("mounted", "invoke");
    this.initPage();
  },
  methods: {
    /**
     * 初始化页面
     */
    async initPage() {
      logger.log("initPage invoke");

      try {
        await this.initProjectList();
      } catch (error) {
        logger.error("initPage initProjectList fail, error =", error);

        this.$notify({
          title: "初始化页面失败",
          message: JSON.stringify((error as any).message),
          type: "error",
        });
        return;
      }
    },
    /**
     * 初始化接入业务列表
     */
    async initProjectList() {
      logger.log("initProjectList invoke");

      // 请求后台
      const req: IProjectItemReq = {
        offset: 0,
        limit: PAGE_SIZE_MAX,
      };
      let resp;

      try {
        resp = await projectList(req);
      } catch (error) {
        logger.error("projectList api fail, error=", error);
        throw new Error("获取侧边栏，接入业务列表信息失败");
      }

      logger.log("projectList api success", resp);
      this.projectData = resp.service_list || [];
    },
  },
});
</script>
<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
