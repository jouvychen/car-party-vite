
// 滚轮每个子对象
interface Revolver {
    index: number;
    name: string;
    uuid: string;
    state: boolean,
    unfoldClass: {
      width: string,
      height: string,
      top: string,
      right: string,
    };
}

export {
  Revolver,
};
