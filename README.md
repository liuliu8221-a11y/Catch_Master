# Catch Master

## Introduction：
* Dive into an immersive, hands-on digital aquarium! Catch Master is an interactive mini-game that lets you reach into the screen and catch swimming fishes using just your webcam—no mouse or keyboard required. We aim to create a frictionless, magical experience where your bare hands become the ultimate controller. *
## Philosophy
* The inspiration for this project stems from a previous virtual pet fish interaction I created. Back then, the interaction was entirely reliant on traditional mouse clicks, which felt somewhat detached and rigid. After learning about hand-tracking and gesture controls in our recent classes, I realised I could bridge the gap between the physical and digital worlds. I wanted players to experience the sensation of actually "reaching" into a digital fish tank. Furthermore, to make this ecosystem truly my own, I discarded the standard text emojis used in my previous project and replaced them with custom-drawn pixel art fishes, giving the aquarium a unique, handcrafted charm and a more authentic retro aesthetic. *

## Technical Implementation
* The visual interface, canvas rendering, and core game logic were developed using p5.js. *
* For the core interaction, ml5.js (HandPose) was integrated to achieve real-time skeletal tracking via the webcam, translating physical hand movements into precise digital coordinates without the need for external sensors. *
* HandPose *
* The UI design embraces a minimalist, modern "glassmorphism" style. Smooth mathematical interpolations (using lerp) were applied to the cursor's movement, ensuring the targeting system feels fluid and organic rather than erratic. *
* Custom physics algorithms were implemented to handle the fishes' wandering patterns, struggle animations when clamped, and an escape mechanism (speed boost and red glow) if a fish is dropped outside the designated zone. *
* All visual assets (the pixel fishes) are dynamically loaded and rendered with aspect-ratio protection to prevent any stretching or distortion of the original hand-drawn art. *
## Usage Guide
* Start: Upon entering the webpage, allow camera access. Move your hand in front of the webcam to control the smart targeting reticle. *
* Catch: Hover over a fish and pinch your Thumb and Index Finger together to grab it. *
* Score: Hold the pinch and drag your catch across the screen into the glowing "Drop Zone" at the bottom right. *
* Careful: Release your fingers inside the zone to collect the fish and score points. If you let go too early or miss the zone, the fish will panic and speed away! *


## Related Links
* GitHub: https://github.com/liuliu8221-a11y/Catch_Master.git *


Reference

Drawing inspiration from the immersive underwater experience in this work, we have used the ocean as the overall backdrop, allowing participants to interact from a ‘pseudo-first-person perspective’, mimicking the sensation of being in the ocean and interacting with marine life.
https://www.teamlab.art/w/wayofthesea-flying 


We utilised the handpose model from Ml5js and built the entire interaction system based on the hand tracking provided by this model.
HandPose



 We drew inspiration from the pixel-art marine life in Dave the Diver, hoping to make the experience more light-hearted and enjoyable, and to ensure that, compared to realistic fish, the creatures feel more like ‘game’ characters rather than actual marine life.
https://www.playstation.com/en-vn/games/dave-the-diver 

We used the official blend modes as a reference for colour blending and, based on this, created a feedback effect that makes the fish’s body glow when it is caught.
https://p5js.org/reference/p5/blendMode 


processing step






