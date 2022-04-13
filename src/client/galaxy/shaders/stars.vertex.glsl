varying float vAlpha;
varying vec3 vColor;

uniform vec3 uDirection;
uniform float uTime;
uniform float uRandom;
uniform float uInfluence;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  float progress = fract(uTime * 0.5 * uRandom);
  vec3 pos = position + uDirection * progress + uDirection * uInfluence * 0.5;

  vec4 mvPosition = vec4(pos, 1.0);

  mvPosition = instanceMatrix * mvPosition;
  gl_Position = projectionMatrix * modelViewMatrix * mvPosition;

  float alpha = smoothstep(0., .2, progress);
  vAlpha = alpha;

  vColor = mix(uColorA, uColorB, smoothstep(0.2, 0.45, progress)) / 255.;
  vColor = palette(distance(vec3(0), pos) * 2.0 + uTime * 0.15, uColorA, uColorB, uColorC, uColorD);
}
