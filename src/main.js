import './style.css'
import * as THREE from 'three'
import coverVertexShader from './shaders/cover/vertex.glsl'
import coverFragmentShader from './shaders/cover/fragment.glsl'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import GUI from 'lil-gui';
import { gsap } from "gsap";

let isCoverVisible = false;

// Debug UI
const gui = window.location.hash === "#debug" ? new GUI() : null

// Texture Loader
const textureLoader = new THREE.TextureLoader()
const dep_colorMap = textureLoader.load('/cover/dep_colorMap.jpg')
dep_colorMap.colorSpace = THREE.SRGBColorSpace
const dep_depthMap = textureLoader.load('/cover/dep_depthMap11.png')
const dep_roughnessMap = textureLoader.load('/cover/dep_roughnessMap.png')
const dep_normalMap = textureLoader.load('/cover/dep_normalMap.png')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/* Cover */
const uniforms = {
  uDisplacementScale : new THREE.Uniform(1.2),
  uDisplacementMap: new THREE.Uniform(dep_depthMap),
  uTransitionProgression: new THREE.Uniform(0.0)
}

if(gui) gui.add(uniforms.uDisplacementScale, "value").min(0.01).max(3).step(0.01).name("uDisplacementScale")
if(gui) gui.add(uniforms.uTransitionProgression, "value").min(0.0).max(1).step(0.01).name('uTransitionProgression')


const coverMaterial = new CustomShaderMaterial({
  // CSM
  baseMaterial: THREE.MeshStandardMaterial,
  vertexShader: coverVertexShader,
  fragmentShader: coverFragmentShader,
  uniforms: uniforms,

  // MeshStandardMateriel
  map: dep_colorMap,
  // displacementMap: dep_depthMap,
  // displacementScale: uniforms.uDisplacementScale.value,
  roughnessMap: dep_roughnessMap,
  normalMap: dep_normalMap,
})

const cover = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 5, 512, 512),
  coverMaterial
)

scene.add(cover)

/* Vynil */


// Lights
const ambientLight = new THREE.AmbientLight(0xfff4be, 2.2)
scene.add(ambientLight)

if(gui){
gui.addColor(ambientLight, 'color').name('AmbientLightColor')
gui.add(ambientLight, 'intensity').min(1).max(5).step(0.1).name('AmbientLightIntensity')
}

const pointLight = new THREE.PointLight(0xccccff, 19, 100)
pointLight.position.set(0, 0, 3.8)
scene.add(pointLight)

if(gui){
gui.addColor(pointLight, 'color').name('PointLightColor')
gui.add(pointLight, 'intensity').min(1).max(50).step(1).name('PointLightIntensity')
gui.add(pointLight, 'distance').min(10).max(1000).step(10).name('PointLightDistance')
}


// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Mouse position
const mouse = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth,
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)

const updateCameraPosition = () => {
  const aspect = sizes.width / sizes.height
  const baseDistance = aspect < 1 ? 14 : 7
  camera.position.set(0, 0, baseDistance)
}

updateCameraPosition()
camera.lookAt(0, 0, 0)  

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Interactivity

const isMobile = /Mobi|Android/i.test(navigator.userAgent)

const raycaster = new THREE.Raycaster()
const mouseVec = new THREE.Vector2()

const toggleVisibility = () => {
  gsap.to(uniforms.uTransitionProgression, {
    value: isCoverVisible ? 0 : 1,
    duration: 5,
    ease: 'power1.inOut',
    onComplete: () => {
      isCoverVisible = isCoverVisible ? false : true
    }
  })
}

window.addEventListener('mousemove', (e) => {
  mouse.targetX = ((e.clientX / sizes.width) - 0.5) * 2
  mouse.targetY = ((e.clientY / sizes.height) - 0.5) * 2

  mouseVec.x = (e.clientX / sizes.width) * 2 - 1
  mouseVec.y = (e.clientY / sizes.height) * 2 - 1

  raycaster.setFromCamera(mouseVec, camera)
  const intersects = raycaster.intersectObject(cover)

  canvas.style.cursor = intersects.length > 0 ? 'pointer' : 'default'
})

window.addEventListener('click', (e) => {
  mouseVec.x = (e.clientX / sizes.width) * 2 - 1
  mouseVec.y = (e.clientY / sizes.height) * 2 - 1

  raycaster.setFromCamera(mouseVec, camera)

  const intersects = raycaster.intersectObject(cover)

  if(intersects.length > 0 ){
    toggleVisibility()
  }

})

// Animate
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // Lerp mouse positions (0.1 = smoothing factor, lower = smoother)
  mouse.x += (mouse.targetX - mouse.x) * 0.1
  mouse.y += (mouse.targetY - mouse.y) * 0.1

  cover.rotation.y = mouse.x / 14
  cover.rotation.x = mouse.y / 14

  // uniforms.uTransitionProgression.value = (Math.sin(elapsedTime) + 1.0) * 0.5;

  camera.position.x = mouse.x
  camera.position.y = -mouse.y / 1.3
  updateCameraPosition()
  camera.lookAt(0, 0, 0)

  pointLight.position.x = mouse.x * 3
  pointLight.position.y = -mouse.y * 3
  pointLight.position.z = 3.8

  renderer.render(scene, camera)

  window.requestAnimationFrame(tick)
}

tick()