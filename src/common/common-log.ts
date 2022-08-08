/**
 * log级别日志
 * @param {String} pageName 模块名
 * @param {String} funcName  函数名
 * @param {String} content 日志内容
 * @param {...any} args 附加内容
 */
export const log = function (pageName: string, funcName?: string, content?: any, ...args: any[]): void {
  // eslint-disable-next-line no-console
  console.log(pageName, "|", funcName, "|", content, args);
};

/**
 * warn级别日志
 * @param {String} pageName 模块名
 * @param {String} funcName  函数名
 * @param {String} content 日志内容
 * @param {...any} args 附加内容
 */
export const warn = function (pageName: string, funcName?: string, content?: any, ...args: any[]): void {
  // eslint-disable-next-line no-console
  console.warn(pageName, "|", funcName, "|", content, args);
};

/**
 * error级别日志
 * @param {String} pageName 模块名
 * @param {String} funcName  函数名
 * @param {String} content 日志内容
 * @param {...any} args 附加内容
 */
export const error = function (pageName: string, funcName?: string, content?: any, ...args: any[]): void {
  // eslint-disable-next-line no-console
  console.error(pageName, "|", funcName, "|", content, args);
};

export const getLogger = function (name: string): any {
  return {
    log: (...args: any[]) => log(name, ...args),
    warn: (...args: any[]) => warn(name, ...args),
    error: (...args: any[]) => error(name, ...args),
  };
};
