varying float vAlpha;
varying vec3 vColor;

void main() {
  vec3 color = vColor;

  gl_FragColor = vec4(color, 1.0) * vAlpha;
}
