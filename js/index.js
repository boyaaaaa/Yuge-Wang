// Get window dimension
var ww = window.innerWidth;
var wh = window.innerHeight;
var isMobile = ww < 500;

// create an AudioListener and add it to the camera
var listener = new THREE.AudioListener();

// create a global audio source
var sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
var audioLoader = new THREE.AudioLoader();

// Constructor function
function Tunnel() {
  this.init();
  // Create the shape of the tunnel
  this.createMesh();
  // Mouse events & window resize
  this.handleEvents();
  // Start loop animation
  window.requestAnimationFrame(this.render.bind(this));
}

Tunnel.prototype.init = function() {

  // Define the speed of the tunnel
  this.speed = 1;
  this.prevTime = 0;

  // Store the position of the mouse
  // Default is center of the screen
  this.mouse = {
    position: new THREE.Vector2(ww * 0.5, wh * 0.7),
    ratio: new THREE.Vector2(0, 0),
    target: new THREE.Vector2(ww * 0.5, wh * 0.7)
  };

  // Create a WebGL renderer
  this.renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector("#scene")
  });
  // Set size of the renderer and its background color
  this.renderer.setSize(ww, wh);

// Create a camera and move it along Z axis
  this.camera = new THREE.PerspectiveCamera(15, ww / wh, 0.01, 100);
  this.camera.rotation.y = Math.PI;
  this.camera.position.z = 0.35;

  // Create an empty scene and define a fog for it
  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.Fog(0x000d25,0.05,1.6);

// Add lights in the scene
  var light = new THREE.HemisphereLight( 0xe9eff2, 0x01010f, 1 );
  this.scene.add( light );

  this.addParticle();
};

  // Start loop animation
Tunnel.prototype.addParticle = function() {
  this.particles = [];
  for(var i = 0; i < (isMobile?70:150); i++){
    this.particles.push(new Particle(this.scene));
  }
};

Tunnel.prototype.createMesh = function() {
  // Empty array to store the points along the path
  var points = [];

  // Define points along Z axis to create a curve
  var i = 0;
  var geometry = new THREE.Geometry();

  this.scene.remove(this.tubeMesh)

  for (i = 0; i < 5; i += 1) {
    points.push(new THREE.Vector3(0, 0, 2.5 * (i / 4)));
  }
  // Set custom Y position for the last point
  points[4].y = -0.06;

  // Create a curve based on the points
  this.curve = new THREE.CatmullRomCurve3(points);
  this.curve.type = "catmullrom";
// Empty geometry
  geometry = new THREE.Geometry();
  // Create vertices based on the curve
  geometry.vertices = this.curve.getPoints(70);
  // Create a line from the points with a basic line material
  this.splineMesh = new THREE.Line(geometry, new THREE.LineBasicMaterial());
  // Repeat the pattern
  this.tubeMaterial = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    color:0xffffff
  });

  // Create a tube geometry based on the curve
  this.tubeGeometry = new THREE.TubeGeometry(this.curve, 70, 0.02, 30, false);

  // Clone the original tube geometry
  // Because we will modify the visible one but we need to keep track of the original position of the vertices
  this.tubeGeometry_o = this.tubeGeometry.clone();
  this.tubeMesh = new THREE.Mesh(this.tubeGeometry, this.tubeMaterial);

  // Push the tube into the scene
  this.scene.add(this.tubeMesh);

};

Tunnel.prototype.handleEvents = function() {
  // When user resize window
  window.addEventListener('resize', this.onResize.bind(this), false);
  // When user move the mouse
  document.body.addEventListener('mousemove', this.onMouseMove.bind(this), false);
  document.body.addEventListener('touchmove', this.onMouseMove.bind(this), false);

  document.body.addEventListener('touchstart', this.onMouseDown.bind(this), false);
  document.body.addEventListener('mousedown', this.onMouseDown.bind(this), false);

  document.body.addEventListener('mouseup', this.onMouseUp.bind(this), false);
  document.body.addEventListener('mouseleave', this.onMouseUp.bind(this), false);
  document.body.addEventListener('touchend', this.onMouseUp.bind(this), false);
  window.addEventListener('mouseout', this.onMouseUp.bind(this), false);
};

Tunnel.prototype.onMouseDown = function() {
  this.mousedown = true;

};
Tunnel.prototype.onMouseUp = function() {
  this.mousedown = false;

};

Tunnel.prototype.onResize = function() {

  // On resize, get new width & height of window
  ww = window.innerWidth;
  wh = window.innerHeight;

  isMobile = ww < 500;

  // Update camera aspect
  this.camera.aspect = ww / wh;
  // Reset aspect of the camera
  this.camera.updateProjectionMatrix();
  // Update size of the canvas
  this.renderer.setSize(ww, wh);
};

Tunnel.prototype.onMouseMove = function(e) {
  if (e.type === "mousemove"){
    
    // Save mouse X & Y position
    this.mouse.target.x = e.clientX;
    this.mouse.target.y = e.clientY;
  } else {
    // Update the mouse position with some lerp
    this.mouse.target.x = e.touches[0].clientX;
    this.mouse.target.y = e.touches[0].clientY;
  }
};

Tunnel.prototype.updateCameraPosition = function() {

  // Move a bit the camera horizontally & vertically
  this.mouse.position.x += (this.mouse.target.x - this.mouse.position.x) / 30;
  this.mouse.position.y += (this.mouse.target.y - this.mouse.position.y) / 30;

  // Rotate Z & Y axis
  this.mouse.ratio.x = (this.mouse.position.x / ww);
  this.mouse.ratio.y = (this.mouse.position.y / wh);

  this.camera.rotation.z = ((this.mouse.ratio.x) * 1 - 0.05);
  this.camera.rotation.y = Math.PI - (this.mouse.ratio.x * 0.3 - 0.15);
  this.camera.position.x = ((this.mouse.ratio.x) * 0.044 - 0.025);
  this.camera.position.y = ((this.mouse.ratio.y) * 0.044 - 0.025);

};

Tunnel.prototype.updateCurve = function() {
  var i = 0;
  var index = 0;
  var vertice_o = null;
  var vertice = null;
  // For each vertice of the tube, move it a bit based on the spline
  for (i = 0; i < this.tubeGeometry.vertices.length; i += 1) {
    // Get the original tube vertice
    vertice_o = this.tubeGeometry_o.vertices[i];
    // Get the visible tube vertice
    vertice = this.tubeGeometry.vertices[i];
    // Calculate index of the vertice based on the Z axis
    // The tube is made of 50 rings of vertices
    index = Math.floor(i / 30);
    // Update tube vertice
    vertice.x += ((vertice_o.x + this.splineMesh.geometry.vertices[index].x) - vertice.x) / 15;
    vertice.y += ((vertice_o.y + this.splineMesh.geometry.vertices[index].y) - vertice.y) / 15;
  }
  // Warn ThreeJs that the points have changed
  this.tubeGeometry.verticesNeedUpdate = true;

  // Update the points along the curve base on mouse position
  this.curve.points[2].x = 0.6 * (1 - this.mouse.ratio.x) - 0.3;
  this.curve.points[3].x = 0;
  this.curve.points[4].x = 0.6 * (1 - this.mouse.ratio.x) - 0.3;

  this.curve.points[2].y = 0.6 * (1 - this.mouse.ratio.y) - 0.3;
  this.curve.points[3].y = 0;
  this.curve.points[4].y = 0.6 * (1 - this.mouse.ratio.y) - 0.3;

  // Warn ThreeJs that the spline has changed
  this.splineMesh.geometry.verticesNeedUpdate = true;
  this.splineMesh.geometry.vertices = this.curve.getPoints(70);
};

Tunnel.prototype.render = function(time) {

  // Update camera position & rotation
  this.updateCameraPosition();

  // Update the tunnel
  this.updateCurve();

  for(var i = 0; i < this.particles.length; i++){
    this.particles[i].update(this);
    if(this.particles[i].burst && this.particles[i].percent > 1){
      this.particles.splice(i, 1);
      i--;
    }
  }

  // When mouse down, add a lot of shapes
  if (this.mousedown){
    if(time - this.prevTime > 20){
      this.prevTime = time;
      this.particles.push(new Particle(this.scene, true, time));
      if(!isMobile){
        this.particles.push(new Particle(this.scene, true, time));
        this.particles.push(new Particle(this.scene, true, time));
      }
    }
  }

  // render the scene
  this.renderer.render(this.scene, this.camera);

  // Animation loop
  window.requestAnimationFrame(this.render.bind(this));
};
//creat particles
function Particle(scene, burst, time) {
  var radius = Math.random()*0.002 + 0.0003;
  var geom = this.icosahedron;
  var random = Math.random();
  if(random > 0.9){
    geom = this.cube;
  } else if(random > 0.8){
    geom = this.sphere;
  }

  var range = 80;
  //Create a particle color effect
  if(burst){
    this.color = new THREE.Color("hsl("+(time / 50)+",100%,60%)");
  } else {
    var offset = 180;
    this.color = new THREE.Color("hsl("+(Math.random()*range+offset)+",100%,80%)");
  }
  var mat = new THREE.MeshPhongMaterial({
    color: this.color,
    shading:THREE.FlatShading
  });

  //Add moving geometry and add speed
  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.scale.set(radius, radius, radius);
  this.mesh.position.set(0,0,1.5);
  this.percent = burst ? 0.2 : Math.random();
  this.burst = burst ? true : false;
  this.offset = new THREE.Vector3((Math.random()-0.5)*0.025, (Math.random()-0.5)*0.025, 0);
  this.speed = Math.random()*0.004 + 0.0002;
  if (this.burst){
    this.speed += 0.003;
    this.mesh.scale.x *= 1.4;
    this.mesh.scale.y *= 1.4;
    this.mesh.scale.z *= 1.4;
  }
  this.rotate = new THREE.Vector3(-Math.random()*0.1+0.01,0,Math.random()*0.01);

  this.pos = new THREE.Vector3(0,0,0);
  scene.add(this.mesh);
}

//Create particle velocity variations
Particle.prototype.cube = new THREE.BoxBufferGeometry(1, 1, 1);
Particle.prototype.sphere = new THREE.SphereBufferGeometry(1, 6, 6 );
Particle.prototype.icosahedron = new THREE.IcosahedronBufferGeometry(1,0);
Particle.prototype.update = function (tunnel) {

  this.percent += this.speed * (this.burst?1:tunnel.speed);

  this.pos = tunnel.curve.getPoint(1 - (this.percent%1)) .add(this.offset);
  this.mesh.position.x = this.pos.x;
  this.mesh.position.y = this.pos.y;
  this.mesh.position.z = this.pos.z;
  this.mesh.rotation.x += this.rotate.x;
  this.mesh.rotation.y += this.rotate.y;
  this.mesh.rotation.z += this.rotate.z;
};

window.onload = function() {

  // When all textures are loaded, init the scene
  window.tunnel = new Tunnel();

//Add background music
  audioLoader.load( 'audio/123.wav', function( buffer ) {
      sound.setBuffer( buffer );
      sound.setLoop( false );
      sound.setVolume( 0.5 );
      sound.play();
  });
};
