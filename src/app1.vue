<template>
  <div id="app">
    <el-container style="height: 100%">
      <el-header>
        <div class="el-header__left">
          <img class="el-header__logo" src="./assets/img/logo.svg" />
          <div class="el-header__sublogo">演习平台</div>
          <div class="tag">
            <div v-if="isIdcEnvironment" class="env-tag">正式</div>
            <div v-else class="env-tag_test">测试</div>
          </div>
          <div class="el-header__nav">
            <span v-if="isAuth" class="nav_list" @click="handleOpenFault"> 故障列表 </span>
          </div>
        </div>

        <div class="el-header__right">
          <el-link v-show="isShowLog" :underline="false" @click="handleReplaylog">
            <i class="el-icon-s-marketing" />
            复盘记录
          </el-link>
          <el-link v-show="isShowLog" :underline="false" @click="handleOperationLog">
            <i class="el-icon-s-marketing" />
            操作流水
          </el-link>
          <el-link :underline="false" href="wxwork://message?username=industryexercise">
            <i class="el-icon-s-opportunity" />
            行业演习小助手
          </el-link>
          <el-link :underline="false" href="https://git.woa.com/mmpay_wxpay_exercise/ind_ex/issues/new" target="_blank">
            <img src="./assets/img/icon-issue.svg" />
            问题反馈
          </el-link>
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-link :underline="false">
                帮助
                <i class="el-icon-arrow-down el-icon--right" />
              </el-link>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <el-link
                  :underline="false"
                  href="https://iwiki.woa.com/pages/viewpage.action?pageId=1024596516"
                  target="_blank"
                >
                  <i class="el-icon-s-management" /> 演习规范
                </el-link>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-link
                  :underline="false"
                  href="https://iwiki.woa.com/pages/viewpage.action?pageId=953409278"
                  target="_blank"
                >
                  <i class="el-icon-question" /> 使用指引
                </el-link>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <div class="el-header_user">
            <el-avatar class="avatar" :src="userInfo.avatarUrl" />
          </div>
          <mis-sitemap size="26" color="#000000" />
        </div>
      </el-header>
      <el-container>
        <el-aside>
          <el-form :model="boundaryFilter" size="mini">
            <el-form-item>
              <el-input
                v-model="boundaryFilter.text"
                prefix-icon="el-icon-search"
                size="mini"
                placeholder="输入关键字进行过滤"
              />
            </el-form-item>
            <el-form-item label="只显示已经接入的项目">
              <el-switch v-model="boundaryFilter.showProjectOnly" active-text="" inactive-text=" " />
            </el-form-item>
          </el-form>
          <el-tree
            ref="tree"
            style="overflow: auto; height: 100%"
            :filter-node-method="handleFilterNode"
            :data="boundaryList"
            :default-expanded-keys="['0']"
            :props="boundaryDefaultProps"
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <span style="width: 95%" @click="handleNodeClick(data)">
                {{ node.label }}
              </span>
              <span>
                <el-button type="text" size="mini" @click="handleOpenProject(data)">
                  <i
                    :class="[
                      node.data.UCFatherBusinessBoundaryId === 0
                        ? 'el-icon-more'
                        : data.ProjectId > 0
                        ? 'el-icon-edit'
                        : 'el-icon-plus',
                    ]"
                  />
                </el-button>
              </span>
            </span>
          </el-tree>
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { getLogger } from "@/common/comm-log";
import { OperateType, PAGE_SIZE_MAX } from "@/common/comm-defs";
import { deepClone, getUserAuthority } from "@/common/comm-func";
import getBoundaryList from "./api-list/get-boundary-list";
import projectList from "./api-list/project-list";
import getEnvDetail from "./api-list/env-detail";

const PageName = "app";
const logger = getLogger(PageName);

export default {
  name: PageName,
  data() {
    return {
      boundaryFilter: {
        text: "",
        showProjectOnly: false,
      },
      boundaryDefaultProps: {
        children: "children",
        label: "UCBusinessBoundaryName",
        value: "UCBusinessBoundaryId",
      },
      boundaryList: [],

      isAuth: false,

      userInfo: {
        oaChinese: "",
        oaName: "",
        avatarUrl: "",
      },

      isShowLog: false,
      isIdcEnvironment: true,
    };
  },
  watch: {
    boundaryFilter: {
      handler(newValue) {
        logger.log("watch boundaryFilter", newValue);
        this.$refs.tree.filter(newValue);
      },
      deep: true,
      immediate: false,
    },
    $route: {
      handler(to, from, next) {
        logger.log("watch router invoke", from, next, to.path);

        // 只有当前页面是方案列表页才展示
        if (to.path === "/case-list") {
          this.isShowLog = true;
        } else {
          this.isShowLog = false;
        }
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    logger.log("mounted invoke");
    this.initPage();
  },
  methods: {
    /**
     * 初始化页面
     */
    async initPage() {
      logger.log("initPage invoke");

      try {
        this.isAuth = await getUserAuthority(OperateType.CREATE);
        await this.initEnvDetail();
        await this.initUserInfo();
        await this.initBoundaryList();
        await this.initProjectList();
        await this.formatBoundaryList();
      } catch (e) {
        logger.error("initPage initBoundaryList fail, e =", e);
        this.$notify({
          title: "初始化页面失败",
          type: "error",
        });
        return;
      }
    },

    /**
     * 初始化用户信息
     */
    async initUserInfo() {
      logger.log("initUserInfo invoke");

      const oaChinese = $cookies.get("wxpay_chinese_oaname");
      const oaName = $cookies.get("wxpay_oaname");
      const avatarUrl = `https://r.hrc.oa.com/photo/150/${oaName}.png`;
      logger.log("initUserInfo oaChinese oaName=", oaChinese, oaName, avatarUrl);

      this.userInfo = {
        oaChinese,
        oaName,
        avatarUrl,
      };
    },

    /**
     * 初始化领域列表
     */
    async initBoundaryList() {
      logger.log("initBoundaryList", "invoke");

      let resp;
      try {
        resp = await getBoundaryList();
      } catch (e) {
        logger.error("initBoundaryList api fail", e);
        throw new Error("获取领域列表失败");
      }
      logger.log("initBoundaryList api success", resp);

      this.boundaryList = resp.boundarylist;
    },

    /**
     * 初始化项目列表
     */
    async initProjectList() {
      logger.log("initProjectList invoke");

      const req = {
        offset: 0,
        limit: PAGE_SIZE_MAX,
      };
      let resp;
      try {
        resp = await projectList(req);
      } catch (e) {
        logger.error("initProjectList api fail", e);

        throw new Error("获取项目列表失败");
      }
      logger.log("initProjectList api success", resp);

      this.projectList = resp.ind_ex_project_list;
    },
    /**
     * 初始化获取当前环境
     */
    async initEnvDetail() {
      logger.log("initEnvDetail invoke");

      const req = {};
      let resp;
      try {
        resp = await getEnvDetail(req);
      } catch (e) {
        logger.error("getEnvDetail api fail", e);

        throw new Error("获取环境失败");
      }
      logger.log("getEnvDetail api success", resp);

      this.isIdcEnvironment = resp.isIdc;
    },

    /**
     * 格式化boundaryList，获取该boundary是否已经接入项目
     */
    async formatBoundaryList() {
      logger.log("formatBoundaryList invoke");

      // 获取已经开通的项目列表
      const tmpProjectMap = {}; // 暂存已经开通的项目id
      this.projectList.forEach(
        (x) => (tmpProjectMap[`${x.business_system_id}-${x.system_subdomain_id}`] = x.project_id)
      );
      logger.log("formatBoundaryList get-project-list", tmpProjectMap);

      // 在BoundaryList标记已经开通的项目
      const tmpBoundaryList = deepClone(this.boundaryList);
      tmpBoundaryList.forEach((boundary) => {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        boundary.children &&
          boundary.children.forEach((subBoundary) => {
            const key = `${subBoundary.UCFatherBusinessBoundaryId}-${subBoundary.UCBusinessBoundaryId}`;
            // eslint-disable-next-line no-param-reassign
            subBoundary.ProjectId = 0;
            if (Object.prototype.hasOwnProperty.call(tmpProjectMap, key)) {
              // eslint-disable-next-line no-param-reassign
              subBoundary.ProjectId = tmpProjectMap[key];
            }
          });
      });
      logger.log("formatBoundaryList get-project-list", tmpBoundaryList);

      this.boundaryList = tmpBoundaryList;
    },

    /**
     * 点击领域名称，展开子领域；点击子领域名称，打开子领域管理页
     * 存在跳转演习列表页，不存在跳转到项目新增页
     */
    async handleNodeClick(item) {
      logger.log("handleNodeClick invoke", item);

      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (item && item.children && item.children.length) {
        logger.log("handleNodeClick click-father, return");
        return;
      }

      const fatherBoundaryId = item.UCFatherBusinessBoundaryId;
      const boundaryId = item.UCBusinessBoundaryId;

      // 获取当前子域对应的演习项目信息
      const req = {
        business_system_id: fatherBoundaryId,
        system_subdomain_id: boundaryId,
      };

      let resp;
      try {
        resp = await projectList(req);
      } catch (e) {
        logger.error("handleNodeClick api fail", e);
        throw new Error("获取项目信息列表失败");
      }
      logger.log("handleNodeClick api success", resp);

      // 若不存在项目信息，则跳转到新增项目页
      if (resp.total_count <= 0) {
        logger.log("handleNodeClick get-project-empty", resp);

        this.$router.push(`/project-add?business_system_id=${fatherBoundaryId}&system_subdomain_id=${boundaryId}`);
        return;
      }

      // 存在项目信息，跳转到项目的演习用例页
      logger.log("handleNodeClick get-project-exist", resp);
      this.$router.push(`case-list?project_id=${resp.ind_ex_project_list[0].project_id}`);
      return;
    },

    /**
     * 打开项目管理页面
     * 存在跳转编辑页，不存在跳转到项目新增页
     */
    async handleOpenProject(item) {
      logger.log("handleOpenProject invoke", item);

      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (item && item.children && item.children.length) {
        logger.log("handleOpenProject click-father, return");
        return;
      }

      const fatherBoundaryId = item.UCFatherBusinessBoundaryId;
      const boundaryId = item.UCBusinessBoundaryId;

      // 获取当前子域对应的演习项目信息
      const req = {
        business_system_id: fatherBoundaryId,
        system_subdomain_id: boundaryId,
      };

      let resp;
      try {
        resp = await projectList(req);
      } catch (e) {
        logger.error("handleOpenProject api fail", e);
        throw new Error("获取项目信息列表失败");
      }
      logger.log("handleOpenProject api success", resp);

      // 若不存在项目信息，则跳转到新增项目页
      if (resp.total_count <= 0) {
        logger.log("handleOpenProject get-project-empty", resp);

        this.$router.push(`/project-add?business_system_id=${fatherBoundaryId}&system_subdomain_id=${boundaryId}`);
        return;
      }

      // 存在项目信息，跳转到项目的演习用例页
      logger.log("handleOpenProject get-project-exist", resp);

      // eslint-disable-next-line max-len
      this.$router.push(
        `project-edit?business_system_id=${fatherBoundaryId}&system_subdomain_id=${boundaryId}&project_id=${resp.ind_ex_project_list[0].project_id}`
      );
      return;
    },
    /**
     * 初始化故障列表
     */
    async handleOpenFault() {
      logger.log("handlerOpenFault invoke", " ");

      this.$router.push("injectinterface-list");
      return;
    },
    /**
     * 子领域搜索
     */
    handleFilterNode(filter, data) {
      if (filter.text) {
        if (filter.showProjectOnly) {
          return data.UCBusinessBoundaryName.indexOf(filter.text) >= 0 && data.ProjectId;
        }
        return data.UCBusinessBoundaryName.indexOf(filter.text) >= 0;
      }

      if (filter.showProjectOnly) {
        return data.ProjectId > 0;
      }
      return true;
    },
    /**
     * 跳转操作流水
     */
    handleOperationLog() {
      logger.log("handleOperationLog invoke");
      this.$router.push({
        path: "/operation-list",
        query: {
          project_id: this.$route.query.project_id,
        },
      });
    },
    /**
     * 跳转复盘记录
     */
    handleReplaylog() {
      logger.log("handleReplaylog invoke");
      this.$router.push({
        path: "/replay-list",
        query: {
          project_id: this.$route.query.project_id,
        },
      });
    },
  },
};
</script>

<style>
#app {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  font-size: 14px;
}
* {
  padding: 0;
  margin: 0;
}
html,
body,
#app,
.el-aside .el-menu {
  height: 100%;
}

.el-header {
  display: flex;
  padding: 11px 16px;
  height: 64px !important;
  justify-content: space-between;
  align-items: center;
  line-height: 1;
  border-bottom: 1px solid #e6e6e6;
}

.el-header .el-header__left {
  display: flex;
  align-items: center;
}

.el-header__left .el-header__logo {
  width: 143px;
  height: 36px;
  margin-right: 8px;
}

.el-header__left .env-tag {
  padding: 0 8px;
  background-color: #ff7e55;
  height: 20px;
  border-radius: 2px;
  opacity: 1;
  font-size: 12px;
  font-weight: 400;
  font-family: "PingFang SC";
  text-align: center;
  line-height: 20px;
  color: #fff;
}

.el-header__left .env-tag_test {
  padding: 0 8px;
  background-color: #ffaa00;
  height: 20px;
  border-radius: 2px;
  opacity: 1;
  font-size: 12px;
  font-weight: 400;
  font-family: "PingFang SC";
  text-align: center;
  line-height: 20px;
  color: #fff;
}

.el-header__left .el-header__sublogo {
  padding: 0 8px;
  border-left: 1px solid #dddddd;
  opacity: 1;
  color: rgba(76, 76, 76, 1);
  font-size: 22px;
  font-weight: 400;
  font-family: "PingFang SC";
  text-align: left;
  letter-spacing: 0.7px;
}

.el-header__left .el-header__nav {
  margin-left: 40px;
  height: 64px;
  line-height: 64px;
}

.nav_list {
  height: 18px;
  position: relative;
  left: 0;
  top: 0;
  opacity: 1;
  font-size: 14px;
  font-weight: 400;
  font-family: "Microsoft YaHei";
  color: rgba(0, 0, 0, 0.6);
}

.el-header__nav:hover .nav_list {
  color: #07c160;
  cursor: pointer;
}

.el-header__nav:hover .nav_list::after {
  position: absolute;
  left: 0;
  bottom: -8px;
  content: "";
  width: 32px;
  height: 2px;
  margin: 0 12px;
  background-color: #07c160;
}

.el-header__right {
  display: flex;
  align-items: center;
  margin-left: 32px;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  font-weight: 400;
  font-family: "Microsoft YaHei";
  text-align: left;
  line-height: initial;
}

.el-link {
  box-sizing: border-box;
  white-space: nowrap;
}

.el-link--inner {
  padding: 8px;
}

.el-link .el-link--inner:hover {
  color: #07c160;
}

span.el-link--inner img {
  display: inline-flex;
  width: 14px;
  height: 14px;
  align-items: center;
}

span.el-link--inner:hover img {
  width: 14px;
  height: 14px;
  content: url("./assets/img/icon-issue2.svg");
}

.el-header_user {
  display: flex;
  align-items: center;
  height: 64px;
  line-height: 64px;
  margin: 0 16px;
  cursor: pointer;
}

.el-header_user .avatar {
  width: 32px;
  height: 32px;
  margin-left: 5px;
}

.el-dropdown-menu__item:not(.is-disabled):hover {
  background-color: #f6f6f6 !important ;
}
.el-dropdown-menu__item {
  line-height: inherit;
}

.el-footer {
  text-align: center;
  line-height: 59px;
  border-top: 1px solid #e6e6e6;
}

.el-aside {
  position: relative;
  width: 237px !important;
  border-right: 1px solid #e6e6e6;
  z-index: 1000;
  height: calc(100vh - 60px);
}

.el-aside {
  width: 237px !important;
  border-right: 1px solid #e6e6e6;
}
.el-aside::-webkit-scrollbar {
  display: none;
}
.el-aside .el-input--mini .el-input__inner {
  border-radius: 0px;
}

.el-aside .el-tree-node {
  margin-top: 10px;
}
.el-header_list {
  float: left;
  margin-right: 10px;
  margin-top: -22px;
  border: none;
}
/* ::-webkit-scrollbar {
  display: none;
} */
.key-word {
  color: red;
}
.el-tree-node:focus > .el-tree-node__content {
  background-color: #fff; /*节点的背景颜色*/
  color: #409eff; /*节点的字体颜色*/
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.env-tag {
  margin-top: 0.8%;
  margin-left: 25px;
  font-size: 16px;
}
</style>
