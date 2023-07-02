/**
 * 创建宣传视频
 */
import * as THREE from 'three';
import { getAssetsUrlRelative } from '@/utils/common'
export class CreatePromotionalFilm {
  public modal: THREE.Object3D;
  private videoMesh!: THREE.Mesh;
  private videoSource!: HTMLVideoElement;
  private videoStatus = 'empty'; // empty, loading, loaded, playing, played
  private videoMaterial!: THREE.MeshBasicMaterial;
  private coverMaterial!: THREE.MeshBasicMaterial;
  private coverLoadingMaterial!: THREE.MeshBasicMaterial;
  private textureLoader: THREE.TextureLoader;

  constructor(modal: THREE.Object3D, meshName: string) {

    this.textureLoader = new THREE.TextureLoader();

    this.modal = modal;
    this.videoMesh = this.modal.getObjectByName(meshName) as THREE.Mesh;

    // 创建封面贴图
    this.creatCoverTexture();

    // 创建封面加载中贴图
    this.creatCoverLoadingTexture();

  }

  // 创建封面默认贴图
  creatCoverTexture() {
    const coverTexture = this.textureLoader.load(getAssetsUrlRelative('../assets/images/poster/', '视频封面.png'), () => {
      this.setTexture();
    });
    coverTexture.center.set(0.5, 0.5);
    coverTexture.repeat.set(0.8, -0.9);
    this.coverMaterial = new THREE.MeshBasicMaterial({
      map: coverTexture,
    });
  }

  // 创建封面加载贴图
  creatCoverLoadingTexture() {
    const coverLoadingTexture = this.textureLoader.load(getAssetsUrlRelative('../assets/images/home/', 'bg_member.jpg'));
    coverLoadingTexture.center.set(0.5, 0.5);
    coverLoadingTexture.repeat.set(0.8, -0.9);
    this.coverLoadingMaterial = new THREE.MeshBasicMaterial({
      map: coverLoadingTexture,
    });
  }

  // 创建宣传视频
  creatVideoTexture() {
    return new Promise((resovle, reject) => {
      this.setVideoStatus('loading');
      this.setTexture();
      this.videoSource = document.createElement("video");
      this.videoSource.src = getAssetsUrlRelative('../assets/video/', 'Lamborghini-Centenario-Lp-770-4.mp4');
      this.videoSource.loop = false;
      this.videoSource.addEventListener('canplaythrough', () => {
        this.setVideoStatus('loaded');
        console.log('视频纹理加载完成');
        resovle('视频加载完成');
      });
      this.videoSource.addEventListener('error', (event) => {
        console.error('视频纹理加载失败');
        reject(event);
      });
      this.videoSource.addEventListener('ended', () => {
        this.setVideoStatus('played');
        this.setTexture();
      });
      const videoTexture = new THREE.VideoTexture(this.videoSource);
      videoTexture.center.set(0.5, 0.5);
      videoTexture.repeat.set(0.8, -0.9);
      // 视频贴图使用基础材质，其他材质会被光照影响
      this.videoMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: videoTexture,
      });
    })
  }

  setVideoStatus(status: string) {
    this.videoStatus = status;
  };

  setTexture() {
    switch (this.videoStatus) {
      // 设置默认贴图
      case 'empty':
        this.videoMesh.material = this.coverMaterial;
        break;
      // 设置视频加载中贴图
      case 'loading':
        this.videoMesh.material = this.coverLoadingMaterial;
        break;
      // 设置视频纹理贴图
      case 'loaded':
        this.videoMesh.material = this.videoMaterial;
        break;
      // 设置播放完毕贴图
      case 'played':
        this.videoMesh.material = this.coverMaterial;
        break;
    }
  }

  async onPlay() {
    if (this.videoStatus === 'played') {
      this.rePlay();
    } else if (this.videoStatus === 'playing') {
      return '视频正在播放'
    }
    // 创建宣传视频
    await this.creatVideoTexture().then((res) => {
      if (res === '视频加载完成') {
        this.setTexture();
        this.videoSource.play();
        this.setVideoStatus('playing');
      }
    }).catch((e) => {
      console.log('视频加载失败信息', e);
    });
  }

  rePlay() {
    if (this.videoStatus === 'loaded') {
      this.videoSource.play();
    }
  }

  onPause() {
    if (this.videoStatus === 'playing') {
      this.videoSource.pause();
      this.setVideoStatus('played');
      this.setTexture();
    }
  }

}