<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }"> 首页 </el-breadcrumb-item>
      <el-breadcrumb-item>配置</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 筛选条件 -->
    <el-form :inline="true" class="notice-list-header">
      <el-form-item label="配置项编号：">
        <el-input v-model="filterKey.item_no" placeholder="配置项编号" />
      </el-form-item>
      <!-- <el-form-item label="是否生效：">
        <el-select v-model="filterKey.is_on_line" placeholder="请选择">
          <el-option
            v-for="item in configurEffectList"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" @click="initconfigureList(0)"> 查询 </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格数据 -->
    <el-table
      v-loading="configureListLoading"
      :data="configureList"
      :header-cell-style="{ 'text-align': 'center' }"
      :cell-style="{ 'text-align': 'center' }"
      border
      size="mini"
      style="width: 100%"
    >
      <el-table-column prop="qos_detail_info_po.item_no" label="配置项编号" />
      <el-table-column prop="qos_item_info_po.item_name" label="配置项名称" />
      <el-table-column prop="qos_detail_info_po.create_time" label="创建时间">
        <template slot-scope="scope">
          {{ timestamp2String(scope.row.qos_detail_info_po.create_time) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleConfigureToHistory(scope.row)"> 历史 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <div class="pagination">
      <el-pagination
        :page-size="configureDataPage.page_size"
        :total="configureDataPage.total_num"
        :current-page="configureDataPage.page_num + 1"
        layout="total, prev, pager, next, jumper"
        @current-change="initconfigureList"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { ICommonPage } from "@/api-list/common";
import { timestamp2String } from "@/common/comm-func";
import configureList, { IConfigureListReq, IConfigureListResp } from "@/api-list/configure-list";
import { getLogger } from "@/common/common-log";

const PageName = "configure";
const logger = getLogger(PageName);

export default Vue.extend({
  name: PageName,
  components: {},
  props: {
    sceIds: {
      type: Number,
      default: null,
    },
    itemName: {
      type: String,
      default: null,
    },
  },
  data() {
    return new (class {
      timestamp2String = timestamp2String;
      configureList = [];
      businessId = "";
      sceId = 0;
      filterKey = {
        item_no: "",
        is_on_line: 0,
      };
      configureDataPage: ICommonPage = {
        page_num: 0,
        page_size: 10,
        total_num: 0,
      };
      configureListLoading = false;
    })();
  },
  watch: {
    /**
     * 监听路由变化刷新页面
     */
    $route(to) {
      logger.log("watch router invoke", to.query);

      this.initPage();
    },
    configureList: {
      handler(newVale) {
        logger.log("watch configureList invoke", newVale);
      },
      deep: true,
      immediate: false,
    },
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
        await this.initPageParams();
        await this.initconfigureList();
      } catch (error) {
        logger.error("initPage initconfigureList fail, error =", error);
        this.$notify({
          title: "初始化页面失败",
          message: JSON.stringify((error as any).message),
          type: "error",
        });
        return;
      }
    },
    /**
     * 检查页面入参
     */
    async initPageParams() {
      logger.log("initPageParams invoke");

      (this as any).businessId = this.$route.query.business_id || 0;
      this.sceId = Number(this.$route.query.sce_id || 0);

      // 检查参数
      if (!this.businessId || !this.sceId) {
        logger.error("initPageParams check params fail", this.businessId, this.sceId);
        throw new Error("获取页面参数失败");
      }

      logger.log("initPageParams check params success", this.businessId, this.sceId);
    },
    /**
     * 获取配置列表
     */
    async initconfigureList(pageNum?: number) {
      logger.log("initconfigureList invoke", "pageNum=", pageNum);

      // 检查参数
      let tmpPageNum = pageNum;
      if (typeof tmpPageNum !== "number") {
        tmpPageNum = this.configureDataPage.page_num || 0;
      } else {
        tmpPageNum = tmpPageNum - 1 >= 0 ? tmpPageNum - 1 : 0;
      }
      this.configureDataPage.page_num = tmpPageNum;

      // 请求后台
      const req: IConfigureListReq = {
        offset: tmpPageNum,
        limit: this.configureDataPage.page_size,
        item_no: this.filterKey.item_no,
        sce_id: (this as any).sceId,
        is_on_line: this.filterKey.is_on_line,
      };
      logger.log("initconfigureList req=", req);

      this.configureListLoading = true;
      let resp: IConfigureListResp;

      try {
        resp = await configureList(req);
      } catch (error) {
        logger.error("configureList api fail, error=", error);

        this.configureListLoading = false;
        this.configureList = [];
        this.configureDataPage.total_num = 0;
        throw new Error("获取列表失败");
      }

      this.configureListLoading = false;
      logger.log("configureList api success", resp);

      // 数据为空
      if (!resp.qos_item_set_info_list || resp.total_count === 0) {
        this.configureList = [];
        this.configureDataPage.total_num = 0;
        return;
      }

      (this as any).configureList = resp.qos_item_set_info_list;
      this.configureDataPage.total_num = resp.total_count;
    },
    /**
     * 跳转操作历史
     */
    handleConfigureToHistory(row: any) {
      logger.log("handleConfigureToHistory invoke", row);

      this.$router.push({
        path: "/configure/history",
        query: {
          sce_id: (this as any).sceId,
          business_id: (this as any).businessId,
          item_no: row.qos_detail_info_sandbox_po.item_no,
        },
      });
    },
    /**
     * 打开弹窗
     */
    handleDialogConfigureShow() {
      logger.log("handleDialogConfigureShow invoke");
      // this.dialogConfigureVisible = true;
    },
    /**
     * 关闭弹窗
     */
    handleDialogConfigureHide() {
      logger.log("handleDialogConfigureHide invoke");
      // this.dialogConfigureVisible = false;
      // this.$emit('update-configure-list');
    },
  },
});
</script>

<style scoped></style>
