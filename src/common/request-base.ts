import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as CommDefs from "./comm-defs";
import { getLogger } from "./common-log";
// import router from "../router";
import VueCookies from "vue-cookies";

const PageName = "RequestBase";
const logger = getLogger(PageName);

export default async function RequestBase(url: string, method: any, data = {}) {
  logger.log(`${method} invoke, url =${url}`, data);
  //请求前
  const headers: any = {};
  const token = (VueCookies as any).get("XSRF-TOKEN");
  if (token) {
    headers["X-CSRF-TOKEN"] = token;
    headers["Authorization"] = token;
  }
  // 发出请求
  logger.log(`${method} api begin`, data);
  let resp;
  try {
    resp = await axios({
      url,
      method,
      headers,
      params: method === "get" ? data : "",
      data: method === "post" ? data : {},
    });
  } catch (e) {
    logger.error(`${method} api fail url=${url}`, data, (e as any)?.response);
    if ((e as any)?.response === undefined) {
      // 302到passport平台因为跨域被拦截了
      logger.log("api fail 302 CORS error, Re-authentication");
      // window.location.href = `${CommDefs.PASSPORT_URL}${encodeURIComponent(
      //   CommDefs.EXERCISE_MIS_URL
      // )}`;
    }
    return Promise.reject({
      type: CommDefs.ERROR_NETWORK,
      msg: "network error",
    });
  }

  logger.log(`${method} api success`, resp);

  //请求后
  if (resp.status !== 200 || !resp.data) {
    logger.warn(`${method} api http-code error`, resp);
    return Promise.reject({
      type: CommDefs.ERROR_NETWORK,
      msg: "network error",
      resp,
    });
  }
  const retData = resp.data;

  // 检查是否有逻辑错误
  if (retData.code !== 0) {
    logger.warn(`${method} api api-code error`, resp);
    return Promise.reject({
      type: CommDefs.ERROR_LOGIC,
      msg: `逻辑错误：${retData.code}`,
      resp,
    });
  }

  return retData;
}
