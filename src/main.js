

import './style.css'
import * as THREE from 'three'
import { initializeApp } from "firebase/app"
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore"


const firebaseConfig = {
  apiKey: "AIzaSyCCU_FQre1ZnKNBe3BcGA3p2zMhWiw4_ow",
  authDomain: "sejal-universe.firebaseapp.com",
  projectId: "sejal-universe",
  storageBucket: "sejal-universe.firebasestorage.app",
  messagingSenderId: "577149479846",
  appId: "1:577149479846:web:4da2721e625e8a19973d67"
};

const messages = {
  first: "My universe is expanding because you showed up.",
  final: "And that’s how my design speaks."
}


const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const metaRef = doc(db, "universe", "meta")
const starsRef = doc(db, "universe", "stars")



const canvas = document.getElementById("universe")
const introOverlay = document.getElementById("introOverlay")
const enterUniverse = document.getElementById("enterUniverse")

const contactBtn = document.getElementById("contactBtn")
const messageOverlay = document.getElementById("messageOverlay")
const messageText = document.getElementById("messageText")
const finalOverlay = document.getElementById("finalOverlay")
const finalText = document.getElementById("finalText")



document.getElementById("curiousLink").addEventListener("click", () => {

  document.getElementById("curiousLink").style.opacity = 0

  setTimeout(() => {
    contactBtn.classList.add("show")
  }, 600)

})

contactBtn.addEventListener("click", () => {
  window.location.href = "https://sejal-arora-design-portfolio.framer.website/#contact"
})



// ================= SCENE =================

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
)

camera.position.set(0, 200, 900)

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0x000000)

// ================= GALAXY GROUP =================

const galaxyGroup = new THREE.Group()
scene.add(galaxyGroup)

// ================= SPIRAL GALAXY =================

const galaxyGeometry = new THREE.BufferGeometry()
const starCount = 6000

const positions = []
const colors = []

const colorInside = new THREE.Color(0xff88ff)   // pink core
const colorOutside = new THREE.Color(0x4422aa)  // purple outer

for (let i = 0; i < starCount; i++) {

  const radius = Math.random() * 600
  const branches = 4
  const branchAngle = (i % branches) / branches * Math.PI * 2

  const spin = radius * 0.003

  const randomOffset = () => (Math.random() - 0.5) * 40

  const x = Math.cos(branchAngle + spin) * radius + randomOffset()
  const y = (Math.random() - 0.5) * 80
  const z = Math.sin(branchAngle + spin) * radius + randomOffset()

  positions.push(x, y, z)

  const mixedColor = colorInside.clone()
  mixedColor.lerp(colorOutside, radius / 600)

  colors.push(mixedColor.r, mixedColor.g, mixedColor.b)
}

galaxyGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(positions, 3)
)

galaxyGeometry.setAttribute(
  'color',
  new THREE.Float32BufferAttribute(colors, 3)
)

const galaxyMaterial = new THREE.PointsMaterial({
  size: 2,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  blending: THREE.AdditiveBlending
})

const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial)
galaxyGroup.add(galaxy)

galaxyGroup.rotation.x = -0.4
// Dim galaxy during intro




//======================Orbit Lines=======================

function createOrbitLines() {

  const orbitGroup = new THREE.Group()
  galaxyGroup.add(orbitGroup)

  const orbitCount = 12
  const maxRadius = 900

  for (let i = 1; i <= orbitCount; i++) {

    const radius = (i / orbitCount) * maxRadius

    const geometry = new THREE.BufferGeometry()
    const points = []

    const segments = 128

    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2
      points.push(
        Math.cos(theta) * radius,
        0,
        Math.sin(theta) * radius
      )
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3)
    )

    const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })


    const line = new THREE.LineLoop(geometry, material)

    orbitGroup.add(line)
  }
}

createOrbitLines()


function createGlowTexture() {
  const size = 256
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext("2d")

  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  )

  gradient.addColorStop(0, "rgba(255,150,255,1)")
  gradient.addColorStop(0.3, "rgba(255,100,255,0.6)")
  gradient.addColorStop(0.6, "rgba(150,50,255,0.3)")
  gradient.addColorStop(1, "rgba(0,0,0,0)")

  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  return new THREE.CanvasTexture(canvas)
}


function createStarTexture() {
  const size = 512
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  ctx.clearRect(0, 0, size, size)


  const center = size / 2

  // === Soft Golden Glow ===
  const glow = ctx.createRadialGradient(
    center, center, 0,
    center, center, center
  )

  glow.addColorStop(0, "rgba(255,255,255,0.8)")
  glow.addColorStop(0.15, "rgba(255,230,150,0.8)")
  glow.addColorStop(0.35, "rgba(255,200,80,0.6)")
  glow.addColorStop(0.6, "rgba(255,170,0,0.2)")
  glow.addColorStop(1, "rgba(0,0,0,0)")


  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)

  // === Thin Elegant Rays ===
  ctx.translate(center, center)

  const rayCount = 4
  for (let i = 0; i < rayCount; i++) {
    ctx.rotate(Math.PI / rayCount)

    const rayGradient = ctx.createLinearGradient(0, -center, 0, 0)
    rayGradient.addColorStop(0, "rgba(255,240,200,0)")
    rayGradient.addColorStop(0.5, "rgba(255,240,200,0.9)")
    rayGradient.addColorStop(1, "rgba(255,240,200,0)")

    ctx.strokeStyle = rayGradient
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.moveTo(0, -center + 30)
    ctx.lineTo(0, center - 30)
    ctx.stroke()
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0)

  return new THREE.CanvasTexture(canvas)
}











// ================= BACKGROUND STARS =================

function createBackgroundStars(count, size, opacity, spread) {

  const geometry = new THREE.BufferGeometry()
  const positions = []

  for (let i = 0; i < count; i++) {
    positions.push(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread * 0.8,
      (Math.random() - 0.5) * spread
    )
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  )

  const material = new THREE.PointsMaterial({
  color: 0xffffff,
  size: size,
  transparent: true,
  opacity: opacity,
  blending: THREE.AdditiveBlending,
  depthWrite: false
})




  const stars = new THREE.Points(geometry, material)
  scene.add(stars)
}

// Far tiny layer
createBackgroundStars(4000, 1.2, 0.7, 3500)
createBackgroundStars(2000, 1.8, 0.85, 3000)
createBackgroundStars(400, 1.6, 1.0, 2500)


// ================= GLOWING CORE =================

const coreTexture = createGlowTexture()

const coreMaterial = new THREE.SpriteMaterial({
  map: coreTexture,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  opacity: 0.8
})

const coreSprite = new THREE.Sprite(coreMaterial)
coreSprite.scale.set(800, 800, 1)

galaxyGroup.add(coreSprite)

galaxyMaterial.opacity = 0.4
coreSprite.material.opacity = 0.3

// ================= RINGED PLANET =================

function createPlanet(size, baseColor, position) {

  // === Create surface texture ===
  const textureSize = 512
  const canvas = document.createElement("canvas")
  canvas.width = textureSize
  canvas.height = textureSize
  const ctx = canvas.getContext("2d")

  const gradient = ctx.createLinearGradient(0, 0, textureSize, textureSize)
  gradient.addColorStop(0, baseColor)
  gradient.addColorStop(1, "#000000")

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, textureSize, textureSize)

  const texture = new THREE.CanvasTexture(canvas)

  // === Planet mesh ===
  const geometry = new THREE.SphereGeometry(size, 64, 64)

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.4,
    metalness: 0.25
  })

  const planet = new THREE.Mesh(geometry, material)
  planet.position.set(...position)

  // === Ring ===
  const ringGeo = new THREE.RingGeometry(size + 15, size + 35, 128)

 // === Ring Texture ===
// === Ring Texture (Dreamy Glow Version) ===
  const ringCanvas = document.createElement("canvas")
  ringCanvas.width = 512
  ringCanvas.height = 512
  const ringCtx = ringCanvas.getContext("2d")

  const ringGradient = ringCtx.createRadialGradient(
  256, 256, 100,
  256, 256, 256
  )

  ringGradient.addColorStop(0, "rgba(255,255,255,0)")
  ringGradient.addColorStop(0.35, "rgba(255,255,255,0.4)")
  ringGradient.addColorStop(0.5, "rgba(255,255,255,0.8)")
  ringGradient.addColorStop(0.65, "rgba(255,255,255,0.4)")
  ringGradient.addColorStop(1, "rgba(255,255,255,0)")

  ringCtx.fillStyle = ringGradient
  ringCtx.fillRect(0, 0, 512, 512)

  const ringTexture = new THREE.CanvasTexture(ringCanvas)

  const ringMat = new THREE.MeshBasicMaterial({
    map: ringTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    opacity: 0.9
  })



  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 2.3

  planet.add(ring)

  const haloGeo = new THREE.RingGeometry(size + 40, size + 60, 128)

const haloMat = new THREE.MeshBasicMaterial({
  color: baseColor,
  transparent: true,
  opacity: 0.25,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  depthWrite: false
})

const halo = new THREE.Mesh(haloGeo, haloMat)
halo.rotation.x = Math.PI / 2.3

planet.add(halo)

  // === Atmosphere Glow ===
  const glowGeo = new THREE.SphereGeometry(size + 10, 64, 64)

  const glowMat = new THREE.MeshBasicMaterial({
    color: baseColor,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide
  })

  const glow = new THREE.Mesh(glowGeo, glowMat)
  planet.add(glow)

  scene.add(planet)

  return { planet, ring }
}


const saturn1 = createPlanet(70, "#a07dff", [-600, 500, -300])
const saturn2 = createPlanet(45, "#ff8fcf", [700, 600, -800])


// ================= USER STARS =================

const userStars = []

function createUserStar() {

  const starTexture = createStarTexture()

  const material = new THREE.SpriteMaterial({
    map: starTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    alphaTest: 0.1

  })

  const star = new THREE.Sprite(material)
  star.scale.set(95, 95, 1)

  // Halo glow mesh
const haloGeo = new THREE.CircleGeometry(140, 64)
const haloMat = new THREE.MeshBasicMaterial({
  color: 0xffd88c,
  transparent: true,
  opacity: 0.15,
  blending: THREE.AdditiveBlending,
  depthWrite: false
})

const halo = new THREE.Mesh(haloGeo, haloMat)
halo.rotation.x = -Math.PI / 2

star.add(halo)


  star.userData = {
  radius: 0,
  angle: 0,
  pulseOffset: Math.random() * Math.PI,
  state: "placing",
  targetRadius: 0,
  targetAngle: 0,
  landingProgress: 0
}

  return star
}


let placingStar = null

const cta = document.querySelector(".cta")

cta.addEventListener("click", () => {

  console.log("CTA CLICKED")

  if (sessionStorage.getItem("starPlaced")) return

  cta.style.opacity = 0.3

  placingStar = createUserStar()

  

  galaxyGroup.add(placingStar)

})


document.addEventListener("mousemove", (e) => {

  if (!placingStar) return

  const x = (e.clientX / window.innerWidth) * 2 - 1
  const y = -(e.clientY / window.innerHeight) * 2 + 1

  const maxRadius = 900

  placingStar.position.x = x * maxRadius
  placingStar.position.z = y * maxRadius
  placingStar.position.y = 80

  console.log("Mouse moving", placingStar.position.x, placingStar.position.z)


})






canvas.addEventListener("click", () => {

  if (!placingStar) return

  // Convert to galaxy local space
  const localPos = galaxyGroup.worldToLocal(
    placingStar.position.clone()
  )

  const radius = Math.sqrt(
    localPos.x * localPos.x +
    localPos.z * localPos.z
  )

  const angle = Math.atan2(
    localPos.z,
    localPos.x
  )

  placingStar.userData.radius = radius
  placingStar.userData.angle = angle
  placingStar.userData.targetRadius = radius
  placingStar.userData.targetAngle = angle
  placingStar.userData.state = "landing"
  placingStar.userData.landingProgress = 0

  userStars.push(placingStar)

  sparkleBurst(placingStar.position)

  setTimeout(() => {
  startFinalSequence(placingStar)
}, 2000)


  incrementCounter(radius, angle)

  sessionStorage.setItem("starPlaced", "true")

  placingStar = null
})


// ================= COUNTER =================

let starCountValue = 0

const counterDiv = document.createElement("div")
counterDiv.style.position = "fixed"
counterDiv.style.top = "30px"
counterDiv.style.right = "40px"
counterDiv.style.fontFamily = "Poppins"
counterDiv.style.fontSize = "16px"
counterDiv.style.color = "white"
counterDiv.style.opacity = "0.8"
counterDiv.innerText = "✦ 0"

document.body.appendChild(counterDiv)

async function incrementCounter(radius, angle) {
  try {
    const metaSnap = await getDoc(metaRef)
    const currentCount = metaSnap.data().totalCount || 0

    await updateDoc(metaRef, {
      totalCount: currentCount + 1
    })

    const starsSnap = await getDoc(starsRef)
    const currentStars = starsSnap.data().list || []

    currentStars.push({ radius, angle })

    await updateDoc(starsRef, {
      list: currentStars
    })

    starCountValue = currentCount + 1
    counterDiv.innerText = `✦ ${starCountValue}`

  } catch (error) {
    console.error("Error updating universe:", error)
  }
}



async function loadUniverseData() {
  try {
    const metaSnap = await getDoc(metaRef)
    const starsSnap = await getDoc(starsRef)

    if (metaSnap.exists()) {
      starCountValue = metaSnap.data().totalCount || 0
      counterDiv.innerText = `✦ ${starCountValue}`
    }

    if (starsSnap.exists()) {
      const starList = starsSnap.data().list || []

      starList.forEach(data => {
        const star = createUserStar()
        star.userData.radius = data.radius
        star.userData.angle = data.angle
        star.userData.state = "orbiting"
        

        star.position.x = Math.cos(data.angle) * data.radius
        star.position.z = Math.sin(data.angle) * data.radius
        star.position.y = 0
        userStars.push(star)
        galaxyGroup.add(star)
      })
    }

  } catch (error) {
    console.error("Error loading universe:", error)
  }
}


// ================= ANIMATION =================

function animate() {

  requestAnimationFrame(animate)

  galaxyGroup.rotation.y += 0.0003

  saturn1.ring.rotation.z += 0.002
  saturn2.ring.rotation.z += 0.001


 userStars.forEach(star => {

  // LANDING PHASE
  if (star.userData.state === "landing") {

    star.userData.landingProgress += 0.02

    const t = star.userData.landingProgress
    const ease = 1 - Math.pow(1 - t, 3)

    // Drop vertically
    star.position.y = 80 * (1 - ease)

    // Slight curve toward target orbit
    const currentRadius = THREE.MathUtils.lerp(
      star.userData.radius * 1.1,
      star.userData.targetRadius,
      ease
    )

    const currentAngle = THREE.MathUtils.lerp(
      star.userData.angle - 0.2,
      star.userData.targetAngle,
      ease
    )

    star.position.x = Math.cos(currentAngle) * currentRadius
    star.position.z = Math.sin(currentAngle) * currentRadius

    if (t >= 1) {
      star.userData.state = "orbiting"
      star.userData.radius = star.userData.targetRadius
      star.userData.angle = star.userData.targetAngle
      star.position.y = 0
    }

  }

  // ORBIT PHASE
  else if (star.userData.state === "orbiting") {

    star.userData.angle += 0.0006

    star.position.x = Math.cos(star.userData.angle) * star.userData.radius
    star.position.z = Math.sin(star.userData.angle) * star.userData.radius
    star.position.y = 0
  }

  // Pulse always active
  const pulse = 1 + Math.sin(Date.now() * 0.003 + star.userData.pulseOffset) * 0.08
  star.scale.set(60 * pulse, 60 * pulse, 1)

})


  renderer.render(scene, camera)
}

loadUniverseData()
animate()

function sparkleBurst(position) {

  const burstCount = 40
  const geometry = new THREE.BufferGeometry()

  const positions = []
  const velocities = []

  for (let i = 0; i < burstCount; i++) {

    positions.push(position.x, position.y, position.z)

    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 2

    velocities.push(
      Math.cos(angle) * speed,
      (Math.random() - 0.5) * 2,
      Math.sin(angle) * speed
    )
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  )

  const material = new THREE.PointsMaterial({
    color: 0xffd700,
    size: 6,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  const burst = new THREE.Points(geometry, material)
  galaxyGroup.add(burst)

  let progress = 0

  function animateBurst() {

    progress += 0.02

    const posArray = geometry.attributes.position.array

    for (let i = 0; i < burstCount; i++) {
      posArray[i * 3] += velocities[i * 3]
      posArray[i * 3 + 1] += velocities[i * 3 + 1]
      posArray[i * 3 + 2] += velocities[i * 3 + 2]
    }

    geometry.attributes.position.needsUpdate = true
    material.opacity = 1 - progress

    if (progress < 1) {
      requestAnimationFrame(animateBurst)
    } else {
      galaxyGroup.remove(burst)
    }
  }

  animateBurst()
}




// ================= RESIZE =================

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
directionalLight.position.set(500, 800, 300)
scene.add(directionalLight)

const galaxyLight = new THREE.PointLight(0xff88ff, 1.5, 2000)
galaxyLight.position.set(0, 0, 0)
scene.add(galaxyLight)


function startFinalSequence(star) {

  messageOverlay.classList.remove("hidden")

  messageText.innerText = messages.first
  messageText.style.opacity = 1

  // Dim background slightly (Act 3)
  galaxyMaterial.opacity = 0.45
  coreSprite.material.opacity = 0.35

  setTimeout(() => {

    messageText.style.opacity = 0

    setTimeout(() => {

      messageOverlay.classList.add("hidden")

      // Restore brightness briefly
      galaxyMaterial.opacity = 0.9
      coreSprite.material.opacity = 0.8

      // Now trigger Act 4
      triggerAct4(star)

    }, 800)

  }, 4000)

}



function triggerAct4(activeStar) {

  let fadeProgress = 0

  function animateFade() {

    fadeProgress += 0.02

    // Fade galaxy elements
    galaxyMaterial.opacity = 0.9 * (1 - fadeProgress)
    coreSprite.material.opacity = 0.8 * (1 - fadeProgress)

    saturn1.planet.material.transparent = true
    saturn2.planet.material.transparent = true
    saturn1.planet.material.opacity = 1 - fadeProgress
    saturn2.planet.material.opacity = 1 - fadeProgress


    

    if (fadeProgress < 1) {
      requestAnimationFrame(animateFade)
    } 

      else {

  finalText.innerText = messages.final
  finalOverlay.classList.remove("hidden")

  finalText.style.opacity = 0
  curiousLink.style.opacity = 0
  contactBtn.classList.remove("show")

  // Fade in main line
  setTimeout(() => {
    finalText.style.opacity = 1
  }, 400)

  // Fade in curious after
  setTimeout(() => {
    curiousLink.style.opacity = 1
  }, 1800)

  }


}

  animateFade()

}


enterUniverse.addEventListener("click", () => {

  // Fade overlay out
  introOverlay.style.opacity = "0"

  setTimeout(() => {
    introOverlay.style.display = "none"

    // Brighten galaxy after intro
    galaxyMaterial.opacity = 0.9
    coreSprite.material.opacity = 0.8

    // Reveal any user stars if hidden
    userStars.forEach(star => {
      star.visible = true
    })

  }, 1200)

})
