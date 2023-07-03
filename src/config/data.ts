import { HotPoint } from '@/utils/interface';
import * as THREE from 'three';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// 摄像机和控制器预设位置
const initialConfiguration = {
  cameraPosition: new THREE.Vector3(4.25, 1.4, 4.5),
  controlsPosition: new THREE.Vector3(0, 0.5, 0),
};

// html热点
const hotPoints = ref<HotPoint[]>([
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
  },
  {
    show: true,
    type: 'add',
    name: '幻灯片',
    meshName: 'Glass002',
    controlPName: 'p-幻灯片',
    event: 'Control',
  },
  {
    show: true,
    type: 'add',
    name: '旗帜',
    meshName: '旗帜',
    controlPName: 'p-旗帜',
    event: 'Control',
  }
])

const closePointItem = {
  show: true,
  type: 'close',
  name: '退出',
  meshName: '',
  controlPName: '',
  event: '',
};

export { sizes, initialConfiguration, hotPoints, closePointItem }