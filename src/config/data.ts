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
    controlPName: 'p-宣传',
    event: 'CameraAnimation',
  },
  {
    show: true,
    type: 'play',
    name: '播放宣传视频',
    meshName: '屏幕',
    controlPName: 'p-宣传视频',
    event: 'Play',
  },
  {
    show: true,
    type: 'add',
    name: '控制台',
    meshName: 'Bonsai',
    controlPName: 'p-控制台',
    event: 'Control',
  },
  {
    show: true,
    type: 'add',
    name: '作者介绍',
    meshName: '作者面板',
    controlPName: 'p-作者面板',
    event: 'Control',
  }
]

export { sizes, hotPoints }