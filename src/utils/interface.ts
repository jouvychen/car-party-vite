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

export type { Position, ObjectKeys, State, View }