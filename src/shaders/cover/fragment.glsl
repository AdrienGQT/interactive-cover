uniform float uDisplacementScale;
uniform float uTransitionProgression;

varying vec3 vPosition;

#include ../includes/simplexNoise4d.glsl

void main() {
    // Base color
    vec3 endColor = csm_DiffuseColor.rgb;

    // Black color
    vec3 startColor = vec3(0.001, 0.001, 0.005);

    // Noise color
    float noiseFactor = simplexNoise4d(vec4(
        vPosition * 1.0,
        uTransitionProgression * 0.4));

    noiseFactor = noiseFactor * 0.5 + 0.5;

    float edgeWidth = 0.01;
    noiseFactor = smoothstep(noiseFactor - edgeWidth, noiseFactor + edgeWidth, uTransitionProgression);

    float edgeDetection = 1.0 - abs(noiseFactor - 0.5) * 2.0;
    edgeDetection = pow(edgeDetection, 3.5); 
    
    // Base to black transition
    vec3 colorMix = mix(startColor, endColor, noiseFactor);

     colorMix += vec3(1.0, 0.82, 0.46) * edgeDetection * 4.0;

    csm_DiffuseColor = vec4(colorMix, 1.0);

}