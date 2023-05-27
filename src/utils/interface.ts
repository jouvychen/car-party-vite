interface Position {
  x: number;
  y: number;
  z: number;
}
interface ObjectKeys {
  [key: string]: any;
}

interface State {
  cachedViews: string[]
}
interface View {
  name: string,
  meta: {
    title: string,
    keepAlive: boolean,
  },
  [key: string]: any;
}


// 过渡动画对象类型
interface Transition {
  vsSource: string,
  fsSource: string,
  uniforms: ObjectKeys,
  intervalTime?: number,
  [key: string]: any; // 用户拓展更多类型
}

// index.ts中动态导入的过渡动画返回Promise所需类型
interface TransitionObj {
  [key: string]: Transition;
}

export type { Position, ObjectKeys, State, View, Transition, TransitionObj }