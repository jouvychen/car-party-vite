import { getAssetsUrlRelative } from "@/utils/common";
import { LoadViteImage } from "./loadViteImages";
import { ThreeGlTransitions } from "./threeGlTransitions/index";
import { morph, flyEye, crossWarp, ripple } from "./threeGlTransitions/type/index";

export const createTransitions = (transitionMesh: THREE.Mesh) => {
  const imgUrlList = [
    getAssetsUrlRelative(
      "../assets/images/lamborghini/black/",
      "Lamborghini-Centenario-02.jpg"
    ),
    getAssetsUrlRelative(
      "../assets/images/lamborghini/black/",
      "Lamborghini-Centenario-01.jpg"
    ),
    getAssetsUrlRelative(
      "../assets/images/lamborghini/black/",
      "Lamborghini-Centenario-03.jpg"
    ),
  ];
  new LoadViteImage(imgUrlList)
    .asyncLoadImage()
    .then((imageList: HTMLImageElement[]) => {
      const threeGlTransitions = new ThreeGlTransitions(
        transitionMesh,
        [morph, flyEye, crossWarp, ripple],
        imageList
      );
      threeGlTransitions.main();
    });
}