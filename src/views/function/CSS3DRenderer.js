import {
	Matrix4,
	Object3D,
	Quaternion,
	Vector3
} from 'three';

/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 */

const _position = new Vector3();
const _quaternion = new Quaternion();
const _scale = new Vector3();

class CSS3DObject extends Object3D {

	constructor(element = document.createElement('div')) {

		super();

		this.isCSS3DObject = true;

		this.element = element;
		this.element.style.position = 'absolute';
		this.element.style.pointerEvents = 'auto';
		this.element.style.userSelect = 'none';

		this.element.setAttribute('draggable', false);

		this.addEventListener('removed', function () {

			this.traverse(function (object) {

				if (object.element instanceof Element && object.element.parentNode !== null) {

					object.element.parentNode.removeChild(object.element);

				}

			});

		});

	}

	copy(source, recursive) {

		super.copy(source, recursive);

		this.element = source.element.cloneNode(true);

		return this;

	}

}

class CSS3DSprite extends CSS3DObject {

	constructor(element) {

		super(element);

		this.isCSS3DSprite = true;

		this.rotation2D = 0;

	}

	copy(source, recursive) {

		super.copy(source, recursive);

		this.rotation2D = source.rotation2D;

		return this;

	}

}

//

const _matrix = new Matrix4();
const _matrix2 = new Matrix4();

class CSS3DRenderer {

	constructor(parameters = {}) {

		const _this = this;

		let _width, _height;
		let _widthHalf, _heightHalf;

		const cache = {
			camera: { fov: 0, style: '' },
			objects: new WeakMap(),
			keepTransformation: false, // 添加一个变量用于保持变换效果
		};

		this.css3DObjects = new Map(); // 用于保持 CSS3DObject 的引用和对应的元素

		const domElement = parameters.element !== undefined ? parameters.element : document.createElement('div');

		domElement.style.overflow = 'hidden';

		this.domElement = domElement;

		const cameraElement = document.createElement('div');

		cameraElement.style.transformStyle = 'preserve-3d';
		cameraElement.style.pointerEvents = 'none';

		domElement.appendChild(cameraElement);

		this.getSize = function () {

			return {
				width: _width,
				height: _height
			};

		};

		this.render = function (scene, camera) {

			const fov = camera.projectionMatrix.elements[5] * _heightHalf;

			if (cache.camera.fov !== fov) {

				domElement.style.perspective = camera.isPerspectiveCamera ? fov + 'px' : '';
				cache.camera.fov = fov;

			}

			if (scene.matrixWorldAutoUpdate === true) scene.updateMatrixWorld();
			if (camera.parent === null && camera.matrixWorldAutoUpdate === true) camera.updateMatrixWorld();

			let tx, ty;

			if (camera.isOrthographicCamera) {

				tx = - (camera.right + camera.left) / 2;
				ty = (camera.top + camera.bottom) / 2;

			}

			const cameraCSSMatrix = camera.isOrthographicCamera ?
				'scale(' + fov + ')' + 'translate(' + epsilon(tx) + 'px,' + epsilon(ty) + 'px)' + getCameraCSSMatrix(camera.matrixWorldInverse) :
				'translateZ(' + fov + 'px)' + getCameraCSSMatrix(camera.matrixWorldInverse);

			const style = cameraCSSMatrix +
				'translate(' + _widthHalf + 'px,' + _heightHalf + 'px)';
			// rotateX(3.14159rad) rotateY(0rad) rotateZ(3.14159rad) translateZ(-904px) translateY(-24.1px) translateX(-6px)
			// if ( cache.camera.style !== style ) {

			// 	cameraElement.style.transform = style;

			// 	cache.camera.style = style;

			// }

			// 在 render 方法中检查 keepTransformation 变量，决定是否改变样式
			if (!cache.keepTransformation) {
				// const style = cameraCSSMatrix + 'translate(' + _widthHalf + 'px,' + _heightHalf + 'px)';
				if (cache.camera.style !== style) {
					cameraElement.style.transform = style;
					cache.camera.style = style;
				}
				renderObject(scene, scene, camera, cameraCSSMatrix);
			}

			// renderObject(scene, scene, camera, cameraCSSMatrix);

		};

		this.setSize = function (width, height) {

			_width = width;
			_height = height;
			_widthHalf = _width / 2;
			_heightHalf = _height / 2;

			domElement.style.width = width + 'px';
			domElement.style.height = height + 'px';

			cameraElement.style.width = width + 'px';
			cameraElement.style.height = height + 'px';

		};

		this.addCSS3DObject = function (css3DObject, element) {
			this.css3DObjects.set(css3DObject, element);
		}

		function getCSSMatrixFromMatrix(matrix) {
			const elements = matrix.elements;
			return `matrix3d(${elements[0]}, ${elements[1]}, ${elements[2]}, ${elements[3]}, ${elements[4]}, ${elements[5]}, ${elements[6]}, ${elements[7]}, ${elements[8]}, ${elements[9]}, ${elements[10]}, ${elements[11]}, ${elements[12]}, ${elements[13]}, ${elements[14]}, ${elements[15]})`;
		}

		// 解析矩阵样式字符串并返回矩阵
		function parseMatrixFromStyle(style) {
			const matrixArray = style.match(/-?[\d.]+/g).map(Number);
			const matrix = new THREE.Matrix4();
			matrix.set(
				matrixArray[0], matrixArray[1], matrixArray[2], matrixArray[3],
				matrixArray[4], matrixArray[5], matrixArray[6], matrixArray[7],
				matrixArray[8], matrixArray[9], matrixArray[10], matrixArray[11],
				matrixArray[12], matrixArray[13], matrixArray[14], matrixArray[15]
			);
			return matrix;
		}


		// /新增
		this.setPositionAndAngle = function (scene, camera, worldPosition) {
			const cameraPosition = camera.position;
			const direction = new THREE.Vector3().subVectors(cameraPosition, worldPosition);
			const rotation = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction));

			const cameraCSSMatrix =
				'rotateX(' + rotation.x + 'rad) ' +
				'rotateY(' + rotation.y + 'rad) ' +
				'rotateZ(' + rotation.z + 'rad) ' +
				'translateZ(' + direction.length() + 'px)';

			const _widthHalf = window.innerWidth / 2;
			const _heightHalf = window.innerHeight / 2;
			const ttt = 'translateX(' + camera.projectionMatrix.elements[5] * _heightHalf + 'px)' + getCameraCSSMatrix(camera.matrixWorldInverse);

			const style2 = ttt +
				'translate(' + _widthHalf + 'px,' + _heightHalf + 'px)';
			// translateZ(902.5463322908435px)matrix3d(-0.00009970858114863734,0.008766358221636694,-0.9999615697724233,0,0,-0.999961574743133,-0.00876635826521339,0,0.9999999950290994,8.740811444674846e-7,-0.0000997047498208739,0,2.2091764833361633,1.0476882951510817,3.9677207775099146,1)translate(683px,328.5px)
			const style = cameraCSSMatrix;
			//  +
			// 	'translate(' + _widthHalf + 'px,' + _heightHalf + 'px)';
			// rotateX(-3.11187rad) rotateY(-0.900648rad) rotateZ(-3.08012rad) translateZ(12.9175px) translate(683px, 328.5px)
			// rotateX(3.14159rad) rotateY(0rad) rotateZ(3.14159rad) translateZ(4.88548px) translate(683px, 328.5px)
			// debugger
			// translateZ(902.5463322908435px)matrix3d(-0.00009970858114863734,0.008766358221636694,-0.9999615697724233,0,0,-0.999961574743133,-0.00876635826521339,0,0.9999999950290994,8.740811444674846e-7,-0.0000997047498208739,0,2.2091764833361633,1.0476882951510817,3.9677207775099146,1)translate(683px,328.5px)
			// const parentStyle = cameraElement.style.transform;
			if (cache.camera.style !== style2) {
				cache.keepTransformation = true;
				// rotateX(180deg) rotateY(180deg)可以
				// cameraElement.style.transform = style2;
				cameraElement.style.transform = 'rotateX(180deg) rotateY(180deg)';
				cache.camera.style = style2;
			}

			const cameraCSSMatrix2 = getCameraCSSMatrix(camera.matrixWorldInverse);

			this.css3DObjects.forEach((element, css3DObject) => {

				// const childStyle = element.style.transform;
				// 父元素的样式字符串
				const parentStyle = "translateZ(850.344px) matrix3d(-0.00027775, 0.00879695, -0.999961, 0, 0, -0.999961, -0.00879695, 0, 1, 2.44335e-06, -0.000277739, 0, 2.21041, 1.04748, 3.96736, 1) translate(683px, 309.5px)";

				// 子元素的样式字符串
				const childStyle = "translate(-50%, -50%) matrix3d(0, 0, 0.0026, 0, 0, -0.0026, 0, 0, -0.0026, 0, 0, 0, 8.30918, 1.33012, -2.65018, 1)";


				// 解析父元素的平移和平移Z
				const parentTranslateZRegex = /translateZ\((-?\d+\.?\d*)px\)/;
				const parentTranslateRegex = /translate\((-?\d+\.?\d*)px,\s*(-?\d+\.?\d*)px\)/;

				const parentTranslateZMatch = parentStyle.match(parentTranslateZRegex);
				const parentTranslateMatch = parentStyle.match(parentTranslateRegex);

				const parentTranslateX = parseFloat(parentTranslateMatch[1] || 0);
				const parentTranslateY = parseFloat(parentTranslateMatch[2] || 0);
				const parentTranslateZ = parseFloat(parentTranslateZMatch[1] || 0);

				// 解析子元素的变换矩阵
				const childMatrix = parseMatrixFromStyle(childStyle);

				// 将父元素的平移应用到子元素的逆矩阵的位移部分
				const newChildMatrix = new THREE.Matrix4();
				newChildMatrix.copy(childMatrix);
				newChildMatrix.elements[12] += parentTranslateX;
				newChildMatrix.elements[13] += parentTranslateY;
				newChildMatrix.elements[14] += parentTranslateZ;

				// 将新的变换矩阵转换为样式字符串
				const newChildStyle = "translate(-50%, -50%) " + getCSSMatrixFromMatrix(newChildMatrix);

				element.style.transform = newChildStyle;
				// 更新 CSS3DObject 在 Map 中的记录
				this.css3DObjects.set(css3DObject, newChildStyle);
			});
		};

		// 添加一个方法用于重新更新 CSS3DObject 的矩阵
		function updateCSS3DObjectMatrix(css3DObject, camera) {
			// 获取摄像机的世界变换矩阵
			const cameraWorldMatrix = new THREE.Matrix4();
			cameraWorldMatrix.copy(camera.matrixWorld);

			// 获取 CSS3DObject 的世界变换矩阵
			const css3DObjectWorldMatrix = new THREE.Matrix4();
			css3DObjectWorldMatrix.copy(css3DObject.matrixWorld);

			// 合并摄像机的世界变换矩阵和 CSS3DObject 的世界变换矩阵
			const combinedMatrix = new THREE.Matrix4();
			combinedMatrix.multiplyMatrices(cameraWorldMatrix, css3DObjectWorldMatrix);
			console.log('计算', combinedMatrix);
			return combinedMatrix;
			// 最终得到 CSS3DObject 的新的 matrixWorld
			// css3DObject.matrixWorld.copy(combinedMatrix);
			// css3DObject.matrixWorldNeedsUpdate = true; // 标记需要更新 matrixWorld
		}

		function epsilon(value) {

			return Math.abs(value) < 1e-10 ? 0 : value;

		}

		function getCameraCSSMatrix(matrix) {

			const elements = matrix.elements;

			return 'matrix3d(' +
				epsilon(elements[0]) + ',' +
				epsilon(- elements[1]) + ',' +
				epsilon(elements[2]) + ',' +
				epsilon(elements[3]) + ',' +
				epsilon(elements[4]) + ',' +
				epsilon(- elements[5]) + ',' +
				epsilon(elements[6]) + ',' +
				epsilon(elements[7]) + ',' +
				epsilon(elements[8]) + ',' +
				epsilon(- elements[9]) + ',' +
				epsilon(elements[10]) + ',' +
				epsilon(elements[11]) + ',' +
				epsilon(elements[12]) + ',' +
				epsilon(- elements[13]) + ',' +
				epsilon(elements[14]) + ',' +
				epsilon(elements[15]) +
				')';

		}

		function getObjectCSSMatrix(matrix) {

			const elements = matrix.elements;
			const matrix3d = 'matrix3d(' +
				epsilon(elements[0]) + ',' +
				epsilon(elements[1]) + ',' +
				epsilon(elements[2]) + ',' +
				epsilon(elements[3]) + ',' +
				epsilon(- elements[4]) + ',' +
				epsilon(- elements[5]) + ',' +
				epsilon(- elements[6]) + ',' +
				epsilon(- elements[7]) + ',' +
				epsilon(elements[8]) + ',' +
				epsilon(elements[9]) + ',' +
				epsilon(elements[10]) + ',' +
				epsilon(elements[11]) + ',' +
				epsilon(elements[12]) + ',' +
				epsilon(elements[13]) + ',' +
				epsilon(elements[14]) + ',' +
				epsilon(elements[15]) +
				')';

			return 'translate(-50%,-50%)' + matrix3d;

		}

		function renderObject(object, scene, camera, cameraCSSMatrix) {

			if (object.isCSS3DObject) {

				const visible = (object.visible === true) && (object.layers.test(camera.layers) === true);
				object.element.style.display = (visible === true) ? '' : 'none';

				if (visible === true) {

					object.onBeforeRender(_this, scene, camera);

					let style;

					if (object.isCSS3DSprite) {

						// http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

						_matrix.copy(camera.matrixWorldInverse);
						_matrix.transpose();

						if (object.rotation2D !== 0) _matrix.multiply(_matrix2.makeRotationZ(object.rotation2D));

						object.matrixWorld.decompose(_position, _quaternion, _scale);
						_matrix.setPosition(_position);
						_matrix.scale(_scale);

						_matrix.elements[3] = 0;
						_matrix.elements[7] = 0;
						_matrix.elements[11] = 0;
						_matrix.elements[15] = 1;

						style = getObjectCSSMatrix(_matrix);

					} else {

						style = getObjectCSSMatrix(object.matrixWorld);

					}

					const element = object.element;
					const cachedObject = cache.objects.get(object);

					if (cachedObject === undefined || cachedObject.style !== style) {

						element.style.transform = style;

						const objectData = { style: style };
						cache.objects.set(object, objectData);

					}

					if (element.parentNode !== cameraElement) {

						cameraElement.appendChild(element);

					}

					object.onAfterRender(_this, scene, camera);

				}

			}

			for (let i = 0, l = object.children.length; i < l; i++) {

				renderObject(object.children[i], scene, camera, cameraCSSMatrix);

			}

		}

	}

}

export { CSS3DObject, CSS3DSprite, CSS3DRenderer };
