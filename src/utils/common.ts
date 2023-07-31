import { ObjectKeys } from "./interface";

// 防抖函数
export const debounce = (fn: any, delay: number) => {
  let timer: any = null;
  return function () {
    if (timer) { clearTimeout(timer); }
    timer = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line prefer-rest-params
      fn.apply(this, arguments);
      timer = null;
    }, delay);
  };
};

// 节流函数
export const throttle = (fn: any, delay: number) => {
  let timer: any = null;
  let status = false;
  return function () {
    if (timer) { return; }
    if (!status) {
      status = true;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line prefer-rest-params
      fn.apply(this, arguments);
    }
    timer = setTimeout(() => {
      if (status) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line prefer-rest-params
        fn.apply(this, arguments);
        timer = null;
      }
    }, delay);
  };
};

export const getImageUrl = (name: string) => {
  return new URL(`../../assets/images/home/${name}`, import.meta.url).href;
};

// 相对于本文件和静态资源的路径
export const getAssetsUrlRelative = (prefix: string, name: string) => {
  return new URL(`${prefix}${name}`, import.meta.url).href;
};

export const uuid = () => {
  const tempUrl = URL.createObjectURL(new Blob());
  const uuid = tempUrl.toString();
  URL.revokeObjectURL(tempUrl); // 释放这个url
  return uuid.substring(uuid.lastIndexOf('/') + 1);
};

// 判断是否是字符串数组
export const isArrayOfStrings = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

/**
 * 查找对象数组arr2中与给定关键字数组arr1中的交集相等的对象，并按arr1中出现顺序排序
 * @param arr1 关键字数组 ['小米', '大白']
 * @param arr2 对象数组 [{ name: '李白', age: 21 }, { name: '大白', age: 111 }]
 * @param prop 要查找的关键key name
 * @returns [{ name: '大白', age: 111 }] 即查找名字为大白的对象
 */
/*使用两个泛型参数 T 和 K。T 表示对象数组中的元素类型，
而 K 表示要查找的属性名称的类型。通过使用 T extends Record<K, string>，
限制 T 的类型必须是一个包含属性 K，且 K 对应的值是字符串类型的对象。
在 findObjectsByKeywords 函数中，使用 T[K][] 来表示 arr1 的类型，
即关键字数组的元素类型。确保关键字数组中的元素类型与要查找的属性类型一致。
此外，在 resultMap 的构建过程中，通过 arr1.map(keyword => resultMap.get(keyword)) 
来按照 arr1 中的顺序获取对应的对象，然后使用 .filter(obj => obj !== undefined) as T[] 
来过滤掉可能的 undefined 值，并将结果强制转换为 T[] 类型。*/
export const findObjectsByKeywords = <T extends Record<K, string>, K extends keyof T>(
  arr1: T[K][],
  arr2: T[],
  prop: K
): T[] => {
  const keywordSet = new Set(arr1);
  const resultMap = new Map<T[K], T>();

  for (const obj of arr2) {
    const value = obj[prop];
    if (keywordSet.has(value)) {
      resultMap.set(value, obj);
    }
  }

  return arr1.map(keyword => resultMap.get(keyword)).filter(obj => obj !== undefined) as T[];
}