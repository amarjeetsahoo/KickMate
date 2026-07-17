import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface Waypoint3D {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  z: number;
}

export class Stadium3DController {
  private canvas: HTMLCanvasElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId?: number;

  private waypoints: Waypoint3D[] = [];
  private pinObjects: THREE.Group[] = [];
  private routeLine?: THREE.Line;
  private onPinClick?: (id: string) => void;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Camera animation interpolation targets
  private targetLookAt = new THREE.Vector3(0, 0, 0);
  private currentLookAt = new THREE.Vector3(0, 0, 0);
  private targetCameraPos = new THREE.Vector3(0, 20, 35);

  constructor(canvas: HTMLCanvasElement, onPinClick?: (id: string) => void) {
    this.canvas = canvas;
    this.onPinClick = onPinClick;
    this.init();
    this.setupStadium();
    this.animate();
  }

  private init() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // dark slate

    // Fog for depth feeling
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.copy(this.targetCameraPos);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height, false);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // don't go below ground
    this.controls.minDistance = 5;
    this.controls.maxDistance = 150;
    this.controls.enableZoom = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    this.scene.add(dirLight);

    const accentLight = new THREE.PointLight(0x10b981, 1.5, 100); // glowing green light
    accentLight.position.set(0, 5, 0);
    this.scene.add(accentLight);

    // Event listeners
    this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private setupStadium() {
    // 1. Field (Pitch)
    const pitchWidth = 24;
    const pitchLength = 16;
    const fieldGeo = new THREE.PlaneGeometry(pitchWidth, pitchLength);
    const fieldMat = new THREE.MeshStandardMaterial({
      color: 0x059669, // nice FIFA green
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const field = new THREE.Mesh(fieldGeo, fieldMat);
    field.rotation.x = -Math.PI / 2;
    field.position.y = -0.05;
    this.scene.add(field);

    // 2. Field Borders (White lines)
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const outlineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-pitchWidth/2, 0, -pitchLength/2),
      new THREE.Vector3(pitchWidth/2, 0, -pitchLength/2),
      new THREE.Vector3(pitchWidth/2, 0, pitchLength/2),
      new THREE.Vector3(-pitchWidth/2, 0, pitchLength/2),
      new THREE.Vector3(-pitchWidth/2, 0, -pitchLength/2),
    ]);
    const outlines = new THREE.Line(outlineGeo, lineMat);
    this.scene.add(outlines);

    // Center circle
    const circleGeo = new THREE.RingGeometry(3.5, 3.6, 32);
    const circleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const centerCircle = new THREE.Mesh(circleGeo, circleMat);
    centerCircle.rotation.x = -Math.PI / 2;
    this.scene.add(centerCircle);

    // 3. Seating Stands (Stacked hollow tiers)
    // Tier 1 (100 Level) - low-slung, dark slate
    this.createSeatingTier(15, 20, 0, 1.8, 0x1e293b);
    
    // Tier 2 (200 Level) - mid tier, slightly elevated
    this.createSeatingTier(22, 27, 2, 2.5, 0x334155);

    // Tier 3 (300 Level) - upper tier, high & steep
    this.createSeatingTier(29, 35, 5.5, 3.5, 0x475569);
  }

  private createSeatingTier(innerRad: number, outerRad: number, height: number, depth: number, color: number) {
    // Generate circular stands shape by extruding an open ring
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRad, 0, Math.PI * 2, false);
    
    const hole = new THREE.Path();
    hole.absarc(0, 0, innerRad, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const extrudeSettings = {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.1,
      bevelThickness: 0.1
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.6,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = height;
    this.scene.add(mesh);
  }

  // Map 2D SVG coordinates into our 3D stadium bounds
  private mapCoords(x: number, y: number, z: number): THREE.Vector3 {
    // Coordinates inside database: x: 0-560 (center ~280), y: 0-400 (center ~200)
    const scale = 0.08;
    const threeX = (x - 280) * scale;
    const threeZ = (y - 200) * scale;
    const threeY = z * 0.4; // 10 floor height => 4.0 units high in WebGL
    return new THREE.Vector3(threeX, threeY, threeZ);
  }

  /** Set new waypoints and redraw 3D pins */
  public setWaypoints(waypoints: Waypoint3D[]) {
    this.waypoints = waypoints;

    // Clear old pins
    this.pinObjects.forEach(p => this.scene.remove(p));
    this.pinObjects = [];

    // Draw new pins
    this.waypoints.forEach(w => {
      const pos = this.mapCoords(w.x, w.y, w.z);

      const group = new THREE.Group();
      group.position.copy(pos);
      group.userData = { id: w.id, label: w.label, type: w.type };

      // Pin Head (Colored Sphere)
      let color = 0x10b981; // green default
      if (w.type === 'gate') color = 0x3b82f6; // blue
      else if (w.type === 'section') color = 0xeab308; // gold
      else if (w.type === 'food') color = 0xf97316; // orange
      else if (w.type === 'toilet') color = 0x06b6d4; // cyan
      else if (w.type === 'medical') color = 0xef4444; // red
      else if (w.type === 'exit') color = 0x10b981; // green

      const pinGeo = new THREE.SphereGeometry(0.8, 16, 16);
      const pinMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.8,
        emissive: color,
        emissiveIntensity: 0.3
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.name = 'pin-head';
      group.add(pinMesh);

      // Simple Pin stalk
      const stalkGeo = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
      const stalkMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
      const stalk = new THREE.Mesh(stalkGeo, stalkMat);
      stalk.position.y = -0.6;
      group.add(stalk);

      this.scene.add(group);
      this.pinObjects.push(group);
    });
  }

  /** Render a line between pins */
  public drawRoute(steps: Waypoint3D[]) {
    if (this.routeLine) {
      this.scene.remove(this.routeLine);
      this.routeLine = undefined;
    }

    if (steps.length < 2) return;

    // Build curve coordinates
    const points = steps.map(s => this.mapCoords(s.x, s.y, s.z));
    
    // Elevate path slightly so it does not merge into the steps/stands
    points.forEach((p, idx) => {
      if (idx > 0 && idx < points.length - 1) {
        // Curve upward slightly in between waypoints for bridge effect
        p.y += 0.2;
      }
    });

    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.2);
    const curvePoints = curve.getPoints(50);

    const geo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    
    // Modern Dashed material
    const mat = new THREE.LineDashedMaterial({
      color: 0x10b981, // Glowing green route
      linewidth: 4,
      dashSize: 1.2,
      gapSize: 0.8
    });

    this.routeLine = new THREE.Line(geo, mat);
    this.routeLine.computeLineDistances(); // Required for dashes
    this.scene.add(this.routeLine);
  }

  /** Smoothly focus the camera on a specific waypoint */
  public focusOn(x: number, y: number, z: number) {
    const pos = this.mapCoords(x, y, z);
    
    // Target look-at target
    this.targetLookAt.copy(pos);

    // Target camera position: keep offset but align around target
    this.targetCameraPos.set(pos.x, pos.y + 12, pos.z + 18);
  }

  private onPointerDown(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Raycast against pin-heads
    const pinHeads = this.pinObjects.map(g => g.getObjectByName('pin-head')).filter(Boolean) as THREE.Object3D[];
    const intersects = this.raycaster.intersectObjects(pinHeads);

    if (intersects.length > 0) {
      const pinHead = intersects[0].object;
      const group = pinHead.parent;
      if (group && this.onPinClick) {
        this.onPinClick(group.userData.id);
      }
    }
  }

  private onWindowResize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    // 1. Hover/Pulse animation for pins
    const time = Date.now() * 0.003;
    this.pinObjects.forEach(group => {
      const head = group.getObjectByName('pin-head');
      if (head) {
        // Soft hover wave
        head.position.y = Math.sin(time + group.position.x) * 0.25;
      }
    });

    // 2. Animate route dashes flowing
    if (this.routeLine) {
      const routeMat = this.routeLine.material as any;
      routeMat.dashOffset = -time * 1.5;
    }

    // 3. Smooth Camera LERP towards focus points
    this.currentLookAt.lerp(this.targetLookAt, 0.08);
    this.controls.target.copy(this.currentLookAt);

    this.camera.position.lerp(this.targetCameraPos, 0.08);

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /** Release resources */
  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.dispose();
  }
}
