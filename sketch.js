//Catch & Collect: An Hand-Tracking Mini-Game
//How to play: Move your hand to aim using webcam tracking. 
//Pinch your thumb and index finger together to grab a swimming fish. 
//Drag it into the glowing Drop Zone and release to score points. 
//Be careful: releasing early makes the fish escape!

let video;
let handPose;
let hands = [];

//pic
let fishImages = [];

//game state
let pinchStarted = false;
let message = "Loading camera & fishes...";
let score = 0;

//video
let vScale = 1;
let vOffX = 0;
let vOffY = 0;


let cursorX = 0;
let cursorY = 0;
let smoothCursorSize = 40;
let smoothCursorWeight = 2;
let smoothCursorAlpha = 100;

//Drop Zone
let netX, netY;
let netRadius = 130;
let netPulse = 0;


let fishes = [];
let bubbles = []; 
const numFishes = 10; 

function preload() {
  let options = { maxHands: 1 }; 
  handPose = ml5.handPose(options);
  

  let availableFishes = [1, 2, 3, 4, 5];
  for (let i of availableFishes) {
    fishImages.push(loadImage('pix' + i + '.png')); 
  }
}

class Fish {
  constructor() {
    this.reset();
  }
  reset() {
    this.img = random(fishImages);
    this.x = random(width);
    this.y = random(height); 
    this.targetWidth = random(100, 160); 
    
    
    this.baseSpeedX = random(0.5, 1.2) * (random() > 0.5 ? 1 : -1);
    this.speedX = this.baseSpeedX;
    this.speedY = random(-0.2, 0.2);
    
    this.offset = random(1000); 
    this.isCaught = false;
    this.isEscaping = false; 
  }
  update() {
    if (!this.isCaught) {
      this.x += this.speedX;
      this.y += this.speedY;
      
     
      if (this.x < -100 || this.x > width + 100) this.speedX *= -1;
      if (this.y < -100 || this.y > height + 100) this.speedY *= -1;
      
     
      if (this.isEscaping) {
        this.speedX = lerp(this.speedX, this.baseSpeedX, 0.02);
        if (abs(this.speedX) - abs(this.baseSpeedX) < 0.5) {
          this.isEscaping = false;
        }
      }
    }
  }
  display() {
    push();
    translate(this.x, this.y);
    let direction = this.speedX > 0 ? -1 : 1;
    scale(direction, 1);
    
    //swim
    let wobble = this.isCaught ? random(-0.1, 0.1) : sin(frameCount * 0.05 + this.offset) * 0.08;
    if (this.isEscaping) wobble = sin(frameCount * 0.3) * 0.15;
    rotate(wobble);
    
    imageMode(CENTER);
    let imgRatio = this.img.height / this.img.width;
    let targetHeight = this.targetWidth * imgRatio;
    
    //✨
    if (this.isCaught) {
      drawingContext.shadowBlur = 30;
      drawingContext.shadowColor = 'rgba(255, 255, 255, 0.9)'; 
    } else if (this.isEscaping) {
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = 'rgba(255, 50, 50, 0.7)';
    }
    
    image(this.img, 0, 0, this.targetWidth, targetHeight); 
    pop();
  }
  checkHit(px, py) {
    return dist(px, py, this.x, this.y) < this.targetWidth / 2;
  }
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(3, 10);
    this.speed = random(0.5, 2);
    this.offset = random(100);
  }
  update() {
    this.y -= this.speed;
    this.x += sin(frameCount * 0.05 + this.offset) * 0.5; 
    if (this.y < -10) {
      this.y = height + 10;
      this.x = random(width);
    }
  }
  display() {
    noStroke();
    fill(255, 255, 255, 60);
    ellipse(this.x, this.y, this.size);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();
  
  handPose.detectStart(video, gotHands);
  
  for (let i = 0; i < numFishes; i++) fishes.push(new Fish());
  for (let i = 0; i < 30; i++) bubbles.push(new Bubble());
}

function calculateVideoLayout() {
  let vw = video.width || 640;
  let vh = video.height || 480;
  vScale = Math.max(width / vw, height / vh); 
  let scaledW = vw * vScale;
  let scaledH = vh * vScale;
  vOffX = (width - scaledW) / 2;
  vOffY = (height - scaledH) / 2;
 
  netX = width - 150;
  netY = height - 150;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  calculateVideoLayout();

  //background color
  let gradient = drawingContext.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, color(10, 40, 70).toString()); 
  gradient.addColorStop(1, color(0, 10, 20).toString());  
  drawingContext.fillStyle = gradient;
  rect(0, 0, width, height);
  
  
  push(); 
  translate(width, 0); 
  scale(-1, 1); 
  tint(255, 40); 
  image(video, vOffX, vOffY, (video.width || 640) * vScale, (video.height || 480) * vScale);
  pop(); 
  noTint();
  
  for (let b of bubbles) {
    b.update();
    b.display();
  }
  
  //Drop Zone
  drawDropZone();
  
  let isHovering = checkInteraction();

  for (let fish of fishes) {
    fish.update();
    fish.display();
  }
  
  if (hands.length > 0) {
    drawElegantCursor(cursorX, cursorY, pinchStarted, isHovering);
  }
  
  drawUI();
}

function gotHands(results) {
  hands = results;
}

function checkInteraction() {
  let isHoveringAnyFish = false;

  if (hands.length === 0) {
    pinchStarted = false;
    for (let fish of fishes) fish.isCaught = false; 
    message = "Show your hand to play...";
    return false;
  }
  
  message = "Hand Tracking Active";

  let keypoints = hands[0].keypoints;
  let thumb = keypoints[4];
  let indexFinger = keypoints[8];

  let rawX = (thumb.x + indexFinger.x) / 2;
  let rawY = (thumb.y + indexFinger.y) / 2;
  let mappedX = vOffX + (rawX * vScale);
  let mappedY = vOffY + (rawY * vScale);
  
  cursorX = lerp(cursorX, width - mappedX, 0.4); 
  cursorY = lerp(cursorY, mappedY, 0.4);

  let rawPinchDist = dist(thumb.x, thumb.y, indexFinger.x, indexFinger.y);
  let rawHandSize = dist(keypoints[0].x, keypoints[0].y, keypoints[9].x, keypoints[9].y);
  
  let pinchDist = rawPinchDist * vScale;
  let pinchThreshold = map(rawHandSize * vScale, 50 * vScale, 200 * vScale, 15 * vScale, 60 * vScale);

  for (let fish of fishes) {
    if (!fish.isCaught && fish.checkHit(cursorX, cursorY)) {
      isHoveringAnyFish = true;
      break;
    }
  }

  //pinch
  if (pinchDist < pinchThreshold) {
    if (!pinchStarted) {
      pinchStarted = true; 
      for (let fish of fishes) {
        if (!fish.isCaught && fish.checkHit(cursorX, cursorY)) {
          fish.isCaught = true; 
        }
      }
    }
    
    for (let fish of fishes) {
      if (fish.isCaught) {
        fish.x = lerp(fish.x, cursorX, 0.2);
        fish.y = lerp(fish.y, cursorY, 0.2);
      }
    }
  } else {
    //loose
    if (pinchStarted) {
      pinchStarted = false; 
      let reeledCount = 0;
      
      for (let fish of fishes) {
        if (fish.isCaught) {
        
          let distToNet = dist(fish.x, fish.y, netX, netY);
          
          if (distToNet < netRadius) {
            
            score++;
            reeledCount++;
            netPulse = 30; 
            fish.reset(); 
          } else {
          
            fish.isCaught = false;
            fish.isEscaping = true;
          
            fish.speedX = (fish.speedX > 0 ? 1 : -1) * 8; 
            message = "Oops! The fish escaped!";
          }
        }
      }
      
      if (reeledCount > 0) {
        message = `✨ Awesome! +${reeledCount} ✨`;
      }
    }
  }
  
  return isHoveringAnyFish;
}

//Drop Zone
function drawDropZone() {
  push();
  translate(netX, netY);
  
  
  if (netPulse > 0) netPulse -= 1;
  
  let pulseRadius = netRadius + netPulse * 2;
  
  drawingContext.shadowBlur = 30 + netPulse * 2;
  drawingContext.shadowColor = 'rgba(0, 255, 204, 0.6)';
  
  //bottom
  noStroke();
  fill(0, 255, 204, 20 + netPulse * 3);
  ellipse(0, 0, pulseRadius * 2, pulseRadius * 2);
  
  
  stroke(0, 255, 204, 150 + netPulse * 3);
  strokeWeight(3 + netPulse * 0.2);
  noFill();
  
  drawingContext.setLineDash([15, 15]);
  ellipse(0, 0, netRadius * 2, netRadius * 2);
  drawingContext.setLineDash([]);
  
  //centre text
  fill(0, 255, 204, 180);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(20 + netPulse * 0.5);
  textStyle(BOLD);
  text("DROP\nHERE", 0, 0);
  
  pop();
}

function drawElegantCursor(x, y, isPinching, isHovering) {
  let targetSize = 40;
  let targetWeight = 2;
  let targetAlpha = 80;

  if (isPinching) {
    targetSize = 18;
    targetWeight = 18;
    targetAlpha = 255;
  } else if (isHovering) {
    targetSize = 65;
    targetWeight = 4;
    targetAlpha = 180;
  }

  smoothCursorSize = lerp(smoothCursorSize, targetSize, 0.2);
  smoothCursorWeight = lerp(smoothCursorWeight, targetWeight, 0.2);
  smoothCursorAlpha = lerp(smoothCursorAlpha, targetAlpha, 0.2);

  push();
  translate(x, y);
  
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(255, 255, 255, 0.4)';

  stroke(255, smoothCursorAlpha);
  strokeWeight(smoothCursorWeight);
  
  if (isPinching) {
    fill(255);
  } else {
    fill(255, smoothCursorAlpha * 0.15);
  }

  ellipse(0, 0, smoothCursorSize, smoothCursorSize);
  
  if (!isPinching) {
    noStroke();
    fill(255, smoothCursorAlpha + 50);
    ellipse(0, 0, 4, 4);
  }
  
  pop();
}

function drawUI() {
  
  push();
  fill(255, 255, 255, 15);
  stroke(255, 40);
  strokeWeight(1);
  rect(20, 20, width - 40, 60, 15); 

  fill(255, 220);
  textSize(16);
  textFont('Helvetica'); 
  textAlign(LEFT, CENTER);
  text(message, 40, 50);
  
  textAlign(RIGHT, CENTER);
  textStyle(BOLD);
  textSize(24);
  fill(0, 255, 204);
  text(`SCORE: ${score}`, width - 40, 50);
  pop();
  
  
  push();
 
  let panelWidth = min(460, width - 40); 
  let panelHeight = 75; 
  translate(width / 2 - panelWidth / 2, height - panelHeight - 15);
  
  
  fill(0, 0, 0, 160);
  stroke(255, 50);
  strokeWeight(1);
  rect(0, 0, panelWidth, panelHeight, 15); // 圆角稍微收一点
  
  //title
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(14); 
  textStyle(BOLD);
  text("🕹️ HOW TO PLAY", panelWidth / 2, 18);
  
  
  textSize(13);
  let l1_1 = "Pinch your ";
  let l1_2 = "THUMB & INDEX FINGER";
  let l1_3 = " to grab a fish,";
  
  
  let tw1 = textWidth(l1_1);
  let tw2 = textWidth(l1_2);
  let tw3 = textWidth(l1_3);
  let startX = panelWidth / 2 - (tw1 + tw2 + tw3) / 2;
  
  textAlign(LEFT, CENTER);
  
  fill(255, 200);
  textStyle(NORMAL);
  text(l1_1, startX, 38);
  
  fill('#FFCC00');
  textStyle(BOLD);
  text(l1_2, startX + tw1, 38);
  
  fill(255, 200);
  textStyle(NORMAL);
  text(l1_3, startX + tw1 + tw2, 38);
  textAlign(CENTER, CENTER);
  
  text("then drop it into the glowing zone!", panelWidth / 2, 58); 
  
  pop();
}