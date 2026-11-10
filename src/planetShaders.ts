export const PLANET_VERTEX_SHADER = `
  attribute vec2 aPosition;
  varying vec2 vUv;

  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

export const PLANET_FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec4 uOrientation;
  uniform float uPixels;
  uniform float uSeed;
  // 纹理尺寸必须传入整数：噪声以 mod(cell, period) 实现经度环绕，
  // 只有整数周期才能让球面经度 0/1 接缝两侧的 cell 哈希完全对齐。
  uniform float uLandSize;
  uniform float uCloudSize;
  uniform float uCloudCover;
  uniform vec2 uLightOrigin;
  uniform int uMode;

  uniform vec3 uLand0;
  uniform vec3 uLand1;
  uniform vec3 uLand2;
  uniform vec3 uLand3;
  uniform vec3 uRiver0;
  uniform vec3 uRiver1;
  uniform vec3 uCloud0;
  uniform vec3 uCloud1;
  uniform vec3 uCloud2;
  uniform vec3 uCloud3;

  float randomValue(vec2 coord, float seed, vec2 period) {
    coord = mod(coord, period);
    return fract(sin(dot(coord, vec2(12.9898, 78.233))) * 15.5453 * seed);
  }

  float valueNoise(vec2 coord, float seed, vec2 period) {
    vec2 cell = floor(coord);
    vec2 local = fract(coord);
    float a = randomValue(cell, seed, period);
    float b = randomValue(cell + vec2(1.0, 0.0), seed, period);
    float c = randomValue(cell + vec2(0.0, 1.0), seed, period);
    float d = randomValue(cell + vec2(1.0, 1.0), seed, period);
    vec2 curve = local * local * (3.0 - 2.0 * local);
    return mix(a, b, curve.x)
      + (c - a) * curve.y * (1.0 - curve.x)
      + (d - b) * curve.x * curve.y;
  }

  // 坐标缩放倍率对应的周期必须同步传入整数周期，否则经度接缝处哈希跳变。
  float fbmLand(vec2 coord, float periodSize) {
    float value = 0.0;
    float scale = 0.5;
    vec2 period = vec2(periodSize);
    for (int octave = 0; octave < 6; octave++) {
      value += valueNoise(coord, uSeed, period) * scale;
      coord *= 2.0;
      period *= 2.0;
      scale *= 0.5;
    }
    return value;
  }

  float landFbm(vec2 coord) {
    return fbmLand(coord, uLandSize);
  }

  float landFbmDetail(vec2 coord) {
    // 细节层同时放大坐标与周期，保持经度方向仍然无缝环绕。
    return fbmLand(coord * 2.0, uLandSize * 2.0);
  }

  float cloudFbm(vec2 coord) {
    float value = 0.0;
    float scale = 0.5;
    vec2 period = vec2(uCloudSize);
    for (int octave = 0; octave < 3; octave++) {
      value += valueNoise(coord, uSeed + 3.17, period) * scale;
      coord *= 2.0;
      period *= 2.0;
      scale *= 0.5;
    }
    return value;
  }

  vec2 rotateCentered(vec2 uv, float angle) {
    float cosine = cos(angle);
    float sine = sin(angle);
    return mat2(cosine, -sine, sine, cosine) * uv;
  }

  vec2 spherify(vec2 uv) {
    vec2 centered = uv * 2.0 - 1.0;
    float z = sqrt(max(0.0, 1.0 - dot(centered, centered)));
    return centered / (z + 1.0) * 0.5 + 0.5;
  }

  vec3 rotateByQuaternion(vec3 point, vec4 quaternion) {
    return point
      + 2.0 * cross(
        quaternion.xyz,
        cross(quaternion.xyz, point) + quaternion.w * point
      );
  }

  vec2 orientedSphereUv(vec2 uv) {
    vec2 centered = uv * 2.0 - 1.0;
    vec3 surface = vec3(
      centered,
      sqrt(max(0.0, 1.0 - dot(centered, centered)))
    );
    vec3 rotated = normalize(rotateByQuaternion(surface, uOrientation));
    vec2 sphereUv = vec2(
      atan(rotated.x, rotated.z) / 6.28318530718 + 0.5,
      asin(clamp(rotated.y, -1.0, 1.0)) / 3.14159265359 + 0.5
    );

    // Longitude is undefined at the poles. Keep the original latitude and
    // blend only longitude into a local planar projection near each cap.
    float poleBlend = smoothstep(0.78, 0.96, abs(rotated.y));
    float poleCenter = rotated.y >= 0.0 ? 0.25 : 0.75;
    float polarLongitude = poleCenter
      + dot(rotated.xz, vec2(0.1767767)) * 0.5;
    float longitudeDelta = polarLongitude - sphereUv.x;
    longitudeDelta -= floor(longitudeDelta + 0.5);
    sphereUv.x = fract(sphereUv.x + longitudeDelta * poleBlend);
    return sphereUv;
  }

  float ditherValue(vec2 pixelUv, vec2 realUv) {
    return step(
      mod(pixelUv.x + realUv.y, 2.0 / uPixels),
      1.0 / uPixels
    );
  }

  float circleNoise(vec2 uv, float seedOffset, vec2 period) {
    float row = floor(uv.y);
    // Wrap the staggered coordinate before hashing so the pattern tiles
    // seamlessly across the longitude period.
    vec2 staggered = vec2(mod(uv.x + row * 0.31, period.x), row);
    vec2 local = fract(uv);
    float hash = randomValue(
      vec2(floor(staggered.x), row),
      uSeed + seedOffset,
      period
    );
    float radius = max(0.02, hash * 0.25);
    return smoothstep(radius * 0.9, radius, length(local - 0.25 - hash * 0.5));
  }

  float cloudAlpha(vec2 uv) {
    float turbulence = 0.0;
    // circleNoise 用 fract(uv) 计算局部坐标，x 缩放与周期都必须取整，
    // 否则接缝两侧的圆点位置会突变，在球面背面留下拼接线。
    float turbulenceScale = max(1.0, floor(uCloudSize * 0.3 + 0.5));
    for (int index = 0; index < 9; index++) {
      turbulence += circleNoise(
        uv * turbulenceScale
          + float(index)
          + 11.0
          + vec2(uTime * 0.045, 0.0),
        3.17,
        vec2(turbulenceScale, 256.0)
      );
    }
    return cloudFbm(
      uv * uCloudSize + turbulence + vec2(uTime * 0.045, 0.0)
    );
  }

  // 三档光影，档位交界用棋盘抖动过渡，保持原始的硬朗像素分区。
  vec3 quantizedLight(
    vec3 bright,
    vec3 middle,
    vec3 dark,
    float distanceToLight,
    float dith
  ) {
    vec3 color = bright;
    float border = 2.8 / uPixels;
    if (distanceToLight > 0.43) color = middle;
    if (distanceToLight > 0.43 && distanceToLight < 0.43 + border && dith > 0.5) {
      color = bright;
    }
    if (distanceToLight > 0.62) color = dark;
    if (distanceToLight > 0.62 && distanceToLight < 0.62 + border && dith > 0.5) {
      color = middle;
    }
    return color;
  }

  // 四档光影供新增主题使用，比三档多一层深阴影。
  vec3 quantizedLight4(
    vec3 bright,
    vec3 middle,
    vec3 dark,
    vec3 deep,
    float distanceToLight,
    float dith
  ) {
    vec3 color = bright;
    float border = 2.6 / uPixels;
    if (distanceToLight > 0.36) color = middle;
    if (distanceToLight > 0.36 && distanceToLight < 0.36 + border && dith > 0.5) {
      color = bright;
    }
    if (distanceToLight > 0.54) color = dark;
    if (distanceToLight > 0.54 && distanceToLight < 0.54 + border && dith > 0.5) {
      color = middle;
    }
    if (distanceToLight > 0.72) color = deep;
    if (distanceToLight > 0.72 && distanceToLight < 0.72 + border && dith > 0.5) {
      color = dark;
    }
    return color;
  }

  // 与云层相同的纬度扭曲，单独抽出供云影二次采样。
  vec2 cloudUvAt(vec2 sphereUv) {
    vec2 cloudUv = sphereUv;
    // 纬度扭曲必须是经度的周期函数（周期 1）。三角环绕距离保证
    // x = 0 与 x = 1 处偏移量一致，避免云层在接缝两侧错位。
    float wrapDistance = abs(fract(cloudUv.x - 0.4 + 0.5) - 0.5);
    cloudUv.y += smoothstep(0.0, 1.3, wrapDistance);
    return cloudUv;
  }

  float cloudValue(vec2 sphereUv) {
    return cloudAlpha(cloudUvAt(sphereUv) * vec2(1.0, 2.0));
  }

  vec3 cloudLayer(vec2 sphereUv, float lightDistance, float coverage) {
    float cloud = cloudValue(sphereUv);
    if (cloud < coverage) return vec3(-1.0);

    vec3 color = uCloud0;
    if (cloud < coverage + 0.03) color = uCloud1;
    if (lightDistance + cloud * 0.2 > 0.52) color = uCloud2;
    if (lightDistance + cloud * 0.2 > 0.62) color = uCloud3;
    return color;
  }

  // 群岛式地表：域扭曲 fbm 切出大陆与海面，再叠云层。
  vec3 renderArchipelago(
    vec2 sphereUv,
    float lightDistance,
    float dith,
    float surfaceDrift,
    bool drawClouds
  ) {
    vec2 terrainUv = sphereUv;
    vec2 movingTerrain = terrainUv * uLandSize
      + vec2(surfaceDrift * 0.075, 0.0);
    float fbm1 = landFbm(movingTerrain);
    float fbm2 = landFbm(movingTerrain - uLightOrigin * fbm1);
    float fbm3 = landFbm(movingTerrain - uLightOrigin * 1.5 * fbm1);
    float fbm4 = landFbm(movingTerrain - uLightOrigin * 2.0 * fbm1);
    float lightBias = pow(lightDistance, 2.0) * 0.4;

    if (lightDistance > 0.287) {
      fbm2 *= 1.05;
      fbm3 *= 1.05;
      fbm4 *= 1.05;
    }
    if (lightDistance > 0.476) {
      fbm2 *= 1.3;
      fbm3 *= 1.4;
      fbm4 *= mix(1.8, 1.45, dith);
    }

    vec3 color = uLand3;
    if (fbm4 + lightBias < fbm1 * 1.5) color = uLand2;
    if (fbm3 + lightBias < fbm1) color = uLand1;
    if (fbm2 + lightBias < fbm1) color = uLand0;

    float landMask = step(0.54, fbm1);
    vec3 ocean = quantizedLight(uRiver0, uRiver1, uLand3, lightDistance, dith);
    color = mix(ocean, color, landMask);

    if (drawClouds) {
      vec3 cloud = cloudLayer(sphereUv, lightDistance, uCloudCover + 0.04);
      if (cloud.r >= 0.0) color = mix(color, cloud, 0.88);
    }
    return color;
  }

  vec3 renderOcean(vec2 sphereUv, float lightDistance, float dith) {
    vec2 coord = sphereUv * uLandSize + vec2(uTime * 0.06, 0.0);
    float terrain = landFbm(coord);
    float detail = landFbmDetail(coord + terrain * 3.0);
    float landHeight = terrain * 0.75 + detail * 0.25;
    float archipelago = smoothstep(0.565, 0.59, landHeight);
    float shelf = smoothstep(0.525, 0.562, landHeight) * (1.0 - archipelago);

    vec3 deepOcean = mix(uRiver1, uLand3, 0.6);
    vec3 ocean = quantizedLight4(
      uRiver0,
      uRiver1,
      deepOcean,
      mix(deepOcean, uCloud3, 0.55),
      lightDistance + (0.64 - landHeight) * 0.5,
      dith
    );
    // 浅海陆架：亮色抖动带。
    ocean = mix(ocean, mix(uRiver0, uLand0, 0.2), shelf * (0.28 + 0.22 * dith));

    vec3 land = quantizedLight4(
      uLand0,
      uLand1,
      uLand2,
      mix(uLand3, uCloud3, 0.35),
      lightDistance,
      dith
    );
    vec3 color = mix(ocean, land, archipelago);

    vec3 cloud = cloudLayer(sphereUv, lightDistance, uCloudCover);
    if (cloud.r >= 0.0) color = mix(color, cloud, 0.82);
    return color;
  }

  // 极光叠加：在任意地表上覆盖极圈光带。
  vec3 applyAurora(vec3 color, vec2 sphereUv, float dith) {
    // 极光卵：围绕两极的同心光带，相位叠加经度波动形成褶皱，
    // 环形结构不依赖极点处被压缩的经度，避免图案退化。
    float polar = abs(sphereUv.y - 0.5) * 2.0;
    float zone = smoothstep(0.24, 0.42, polar)
      * (1.0 - smoothstep(0.92, 0.98, polar));
    // 经度方向的相位必须取 2π 的整数倍，否则会在本初子午线留下接缝。
    float fold = sphereUv.x * 12.5663706
      + sin(sphereUv.x * 25.1327412 + uTime * 0.6) * 1.4;
    float curtain = sin(polar * 31.0 + fold - uTime * 0.9) * 0.5 + 0.5;
    float lace = sin(polar * 57.0 - fold * 1.7 + uTime * 1.3) * 0.5 + 0.5;
    float aurora = smoothstep(0.42, 0.7, curtain * 0.68 + lace * 0.32) * zone;
    vec3 auroraDeep = vec3(0.04, 0.5, 0.38);
    vec3 auroraBright = vec3(0.21, 0.96, 0.55);
    vec3 auroraColor = mix(
      auroraDeep,
      auroraBright,
      smoothstep(0.25, 0.85, lace)
    );
    float core = smoothstep(0.76, 0.94, curtain) * zone;

    // 极光带下方轻微压暗，让高饱和绿带在冰原上形成明暗对比。
    color *= 1.0 - aurora * 0.26;
    color = mix(color, auroraColor, aurora * 0.95);
    // 叠加发光：保持高饱和绿色，仅最亮的核心向冰白过渡。
    color += auroraBright * aurora * (0.16 + 0.12 * dith);
    color += mix(auroraBright, uCloud0, 0.5) * core * 0.24;

    // 极地冰盖上的细碎闪光。
    float sparkle = step(
      0.985,
      randomValue(floor(sphereUv * 140.0), uSeed + 4.0, vec2(140.0))
    );
    color += uCloud0 * sparkle * zone * 0.6;
    return color;
  }

  vec4 overLayer(vec4 base, vec4 top) {
    float alpha = top.a + base.a * (1.0 - top.a);
    if (alpha < 0.0001) return vec4(0.0);
    vec3 color = (
      top.rgb * top.a + base.rgb * base.a * (1.0 - top.a)
    ) / alpha;
    return vec4(color, alpha);
  }

  vec4 jellyfishLayer(
    vec2 point,
    vec2 center,
    vec2 up,
    float size,
    float opacity,
    float phase
  ) {
    vec2 right = vec2(up.y, -up.x);
    vec2 delta = point - center;
    vec2 p = vec2(dot(delta, right), dot(delta, up)) / size;
    float pulse = sin(uTime * 3.2 + phase) * 0.055;
    p.x /= 1.0 + pulse;
    p.y *= 1.0 - pulse * 0.5;

    float domeDistance = length(vec2(p.x * 1.02, (p.y + 0.02) * 1.08));
    float dome = (1.0 - step(0.86, domeDistance)) * step(-0.06, p.y);
    float skirtEdge = -0.16 - 0.08 * (0.5 + 0.5 * cos(p.x * 12.0));
    float skirt = (1.0 - step(0.88, abs(p.x)))
      * step(skirtEdge, p.y)
      * (1.0 - step(-0.04, p.y));
    float bell = max(dome, skirt);
    float bellCore = 1.0 - step(
      0.42,
      length(vec2(p.x, (p.y + 0.02) * 1.1))
    );
    float bellRim = bell * step(0.68, domeDistance);
    float topLight = dome
      * step(0.16, p.y)
      * (1.0 - step(0.8, length(vec2(p.x, (p.y - 0.34) * 1.4))));

    vec3 bellColor = mix(uRiver1, uRiver0, 1.0 - step(0.55, domeDistance));
    bellColor = mix(bellColor, uCloud0, bellCore * 0.52);
    bellColor = mix(bellColor, uCloud0, bellRim * 0.34);
    bellColor = mix(bellColor, uCloud1, topLight * 0.8);

    float spots = 1.0 - step(
      0.075,
      length(p - vec2(-0.3, 0.24))
    );
    spots = max(
      spots,
      1.0 - step(0.06, length(p - vec2(0.1, 0.34)))
    );
    spots = max(
      spots,
      1.0 - step(0.07, length(p - vec2(0.36, 0.14)))
    );
    bellColor = mix(bellColor, uCloud1, spots * 0.66);

    float tentacles = 0.0;
    for (int arm = 0; arm < 8; arm++) {
      float index = float(arm);
      float below = -p.y - 0.06;
      float sway = sin(
        below * 3.4 - uTime * 2.6 + index * 1.31 + phase
      ) * (0.05 + below * 0.1)
        + sin(below * 7.1 - uTime * 1.7 + index * 2.7)
        * (0.02 + below * 0.03);
      float tentacleLength = 1.3
        + 0.55 * fract(index * 0.37 + phase * 0.11);
      float width = max(
        0.016,
        (0.06 + 0.02 * fract(index * 0.61 + phase))
        * (1.0 - below / (tentacleLength * 1.4))
      );
      float line = (1.0 - step(width, abs(p.x - (-0.7 + index * 0.2) - sway)))
        * step(0.0, below)
        * (1.0 - step(tentacleLength, below));
      tentacles = max(tentacles, line);
    }

    float oralArms = 0.0;
    for (int arm = 0; arm < 3; arm++) {
      float index = float(arm);
      float below = -p.y - 0.02;
      float sway = sin(
        below * 5.0 - uTime * 2.2 + index * 2.1 + phase
      ) * (0.09 + below * 0.12);
      float armLength = 0.72 + 0.22 * fract(index * 0.47 + phase);
      float ruffle = 0.7 + 0.6 * step(
        0.5,
        fract(below * 5.0 - uTime * 1.3 + index)
      );
      float width = 0.15 * ruffle * (1.0 - below * 0.5);
      float line = (1.0 - step(max(width, 0.03), abs(p.x - (-0.28 + index * 0.28) - sway)))
        * step(0.0, below)
        * (1.0 - step(armLength, below));
      oralArms = max(oralArms, line);
    }

    vec3 tentacleColor = mix(
      uCloud1,
      uRiver1,
      step(0.72, fract(phase * 0.41)) * 0.4
    );
    float haloDistance = length(vec2(p.x, (p.y + 0.02) * 1.04));
    float bellHalo = (1.0 - step(1.22, haloDistance))
      * (0.08 + 0.1 * step(0.94, haloDistance));
    vec3 color = mix(tentacleColor, bellColor, bell);
    color = mix(uRiver1, color, max(bell, max(tentacles, oralArms * 0.8)));
    color = mix(color, uCloud0, oralArms * bell * 0.3);
    float alpha = max(
      max(bell, max(tentacles * 0.8, oralArms * 0.62)),
      bellHalo
    ) * opacity;
    return vec4(color, alpha);
  }

  vec4 renderJellyfishPlanet(vec2 point, float dith) {
    float radius = 0.76;
    float distanceFromCenter = length(point);
    float shell = 1.0 - step(radius, distanceFromCenter);
    float normalZ = sqrt(max(
      0.0,
      1.0 - pow(distanceFromCenter / radius, 2.0)
    ));

    float sphereTurn = 2.0 * (
      atan(uOrientation.y, uOrientation.w)
      + atan(uOrientation.x, uOrientation.w) * 0.8
    );
    float orbitAngle = uTime * 0.34 + 0.8 + sphereTurn;
    vec2 orbitCenter = vec2(
      cos(orbitAngle) * 0.96,
      sin(orbitAngle) * 0.96
    );
    vec2 orbitUp = normalize(vec2(
      -sin(orbitAngle),
      cos(orbitAngle)
    ));
    bool orbitInFront = sin(orbitAngle) < 0.0;

    vec4 color = vec4(0.0);
    if (!orbitInFront) {
      color = overLayer(
        color,
        jellyfishLayer(point, orbitCenter, orbitUp, 0.17, 0.88, 0.0)
      );
    }

    float coreRadius = 0.2 + 0.012 * sin(uTime * 2.0);
    float haloNear = step(coreRadius, distanceFromCenter)
      * (1.0 - step(coreRadius * 1.45, distanceFromCenter))
      * shell
      * 0.26;
    float haloFar = step(coreRadius * 1.45, distanceFromCenter)
      * (1.0 - step(coreRadius * 3.3, distanceFromCenter))
      * shell
      * 0.1;
    color = overLayer(color, vec4(uRiver1, haloNear + haloFar));

    // 核心向外扩散的脉冲环，让球体内部有能量流动感。
    float pulseA = fract(uTime * 0.22);
    float pulseB = fract(uTime * 0.22 + 0.5);
    float pulseRingA = (1.0 - step(
      0.018,
      abs(distanceFromCenter - mix(coreRadius * 1.15, radius * 0.9, pulseA))
    )) * (1.0 - pulseA) * shell;
    float pulseRingB = (1.0 - step(
      0.014,
      abs(distanceFromCenter - mix(coreRadius * 1.15, radius * 0.9, pulseB))
    )) * (1.0 - pulseB) * shell;
    color = overLayer(
      color,
      vec4(uRiver0, pulseRingA * 0.26 + pulseRingB * 0.18)
    );

    float core = 1.0 - step(coreRadius, distanceFromCenter);
    float coreDistance = distanceFromCenter / coreRadius;
    float coreAngle = atan(point.y, point.x);
    float plasma = floor(
      (0.5 + 0.5 * sin(coreAngle * 5.0 + uTime * 1.6 + coreDistance * 6.0)) * 3.0
    ) / 3.0;
    vec3 coreColor = mix(uRiver1, uRiver0, 1.0 - step(0.72, coreDistance));
    coreColor = mix(
      coreColor,
      uCloud0,
      (1.0 - step(0.34, coreDistance)) * 0.8
    );
    coreColor = mix(
      coreColor,
      uCloud1,
      plasma * 0.3 * (1.0 - step(0.9, coreDistance))
    );
    coreColor = mix(
      coreColor,
      uCloud0,
      step(0.84, coreDistance) * core * 0.45
    );
    color = overLayer(color, vec4(coreColor, core * 0.98));

    // 每只小水母使用独立生命周期，从核心游向球壳并提前消散。
    for (int index = 0; index < 5; index++) {
      float id = float(index);
      float cycle = 6.2 + randomValue(
        vec2(id, 3.0),
        uSeed,
        vec2(256.0)
      ) * 2.0;
      float clock = uTime / cycle + id * 0.23;
      float age = fract(clock);
      float generation = floor(clock);
      float angle = randomValue(
        vec2(generation, id + 11.0),
        uSeed + 1.7,
        vec2(256.0)
      ) * 6.28318530718;
      vec3 localDirection = vec3(cos(angle), sin(angle), 0.0);
      vec3 rotatedDirection = rotateByQuaternion(
        localDirection,
        uOrientation
      );
      vec2 projectedDirection = rotatedDirection.xy;
      float directionLength = length(projectedDirection);
      vec2 direction = directionLength > 0.001
        ? projectedDirection / directionLength
        : vec2(0.0, 1.0);
      float travel = mix(
        coreRadius * 0.85,
        radius * 0.9,
        pow(age, 0.85)
      );
      float sideways = sin(age * 10.0 + id) * 0.03 * age;
      vec2 planarCenter = direction * travel
        + vec2(direction.y, -direction.x) * sideways;
      vec3 rotatedCenter = rotateByQuaternion(
        vec3(planarCenter, 0.0),
        uOrientation
      );
      vec2 center = rotatedCenter.xy;
      float opacity = smoothstep(0.04, 0.16, age)
        * (1.0 - smoothstep(0.62, 0.92, age))
        * (0.88 + 0.12 * smoothstep(-0.55, 0.55, rotatedCenter.z));
      float size = mix(0.115, 0.08, age);
      color = overLayer(
        color,
        jellyfishLayer(point, center, direction, size, opacity, id + 1.0)
      );
    }

    vec2 sphereUv = orientedSphereUv(point / radius * 0.5 + 0.5);
    vec2 shellCoord = sphereUv * uLandSize * 1.6;
    float broad = landFbm(shellCoord);
    float fine = landFbmDetail(shellCoord + broad * 1.8);
    float pattern = broad * 0.72 + fine * 0.28;
    float continent = step(0.56, pattern);
    float highland = step(0.66, pattern);
    float coast = (1.0 - step(0.016, abs(pattern - 0.56))) * shell;

    // 晶壳：Voronoi 把球面切成多边形晶面，晶面交界处形成亮裂线。
    vec2 facetUv = sphereUv * vec2(9.0, 6.0);
    vec2 facetCell = floor(facetUv);
    vec2 facetLocal = fract(facetUv);
    float facetBest = 8.0;
    float facetSecond = 8.0;
    float facetId = 0.0;
    for (int row = -1; row <= 1; row++) {
      for (int column = -1; column <= 1; column++) {
        vec2 offset = vec2(float(column), float(row));
        vec2 jitter = vec2(
          randomValue(facetCell + offset, uSeed + 9.0, vec2(256.0)),
          randomValue(facetCell + offset, uSeed + 10.0, vec2(256.0))
        );
        float facetDistance = length(offset + jitter - facetLocal);
        if (facetDistance < facetBest) {
          facetSecond = facetBest;
          facetBest = facetDistance;
          facetId = randomValue(
            facetCell + offset,
            uSeed + 11.0,
            vec2(256.0)
          );
        } else if (facetDistance < facetSecond) {
          facetSecond = facetDistance;
        }
      }
    }
    float facetCrack = (1.0 - step(0.09, facetSecond - facetBest)) * shell;
    float facetTone = floor(facetId * 5.0) / 5.0;

    float lightX = (uLightOrigin.x - 0.5) * 2.0;
    float lightY = (uLightOrigin.y - 0.5) * 2.0;
    vec3 lightDirection = normalize(vec3(lightX, lightY, 0.88));
    vec3 normal = vec3(point / radius, normalZ);
    float lightDot = clamp(
      dot(normal, lightDirection) * 0.5 + 0.5,
      0.0,
      1.0
    );
    float shade = 0.94;
    if (lightDot < 0.74) shade = 0.78;
    if (lightDot < 0.53) shade = 0.58;
    if (lightDot < 0.34) shade = 0.42;

    // 玻璃壳：菲涅尔让边缘反光更强、中心保持通透以露出核心。
    float fresnel = floor((1.0 - normalZ) * 4.0) / 4.0;
    vec3 shellColor = mix(uLand3, uLand2, shade);
    shellColor = mix(shellColor, uLand2, continent * 0.55);
    shellColor = mix(shellColor, uLand1, highland * 0.6);
    shellColor = mix(shellColor, uLand1, facetTone * 0.45 * shade);
    float shellAlpha = shell * (
      0.3
      + 0.34 * fresnel
      + 0.1 * continent
    );
    color = overLayer(color, vec4(shellColor, shellAlpha));
    color = overLayer(color, vec4(uLand0, coast * 0.6));
    color = overLayer(
      color,
      vec4(mix(uCloud1, uRiver0, 0.4), facetCrack * 0.45)
    );
    float facetGlint = step(0.72, facetTone) * step(0.62, lightDot) * shell;
    color = overLayer(color, vec4(uCloud0, facetGlint * 0.14));

    vec2 radial = distanceFromCenter > 0.0001
      ? point / distanceFromCenter
      : vec2(1.0, 0.0);
    vec2 lightDir2 = length(vec2(lightX, lightY)) > 0.001
      ? normalize(vec2(lightX, lightY))
      : vec2(0.0, 1.0);
    float facing = dot(radial, lightDir2);
    float specOuter = step(0.3, facing)
      * step(radius * 0.66, distanceFromCenter)
      * (1.0 - step(radius * 0.92, distanceFromCenter))
      * shell;
    float specInner = step(0.62, facing)
      * step(radius * 0.72, distanceFromCenter)
      * (1.0 - step(radius * 0.88, distanceFromCenter))
      * shell;
    float bounce = step(-0.9, facing)
      * (1.0 - step(-0.5, facing))
      * step(radius * 0.62, distanceFromCenter)
      * (1.0 - step(radius * 0.92, distanceFromCenter))
      * shell;
    color = overLayer(color, vec4(mix(uCloud0, uLand0, 0.35), specOuter * 0.16));
    color = overLayer(color, vec4(mix(uCloud0, uLand0, 0.15), specInner * 0.22));
    color = overLayer(color, vec4(uRiver1, bounce * 0.16));

    float rimShadow = step(radius * 0.8, distanceFromCenter)
      * (1.0 - step(radius * 0.86, distanceFromCenter))
      * shell;
    float rimInner = step(radius * 0.86, distanceFromCenter)
      * (1.0 - step(radius * 0.94, distanceFromCenter))
      * shell;
    float rimOuter = step(radius * 0.94, distanceFromCenter)
      * (1.0 - step(radius * 0.96, distanceFromCenter))
      * shell;
    float rimOutline = step(radius * 0.96, distanceFromCenter) * shell;
    float glint = step(radius * 0.65, distanceFromCenter)
      * (1.0 - step(radius * 0.8, distanceFromCenter))
      * shell
      * step(0.08, point.y)
      * step(-0.62, point.x)
      * (1.0 - step(0.12, point.x));
    color = overLayer(color, vec4(uLand2, rimShadow * 0.26));
    color = overLayer(color, vec4(uLand1, rimInner * 0.5));
    color = overLayer(color, vec4(uLand0, rimOuter * 0.82));
    color = overLayer(
      color,
      vec4(mix(uLand2, uLand3, 0.35), rimOutline * 0.92)
    );
    color = overLayer(color, vec4(uCloud1, glint * 0.18));

    if (orbitInFront) {
      color = overLayer(
        color,
        jellyfishLayer(point, orbitCenter, orbitUp, 0.17, 1.0, 0.0)
      );
    }
    return color;
  }

  float cloudLengthSeed(float shade) {
    return fract(shade * 7.31 + shade * shade * 2.7);
  }

  float cloudStretch(float shade) {
    return mix(
      0.9,
      2.15,
      smoothstep(0.4, 0.9, cloudLengthSeed(shade))
    );
  }

  // 星种系列全部使用固定整数周期的无缝噪声，保证 20 款纹理频率一致。
  float seedFbm(vec2 coord) {
    return fbmLand(coord, 6.0);
  }

  float seedStreak(vec2 sphereUv) {
    vec2 coord = sphereUv * vec2(6.0, 12.0);
    float warp = seedFbm(sphereUv * vec2(6.0, 6.0));
    float detail = seedFbm(coord + warp * 1.8);
    return warp * 0.6 + detail * 0.4;
  }

  float seedGrain(vec2 sphereUv) {
    return randomValue(
      floor(sphereUv * vec2(74.0, 58.0)),
      uSeed + 18.0,
      vec2(256.0)
    );
  }

  float seedSurfaceValue(vec2 sphereUv, float fineWeight) {
    float streak = seedStreak(sphereUv);
    float flow = streak * 4.2
      + sin(sphereUv.x * 12.5663706) * 1.1;
    float bands = sin(sphereUv.y * 46.0 + flow) * 0.5 + 0.5;
    float fine = sin(sphereUv.y * 92.0 + streak * 3.0) * 0.5 + 0.5;
    float grain = seedGrain(sphereUv);
    float value = bands * 0.44
      + streak * (0.46 - fineWeight)
      + fine * fineWeight;
    value += (grain - 0.5) * 0.09;
    return value;
  }

  vec3 seedSurfaceColor(float value) {
    vec3 color = uLand2;
    if (value > 0.55) color = uLand1;
    if (value > 0.65) color = uLand0;
    if (value > 0.74) color = mix(uLand0, uCloud0, 0.4);
    if (value < 0.37) color = uLand3;
    if (value < 0.27) color = mix(uLand3, uRiver1, 0.42);
    return color;
  }

  vec3 seedShadow(
    vec3 color,
    float lightDot,
    float dith
  ) {
    float shadowEdge = clamp(
      (1.0 - lightDot) * 0.5 + (dith - 0.5) * 0.022,
      0.0,
      1.0
    );
    if (shadowEdge > 0.4) color = mix(color, uLand2, 0.42);
    if (shadowEdge > 0.5) color = mix(color, uLand3, 0.6);
    if (shadowEdge > 0.62) color = mix(color, uLand3, 0.84);
    if (shadowEdge > 0.7) color *= 0.58;
    return color;
  }

  vec3 renderSeedRock(
    vec2 sphereUv,
    float lightDot,
    float dith
  ) {
    float value = seedSurfaceValue(sphereUv, 0.12);
    vec3 color = seedSurfaceColor(value);

    // 岩质款在统一条纹底子上叠加少量横向拉长的暗斑。
    vec2 blotchGrid = sphereUv * vec2(5.0, 7.0);
    float roll = randomValue(
      floor(blotchGrid),
      uSeed + 23.0,
      vec2(256.0)
    );
    vec2 blotchLocal = fract(blotchGrid) - 0.5;
    float blotch = 1.0 - step(0.36, length(blotchLocal));
    color = mix(color, uLand3, blotch * step(0.76, roll) * 0.42);

    float grain = seedGrain(sphereUv);
    if (grain > 0.88) color = mix(color, uCloud1, 0.16);
    if (grain < 0.08) color = mix(color, uLand3, 0.16);
    return seedShadow(color, lightDot, dith);
  }

  vec3 renderSeedGas(
    vec2 sphereUv,
    float lightDot,
    float dith
  ) {
    float value = seedSurfaceValue(sphereUv, 0.26);
    vec3 color = seedSurfaceColor(value);

    float spotLon = fract(0.2 + uSeed * 0.071);
    float spotDelta = abs(fract(sphereUv.x - spotLon + 0.5) - 0.5);
    float storm = 1.0 - step(
      0.048,
      length(vec2(spotDelta * 1.9, sphereUv.y - 0.6))
    );
    if (fract(uSeed * 0.33) > 0.3) {
      color = mix(color, uRiver0, storm * 0.6);
    }
    return seedShadow(color, lightDot, dith);
  }

  vec4 seedMoon(
    vec2 point,
    vec2 center,
    float moonSize,
    float phase
  ) {
    vec2 p = (point - center) / moonSize;
    float disc = 1.0 - step(1.0, length(p));
    float lit = dot(
      normalize(p + vec2(0.0001)),
      normalize(vec2(-0.55, 0.8))
    );
    vec3 color = mix(uLand2, uLand0, step(-0.15, lit));
    if (lit < 0.35) color = uLand2;
    if (lit < -0.25) color = uLand3;
    float crater = step(
      0.76,
      randomValue(floor(p * 5.0 + phase), uSeed + 8.0, vec2(256.0))
    );
    color = mix(color, uLand3, crater * disc * 0.55);
    return vec4(color, disc);
  }

  vec4 seedDebris(vec2 point, float radius, float dith) {
    vec4 color = vec4(0.0);
    for (int index = 0; index < 22; index++) {
      float id = float(index);
      float angleSeed = randomValue(
        vec2(id, 3.7),
        uSeed + 1.3,
        vec2(256.0)
      );
      float distanceSeed = randomValue(
        vec2(id, 9.1),
        uSeed + 4.7,
        vec2(256.0)
      );
      float colorSeed = randomValue(
        vec2(id, 15.4),
        uSeed + 6.1,
        vec2(256.0)
      );
      float angle = angleSeed * 6.28318530718
        + uTime * (0.025 + distanceSeed * 0.02);
      float distance = radius + 0.03 + distanceSeed * 0.22;
      vec2 center = vec2(cos(angle), sin(angle) * 0.82) * distance;
      float extent = 0.006 + distanceSeed * 0.015;
      float square = 1.0 - step(
        extent,
        max(abs(point.x - center.x), abs(point.y - center.y))
      );
      vec3 sparkColor = mix(uRiver0, uCloud0, step(0.56, colorSeed));
      if (colorSeed < 0.28) sparkColor = uLand0;
      float alpha = square * (0.34 + dith * 0.36);
      color = overLayer(color, vec4(sparkColor, alpha));
    }
    return color;
  }

  vec4 renderSeedPlanet(vec2 point, float dith) {
    float radius = 0.78;
    float sphereDistance = length(point) / radius;
    float sphere = 1.0 - step(1.0, sphereDistance);
    vec2 localUv = point / radius * 0.5 + 0.5;
    vec2 sphereUv = orientedSphereUv(localUv);
    float normalZ = sqrt(max(
      0.0,
      1.0 - pow(min(sphereDistance, 1.0), 2.0)
    ));
    vec3 normal = vec3(point / radius, normalZ);
    vec3 lightDirection = normalize(vec3(
      (uLightOrigin.x - 0.5) * 2.0,
      (uLightOrigin.y - 0.5) * 2.0,
      0.38
    ));
    float lightDot = clamp(dot(normal, lightDirection), -1.0, 1.0);
    vec3 surface = uMode == 14
      ? renderSeedGas(sphereUv, lightDot, dith)
      : renderSeedRock(sphereUv, lightDot, dith);
    float rim = smoothstep(0.84, 1.0, sphereDistance);
    surface = mix(
      surface,
      uLand0,
      rim * step(0.0, lightDot) * 0.24
    );

    float moonAngle = fract(uSeed * 0.173) * 6.28318530718
      + uTime * 0.1;
    vec2 moonCenter = vec2(
      cos(moonAngle) * 0.93,
      sin(moonAngle) * 0.42
    );
    vec4 mainMoon = seedMoon(point, moonCenter, 0.105, 0.0);
    float smallAngle = moonAngle + 2.3;
    vec2 smallCenter = vec2(
      cos(smallAngle) * 0.98,
      sin(smallAngle) * 0.37
    );
    vec4 smallMoon = seedMoon(point, smallCenter, 0.062, 4.0);

    vec4 color = vec4(0.0);
    if (sin(moonAngle) > 0.0) color = overLayer(color, mainMoon);
    if (sin(smallAngle) > 0.0) color = overLayer(color, smallMoon);
    color = overLayer(color, vec4(surface, sphere));
    if (sin(moonAngle) <= 0.0) color = overLayer(color, mainMoon);
    if (sin(smallAngle) <= 0.0) color = overLayer(color, smallMoon);
    color = overLayer(color, seedDebris(point, radius, dith));
    return color;
  }

  vec4 exteriorCloud(
    vec2 point,
    vec2 center,
    float size,
    float shade,
    float opacity,
    float dith
  ) {
    vec2 p = (point - center) / size;
    p.x /= cloudStretch(shade);
    float phase = shade * 6.28318530718;
    p += vec2(
      sin(uTime * 0.55 + phase),
      cos(uTime * 0.63 + phase) * 0.5
    ) * 0.045;
    p.x += p.y * (shade - 0.5) * 0.16;

    float distanceA = length(p - vec2(-0.72, -0.02)) / 0.52;
    float distanceB = length(p - vec2(-0.34, 0.25)) / 0.62;
    float distanceC = length(p - vec2(0.14, 0.46)) / 0.6;
    float distanceD = length(p - vec2(0.52, 0.22)) / 0.56;
    float distanceE = length(p - vec2(0.8, -0.05)) / 0.46;
    float distanceF = length(p - vec2(0.1, -0.18)) / 0.7;
    float distanceG = length(p - vec2(-0.1, 0.66)) / 0.44;
    float cloudDistance = min(
      min(min(distanceA, distanceB), min(distanceC, distanceD)),
      min(min(distanceE, distanceF), distanceG)
    );
    float edgeNoise = randomValue(
      floor(p * 14.0),
      uSeed + 5.0 + shade * 7.0,
      vec2(256.0)
    );
    float edgeOffset = (edgeNoise - 0.5) * 0.16;
    float body = 1.0 - step(1.0 + edgeOffset, cloudDistance);
    float fringe = 1.0 - step(1.14 + edgeOffset, cloudDistance);

    vec3 color = mix(uCloud1, uCloud0, step(-0.1, p.y));
    float bottomShadow = 1.0 - step(-0.26, p.y);
    color = mix(color, uCloud2, bottomShadow * (0.55 + shade * 0.35));
    color = mix(color, uCloud3, (1.0 - step(-0.62, p.y)) * 0.4);
    float highlight = 1.0 - step(
      0.5,
      length(p - vec2(-0.24, 0.36))
    );
    color = mix(color, uCloud0, highlight * 0.7);
    if (dith > 0.62 && p.y < 0.0) color = mix(color, uCloud1, 0.22);
    color = mix(mix(uCloud1, uCloud2, 0.2), color, body);
    float alpha = body * opacity
      + fringe * (1.0 - body) * (0.16 + dith * 0.24) * opacity;
    return vec4(color, alpha);
  }

  vec4 exteriorCloudLayer(
    vec2 point,
    float radius,
    bool front,
    float dith
  ) {
    vec4 color = vec4(0.0);
    for (int index = 0; index < 10; index++) {
      float id = float(index);
      float variation = randomValue(
        vec2(id, 19.0),
        uSeed + 2.4,
        vec2(256.0)
      );
      // 8 个云锚点沿赤道云带绕球一周，其余 2 个散布在高纬。
      float inBelt = 1.0 - step(7.5, id);
      float longitude = mix(
        id * 2.39996323,
        id * 0.7853982 + variation * 0.5,
        inBelt
      );
      float latitude = mix(
        (variation - 0.5) * 1.7,
        -0.12 + (variation - 0.5) * 0.5,
        inBelt
      );
      vec3 anchor = vec3(
        cos(latitude) * sin(longitude),
        sin(latitude),
        cos(latitude) * cos(longitude)
      );
      // 地表由视空间点旋转到物体空间，云锚点需用逆旋转才能同向跟随。
      vec3 rotated = rotateByQuaternion(
        anchor,
        vec4(-uOrientation.xyz, uOrientation.w)
      );
      bool isFront = rotated.z >= 0.0;
      if (isFront == front) {
        float stretchWeight = smoothstep(
          0.4,
          0.9,
          cloudLengthSeed(variation)
        );
        float size = mix(0.1, 0.13, variation)
          + inBelt * mix(0.07, 0.11, variation);
        size *= (0.96 + rotated.z * 0.08)
          * (1.0 - 0.03 * stretchWeight);
        vec2 center = rotated.xy * radius * (1.0 - 0.26 * stretchWeight);
        float opacity = front ? 0.97 : 0.86;
        color = overLayer(
          color,
          exteriorCloud(
            point,
            center,
            size,
            variation,
            opacity,
            dith
          )
        );
      }
    }
    return color;
  }

  vec4 renderCloudPlanet(vec2 point, float dith) {
    float radius = 0.86;
    float sphereDistance = length(point) / radius;
    float sphere = 1.0 - step(1.0, sphereDistance);
    vec2 sphereLocalUv = point / radius * 0.5 + 0.5;
    vec2 sphereUv = orientedSphereUv(sphereLocalUv);
    vec2 lightUv = spherify(sphereLocalUv);
    float lightDistance = distance(lightUv, uLightOrigin);
    vec3 surface = renderArchipelago(
      sphereUv,
      lightDistance,
      dith,
      0.0,
      false
    );
    float rim = smoothstep(0.82, 1.0, sphereDistance);
    surface += uCloud1 * rim * max(0.0, 0.15 - lightDistance * 0.1);

    vec4 color = exteriorCloudLayer(point, radius, false, dith);
    color = overLayer(color, vec4(surface, sphere));
    color = overLayer(
      color,
      exteriorCloudLayer(point, radius, true, dith)
    );
    return color;
  }

  vec3 renderPlanet(vec2 sphereUv, float lightDistance, float dith) {
    // 4、5、8 走深海式群岛；10 在深海地表上叠极光，其余走群岛式大陆。
    if (uMode == 10) {
      return applyAurora(
        renderOcean(sphereUv, lightDistance, dith),
        sphereUv,
        dith
      );
    }
    if (uMode == 4 || uMode == 5 || uMode == 8) {
      return renderOcean(sphereUv, lightDistance, dith);
    }
    return renderArchipelago(sphereUv, lightDistance, dith, uTime, true);
  }

  // 光环：多档色带 + 环缝，近侧会穿过球体前方，远侧在球面投影。
  vec4 ringLayer(vec2 planetSpace, float dith) {
    vec2 ringUv = rotateCentered(planetSpace, -0.32);
    float ringDistance = length(vec2(ringUv.x, ringUv.y / 0.28));
    float alpha = smoothstep(0.5, 0.53, ringDistance)
      * (1.0 - smoothstep(0.96, 1.02, ringDistance));
    // 卡西尼环缝。
    alpha *= 1.0 - (1.0 - smoothstep(0.0, 0.03, abs(ringDistance - 0.82))) * 0.85;
    if (alpha <= 0.01) return vec4(0.0);

    float bandIndex = floor(ringDistance * 14.0);
    float bandValue = randomValue(vec2(bandIndex, 7.0), uSeed + 2.0, vec2(256.0));
    vec3 color = mix(uRiver1, uRiver0, 0.35 + bandValue * 0.65);
    if (bandValue > 0.78) color = mix(color, uLand0, 0.7);
    if (bandValue < 0.18) color = mix(color, uLand1, 0.35);

    vec2 ringNormal = normalize(ringUv + vec2(0.0001));
    vec2 lightNormal = normalize(uLightOrigin - 0.5 + vec2(0.0001));
    float ringLight = clamp(dot(ringNormal, lightNormal) * 0.5 + 0.5, 0.0, 1.0);
    color *= 0.78 + 0.42 * ringLight;

    alpha *= dith > 0.15 ? 1.0 : 0.82;
    return vec4(color, alpha * 0.9);
  }

  void main() {
    vec2 pixelUv = floor(vUv * uPixels) / uPixels;
    vec2 centered = pixelUv * 2.0 - 1.0;
    // Keep a small transparent gutter around the rendered planet so its
    // pixelated rim and rings do not touch the canvas boundary.
    vec2 planetSpace = centered / 0.9;
    float planetRadius = uMode == 5 ? 0.72 : 1.0;
    float sphereDistance = length(planetSpace) / planetRadius;
    float dith = ditherValue(pixelUv, vUv);

    if (uMode == 11) {
      gl_FragColor = renderJellyfishPlanet(planetSpace, dith);
      return;
    }
    if (uMode == 12) {
      gl_FragColor = renderCloudPlanet(planetSpace, dith);
      return;
    }
    if (uMode == 13 || uMode == 14) {
      gl_FragColor = renderSeedPlanet(planetSpace, dith);
      return;
    }

    if (uMode == 5 && sphereDistance > 1.0) {
      vec4 ring = ringLayer(planetSpace, dith);
      if (ring.a > 0.02) {
        gl_FragColor = ring;
        return;
      }
    }

    if (sphereDistance > 1.0) discard;

    vec2 sphereLocalUv = planetSpace / planetRadius * 0.5 + 0.5;
    vec2 sphereUv = orientedSphereUv(sphereLocalUv);
    vec2 lightUv = spherify(sphereLocalUv);
    float lightDistance = distance(lightUv, uLightOrigin);
    vec3 color = renderPlanet(sphereUv, lightDistance, dith);

    // 保留原始版本的边缘微光：只在受光侧轻提亮，不整体罩色。
    float rim = smoothstep(0.82, 1.0, sphereDistance);
    color += uCloud1 * rim * max(0.0, 0.15 - lightDistance * 0.1);

    if (uMode == 5) {
      vec4 ring = ringLayer(planetSpace, dith);
      vec2 ringUv = rotateCentered(planetSpace, -0.32);
      if (ring.a > 0.02) {
        if (ringUv.y < 0.0) {
          // 近侧环覆盖在球体前方。
          color = mix(color, ring.rgb, ring.a * 0.92);
        } else {
          // 远侧环在球面上投下抖动阴影。
          color *= 1.0 - step(ditherValue(pixelUv, vUv), ring.a) * 0.16;
        }
      }
    }

    gl_FragColor = vec4(color, 1.0);
  }
`
