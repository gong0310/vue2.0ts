import clone from "clone";
import dayjs from "dayjs";

/**
 * 深度copy
 * @param {Object} obj 原对象
 */
export const deepClone = function (obj: any) {
  return clone(obj);
};

/**
 * unix时间戳格式化
 * @param timestamp unix时间戳
 * @returns 格式化后的字符串
 */
export const timestamp2String = function (timestamp: number) {
  return dayjs.unix(timestamp).format("YYYY/MM/DD HH:mm:ss");
};

/**
 * 时间戳格式化(毫秒)
 * @param timestamp unix时间戳
 * @returns 格式化后的字符串
 */
export const millisecondTimestampString = function (timestamp: number) {
  return dayjs(timestamp).format("YYYY/MM/DD HH:mm:ss");
};
/**
 * 暂停
 * @param {Number} ms 超时事件-毫秒
 */
export const timeout = function (ms: number) {
  return new Promise((resolve: any) =>
    setTimeout(() => {
      resolve();
    }, ms)
  );
};
