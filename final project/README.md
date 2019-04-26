YugeWang

B161006090

This project is about a tunnel with no end. At first I wanted to make a tunnel with material to give people a feeling of moving forward. It is a pity that I didn't succeed in putting a material map on the tunnel.

Before creating the tunnel, I first created the renderer, the scene, and the camera.After creating the scene, I will proceed according to the following process:
 Create a curve to determine the shape of the tunnel
 Generating a curve-based tunnel
 Move forward
 Add interaction

 Thanks to Three.js, I have a nice function to create curves based on a set of points.
 Since the principle of motion was not what I originally thought, I initially thought that the tunnel actually moved in the direction of the camera, and then I thought it was necessary to move the camera into the tunnel. But both of these ideas are wrong.The actual solution is very clever: no object in the scene has actually moved, and only the position of the tunnel map is moved. But I did not succeed in making the effect I wanted.

In the interaction, I added the angle of view with the mouse to move and hold the mouse to make the particle speed faster and change color.
Finally, in order to make this project look less monotonous, I also added background music.
