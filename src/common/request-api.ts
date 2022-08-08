import { getLogger } from "@/common/common-log";
import RequestBase from "@/common/request-base";

const PageName = "RequestApi";
const logger = getLogger(PageName);

interface IApi {
  [apiName: string]: {
    url: string;
    method: "get" | "post";
    customHost?: boolean;
  };
}
interface IApiList {
  [propName: string]: any;
}

export const HOST = "//wxpay.oa.com";
export const PATH = "/xdc/industryqosmis";
export const HOST_LOCAL = "//127.0.0.1:3000";

const API_LIST: IApi = {
  // 左侧菜单栏，业务
  projectList: {
    url: "/api/project/list",
    method: "get",
  },
  // 获取风险关系
  getBcpList: {
    url: "//xdc.wxp.oa.com/s/bcp/getRisks",
    method: "get",
    customHost: true,
  },
  configureList: {
    url: "/api/configure/list",
    method: "get",
  },
};
export default (() => {
  const apiList: IApiList = {};
  Object.keys(API_LIST).forEach((i) => {
    const { url, method, customHost } = API_LIST[i];
    apiList[i] = async function (data: any) {
      //正式
      let tmpUrl = HOST + PATH + url;
      const tmpHost = window.location.origin;
      //本地
      if (tmpHost.indexOf("localhost") >= 0) {
        tmpUrl = HOST_LOCAL + url;
      }
      // 自定义域名
      if (customHost) {
        tmpUrl = url;
      }
      let resp;
      try {
        logger.log(url, "api begin, url =", tmpUrl);
        // api请求
        resp = await RequestBase(tmpUrl, method, data);
      } catch (e) {
        logger.error(url, "api fail", e);
        // 其他错误直接返回
        throw e;
      }

      logger.log(url, "api succes", resp);
      return resp;
    };
  });
  return apiList;
})();
