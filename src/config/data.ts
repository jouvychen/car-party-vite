import { HotPoint } from '@/utils/interface';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// html热点
const hotPoints: HotPoint[] = [
  {
    show: true,
    type: 'add',
    name: '查看介绍',
    meshName: '视频面版',
    event: 'CameraAnimation',
  },
  {
    show: true,
    type: 'play',
    name: '播放宣传视频',
    meshName: '屏幕',
    event: 'Play',
  },
  {
    show: true,
    type: 'add',
    name: '控制台',
    meshName: 'Bonsai',
    event: 'Control',
  }
]

export { sizes, hotPoints }