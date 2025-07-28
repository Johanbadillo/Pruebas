var canvas = document.getElementById("canvas");
      var loveText = document.getElementById("loveText");
      
      function resizeCanvas() {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform1f(widthHandle, canvas.width);
        gl.uniform1f(heightHandle, canvas.height);
      }

      var gl = canvas.getContext("webgl");
      if (!gl) {
        console.error("Unable to initialize WebGL.");
      }

      var time = 0.0;
      var vertexSource = `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;
      var fragmentSource = `
        precision highp float;
        uniform float width;
        uniform float height;
        vec2 resolution = vec2(width, height);
        uniform float time;
        #define POINT_COUNT 8
        vec2 points[POINT_COUNT];
        const float speed = -0.35;
        const float len = 0.25;
        float intensity = 2.0;
        float radius = 0.018;
        float sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C) {
          vec2 a = B - A;
          vec2 b = A - 2.0*B + C;
          vec2 c = a * 2.0;
          vec2 d = A - pos;
          float kk = 1.0 / dot(b,b);
          float kx = kk * dot(a,b);
          float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
          float kz = kk * dot(d,a);
          float res = 0.0;
          float p = ky - kx*kx;
          float p3 = p*p*p;
          float q = kx*(2.0*kx*kx - 3.0*ky) + kz;
          float h = q*q + 4.0*p3;
          if(h >= 0.0) {
            h = sqrt(h);
            vec2 x = (vec2(h, -h) - q) / 2.0;
            vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
            float t = uv.x + uv.y - kx;
            t = clamp(t, 0.0, 1.0);
            vec2 qos = d + (c + b*t)*t;
            res = length(qos);
          } else {
            float z = sqrt(-p);
            float v = acos(q/(p*z*2.0)) / 3.0;
            float m = cos(v);
            float n = sin(v)*1.732050808;
            vec3 t = vec3(m + m, -n - m, n - m) * z - kx;
            t = clamp(t, 0.0, 1.0);
            vec2 qos = d + (c + b*t.x)*t.x;
            float dis = dot(qos,qos);
            res = dis;
            qos = d + (c + b*t.y)*t.y;
            dis = dot(qos,qos);
            res = min(res,dis);
            qos = d + (c + b*t.z)*t.z;
            dis = dot(qos,qos);
            res = min(res,dis);
            res = sqrt(res);
          }
          return res;
        }
        vec2 getHeartPosition(float t) {
          return vec2(16.0 * sin(t) * sin(t) * sin(t),
                      -(13.0 * cos(t) - 5.0 * cos(2.0*t)
                      - 2.0 * cos(3.0*t) - cos(4.0*t)));
        }
        float getGlow(float dist, float radius, float intensity) {
          return pow(radius/dist, intensity);
        }
        float getSegment(float t, vec2 pos, float offset, float scale, float orbit) {
          for(int i = 0; i < POINT_COUNT; i++) {
            points[i] = getHeartPosition(offset + float(i)*len + fract(speed * t) * 6.28);
            points[i] += vec2(cos(t * 0.5 + offset) * orbit, sin(t * 0.5 + offset) * orbit) * 0.015;
          }
          vec2 c = (points[0] + points[1]) / 2.0;
          vec2 c_prev;
          float dist = 10000.0;
          for(int i = 0; i < POINT_COUNT-1; i++) {
            c_prev = c;
            c = (points[i] + points[i+1]) / 2.0;
            dist = min(dist, sdBezier(pos, scale * c_prev, scale * points[i], scale * c));
          }
          return max(0.0, dist);
        }
        float getStarfield(vec2 uv) {
          float n = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
          return step(0.998, n) * (0.5 + 0.5 * sin(time * 6.0));
        }
        float getSparkle(vec2 pos, vec2 center, float radius) {
          float dist = length(pos - center);
          float n = fract(sin(dot(pos, vec2(78.233, 12.9898)) + time) * 43758.5453);
          return step(0.99, n) * (0.6 + 0.4 * sin(time * 8.0)) * smoothstep(radius, 0.0, dist);
        }
        void main() {
          vec2 uv = gl_FragCoord.xy/resolution.xy;
          float widthHeightRatio = resolution.x/resolution.y;
          vec2 centre = vec2(0.5, 0.5);
          vec2 pos = centre - uv;
          pos.y /= widthHeightRatio;
          pos.y += 0.02;
          float scale = 0.000015 * height;
          float t = time;
          vec3 col = vec3(0.0);
          col += getStarfield(uv) * vec3(0.9, 0.9, 1.0) * 0.04;
          float sparkle = getSparkle(pos, vec2(0.0, 0.02), 0.12);
          col += sparkle * vec3(1.0, 0.7, 0.8) * (0.7 + 0.3 * sin(t * 3.5));
          float dist = getSegment(t, pos, 0.0, scale, 0.0);
          float glow = getGlow(dist, radius, intensity);
          col += 10.0*vec3(smoothstep(0.004, 0.001, dist));
          col += glow * vec3(1.0,0.1,0.4);
          dist = getSegment(t, pos, 2.0, scale * 1.1, 0.8);
          glow = getGlow(dist, radius, intensity);
          col += 10.0*vec3(smoothstep(0.004, 0.001, dist));
          col += glow * vec3(0.4,0.1,1.0);
          dist = getSegment(t, pos, 4.0, scale * 1.0, 1.6);
          glow = getGlow(dist, radius, intensity);
          col += 10.0*vec3(smoothstep(0.004, 0.002, dist));
          col += glow * vec3(1.0, 0.8, 0.2) * 0.24;
          float pulse = 0.6 + 0.4 * sin(t * 3.5);
          col *= (0.6 + 0.3 * pulse);
          col = 1.0 - exp(-col);
          col = pow(col, vec3(0.4545));
          gl_FragColor = vec4(col,1.0);
        }
      `;

      window.addEventListener("resize", resizeCanvas, false);
      resizeCanvas();

      function compileShader(shaderSource, shaderType) {
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          throw "Shader compile failed with: " + gl.getShaderInfoLog(shader);
        }
        return shader;
      }

      function getAttribLocation(program, name) {
        var attributeLocation = gl.getAttribLocation(program, name);
        if (attributeLocation === -1) {
          throw "Cannot find attribute " + name + ".";
        }
        return attributeLocation;
      }

      function getUniformLocation(program, name) {
        var uniformLocation = gl.getUniformLocation(program, name);
        if (uniformLocation === null) {
          throw "Cannot find uniform " + name + ".";
        }
        return uniformLocation;
      }

      var vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
      var fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);
      var program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw "Program link failed with: " + gl.getProgramInfoLog(program);
      }
      gl.useProgram(program);

      var vertexData = new Float32Array([
        -1.0, 1.0,
        -1.0, -1.0,
        1.0, 1.0,
        1.0, -1.0
      ]);
      var vertexDataBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

      var positionHandle = getAttribLocation(program, "position");
      gl.enableVertexAttribArray(positionHandle);
      gl.vertexAttribPointer(positionHandle, 2, gl.FLOAT, false, 2 * 4, 0);

      var timeHandle = getUniformLocation(program, "time");
      var widthHandle = getUniformLocation(program, "width");
      var heightHandle = getUniformLocation(program, "height");

      gl.uniform1f(widthHandle, canvas.width);
      gl.uniform1f(heightHandle, canvas.height);

      var lastFrame = Date.now();
      var thisFrame;

      function updateText() {
        var t = (Date.now() / 1000) % 4;
        loveText.textContent = t < 2 ? "Me encantas" : "Te Amo";
        requestAnimationFrame(updateText);
      }
      updateText();

      function draw() {
        thisFrame = Date.now();
        time += (thisFrame - lastFrame) / 1000;
        lastFrame = thisFrame;
        gl.uniform1f(timeHandle, time);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(draw);
      }
      draw();