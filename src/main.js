import './style.css'
import * as THREE from 'three'
import GUI from 'lil-gui';

// Debug UI
const gui = window.location.hash === "#debug" ? new GUI() : null

// Texture Loader
const textureLoader = new THREE.TextureLoader()
const dep_colorMap = textureLoader.load('/cover/dep_colorMap.jpg')
dep_colorMap.colorSpace = THREE.SRGBColorSpace
const dep_depthMap = textureLoader.load('/cover/dep_depthMap11.png')
const dep_roughnessMap = textureLoader.load('/cover/dep_roughnessMap12.png')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Cover
const cover = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 5, 512, 512),
  new THREE.MeshStandardMaterial({
    map: dep_colorMap,
    displacementMap: dep_depthMap,
    displacementScale: 0.95,
    roughnessMap: dep_roughnessMap
  })
)
if(gui) gui.add(cover.material, "displacementScale").min(0.01).max(3).step(0.01)

scene.add(cover)

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

window.addEventListener('mousemove', (e) => {
  mouse.targetX = ((e.clientX / sizes.width) - 0.5) * 2
  mouse.targetY = ((e.clientY / sizes.height) - 0.5) * 2
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

  cover.rotation.y = mouse.x / 16
  cover.rotation.x = mouse.y / 16

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