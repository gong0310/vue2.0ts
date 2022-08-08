export const ERROR_LOGIC = "REQUEST_ERRO_LOGIC";
export const ERROR_NETWORK = "REQUEST_ERROR_NETWORK";
export const PASSPORT_URL = "https://passport.oa.com/modules/passport/signin.ashx?url=";
export const EXERCISE_MIS_URL = "http://wxpay.oa.com/xdc/exercisemis#/";
export const PAGE_SIZE_DEFAULT = 10;
export const PAGE_SIZE_MAX = 200;

/**
 * 把list转换为object
 *
 * @param lists 待转换的list
 * @param keyName list中key的名称
 * @returns 转换后的objects
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const List2Objects = function <T extends object, U extends keyof T>(lists: Array<T>, keyName: U) {
  const tmpObjects: any = {};
  lists.forEach((item) => {
    const keyValue = item[keyName];
    tmpObjects[keyValue] = item;
  });

  return tmpObjects;
};

/**
 * 通用状态
 */
export enum ECommonState {
  Disable = 0,
  Enable = 1,
}
/**
 * 方案审批类型
 */
export enum ECaseAuditType {
  AuditTypeCase = 1, // 方案修改审批
  AuditTypeExecute = 2, // 方案执行审批
}

/**
 * 方案审批类型列表
 */
export const CASE_AUDIT_TYPE_LIST = [
  { id: ECaseAuditType.AuditTypeCase, label: "方案修改审批" },
  { id: ECaseAuditType.AuditTypeExecute, label: "方案执行审批" },
];

export const CASE_AUDIT_TYPE_OBJECTS = List2Objects(CASE_AUDIT_TYPE_LIST, "id");
