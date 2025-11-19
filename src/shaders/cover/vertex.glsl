uniform float uDisplacementScale;
uniform sampler2D uDisplacementMap;
uniform float uTransitionProgression;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
    // Displacement
    float displacement = texture2D(uDisplacementMap, uv).r * uTransitionProgression;

    // Apply displacement
    vec3 displacedPosition = csm_Position;
    displacedPosition.z += displacement * uDisplacementScale;

    csm_Position = displacedPosition;

    vPosition = csm_Position;
}