const getLocalImgUrl = (name: string) => {
  return new URL("The image path in your project + name", import.meta.url).href;
};

import { RULES } from '@/utils/rules';

export class LoadViteImage {
  public imageUrlList: string[];
  public imageList: HTMLImageElement[] = [];

  constructor(imageUrlList: string[]) {
    this.imageUrlList = imageUrlList;
    this.asyncLoadImage();
  }

  loadImgs(): Promise<HTMLImageElement[]> {
    let proList: Promise<HTMLImageElement>[] = [];
    for (let i = 0; i < this.imageUrlList.length; i++) {
      let pro = new Promise<HTMLImageElement>((resolve, reject) => {
        let img = new Image();
        // The picture is a web picture
        if (RULES.isNetworkImageLoose.pattern.test(this.imageUrlList[i])) {
          img.setAttribute("crossOrigin", "Anonymous");
        }
        img.onload = function () {
          resolve(img)
        }
        // Just focus on your local image path
        img.src = this.imageUrlList[i];
      })
      proList.push(pro)
    }

    return Promise.all(proList)
      .then((rs) => {
        console.log("loaded all images");
        return Promise.resolve(rs);
      })
  }

  asyncLoadImage = async () => {
    try {
      this.imageList = await this.loadImgs();
    } catch (err) {
      console.log('load image error:', err)
    }
  }
}