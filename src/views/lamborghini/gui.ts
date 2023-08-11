import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'; // GUI调试工具
import { ObjectKeys } from '@/utils/interface';

/**
 * 无法继承GUI类，因为在super()时自动生成一个实例，使用appendChild时控件内容又变空，所以抽取成方法，不封装成类
 */
interface Gui {
  container: HTMLDivElement | null,
}
let gui: typeof GUI;

// 创建gui实例
const createGUI = (guiParams: Gui) => {
  gui = new GUI({container: guiParams.container || document.body});
  gui.open();
};

const createLightGUI = (testParams: any) => {
  const params = {
    intensity: testParams.rectLight.intensity,
  };

  gui.add(params, 'intensity', 0, 10).onChange(function (val:any) {

    testParams.rectLight.intensity = val;

  });

  gui.open();
};

// 辉光
const createBloomGUI = (bloomParams: any) => {
  const params = {
    threshold: bloomParams.bloomPass.threshold,
    strength: bloomParams.bloomPass.strength,
    radius: bloomParams.bloomPass.radius,
  };

  gui.add(params, 'threshold', 0, 5).onChange(function (val:any) {

    bloomParams.bloomPass.threshold = val;

  });
  gui.add(params, 'strength', 0, 5).onChange(function (val:any) {

    bloomParams.bloomPass.strength = val;

  });
  gui.add(params, 'radius', 0, 5).onChange(function (val:any) {

    bloomParams.bloomPass.radius = val;

  });

  gui.open();
};

// 辉光
const createMainStageGUI = (stageMaterialParams: ObjectKeys) => {
  const params = {
    roughness: stageMaterialParams.material.roughness,
  };

  gui.add(params, 'roughness', 0, 1).onChange(function (val:number) {

    stageMaterialParams.material.roughness = val;

  });

  gui.open();
};
export { createGUI, createLightGUI, createBloomGUI, createMainStageGUI };
// export class CreateGUI extends GUI {
//   public gui: GUI;
//   // public constructor({parent: null, autoPlace: a, container: e, width: s, title: t}) {
//   public constructor(guiParams: Gui) {
//     super();
//     console.log('guiParams.container', guiParams.container);

//     // this.gui = new GUI({parent: parent, autoPlace, container, width, title} = {});
//     // this.gui = new GUI({container: guiParams.container || document.body});
//   }
// }
// GUI

// const gui = new GUI();

// const params = {
//   map: textures[ 'disturb.jpg' ],
//   color: spotLight.color.getHex(),
//   intensity: spotLight.intensity,
//   distance: spotLight.distance,
//   angle: spotLight.angle,
//   penumbra: spotLight.penumbra,
//   decay: spotLight.decay,
//   focus: spotLight.shadow.focus,
//   shadows: true,
// };

// gui.add(params, 'map', textures).onChange(function (val) {

//   spotLight.map = val;

// });

// gui.addColor(params, 'color').onChange(function (val) {

//   spotLight.color.setHex(val);

// });

// gui.add(params, 'intensity', 0, 10).onChange(function (val) {

//   spotLight.intensity = val;

// });

// gui.add(params, 'distance', 50, 200).onChange(function (val) {

//   spotLight.distance = val;

// });

// gui.add(params, 'angle', 0, Math.PI / 3).onChange(function (val) {

//   spotLight.angle = val;

// });

// gui.add(params, 'penumbra', 0, 1).onChange(function (val) {

//   spotLight.penumbra = val;

// });

// gui.add(params, 'decay', 1, 2).onChange(function (val) {

//   spotLight.decay = val;

// });

// gui.add(params, 'focus', 0, 1).onChange(function (val) {

//   spotLight.shadow.focus = val;

// });

// gui.add(params, 'shadows').onChange(function (val) {

//   renderer.shadowMap.enabled = val;

//   scene.traverse(function (child) {

//     if (child.material) {

//       child.material.needsUpdate = true;

//     }

//   });

// });

// gui.open();

// GUI面板数据及监听
// const createPanel = () => {
//   // 创建超级面板
//   panel = new GUI({ width: 310 });
//   // 创建折叠子面板1个
//   const visibleGui = panel.addFolder('开关控制');
//   const animationsGui = panel.addFolder('动画');
//   // 数值初始化(key.value)，用于固定gui的控制
//   const settings = {
//     '启动/停止动画': false,
//   };
//     // 数值初始化(key.value)，用于动态数据的gui控制
//   const dynamicSettings = Object.create(null);

//   /*
//     * 添加子面板数据交互项目
//     * */
//   // 启动/停止动画
//   visibleGui.add(settings, '启动/停止动画').onChange(actionsShow);
//   // 项目4——动画控制
//   for (let i = 0; i < animations.length; i++) {

//     actions[i] = mixer.clipAction(animations[ i ]);

//     dynamicSettings[ animations[ i ].name || '动画' + i ] = () => {
//       for (let j = 0; j < actions.length; j++) {
//         if (j === i) {
//           actions[j].play();
//         } else {
//           actions[j].stop();
//         }
//       }
//     };

//     animationsGui.add(dynamicSettings, animations[ i ].name || '动画' + i);

//   }

//   // 初始自动展开面板
//   visibleGui.open();
//   animationsGui.open();
// };

// // GUI响应方法
// // 启动/停止动画
// const actionsShow = (symbol) => {
//   actions.forEach((action) => {
//     symbol && action.play();
//     !symbol && action.stop();
//   });
// };
