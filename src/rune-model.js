import base64_encoded_model from "../rune-classifier/base64_encoded_model.txt?raw";

/*
PATCH_FEATURES = 13
PATCH_FEATURES_DEEP = 13
NUM_CLASSES = 13

28x28 image => 16 patches of 7x7
7x7 patch uses W0 to become patch features
[W0][W0][W0][W0]
[W0][W0][W0][W0]
[W0][W0][W0][W0]
[W0][W0][W0][W0]

4x4 patches use W1 to become deeper patch features
[  W1  ][  W1  ]
[      ][      ]
[  W1  ][  W1  ]
[      ][      ]

Fully connected predicts 4 deep patches of features to output class
[0, 1, 2, 3, 4, 5...]

Memory Layout:
_________________________________________________
|    w0    | b0 |    w1    | b1 |    w2    | b2 |
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
w0 = 7^2 * PATCH_FEATURES
b0 = PATCH_FEATURES
w1 = 4 * PATCH_FEATURES * PATCH_FEATURES_DEEP
b1 = PATCH_FEATURES_DEEP
w1 = 4 * PATCH_FEATURES_DEEP * NUM_CLASSES
b1 = NUM_CLASSES
*/

const encodedWeights = atob(base64_encoded_model);
const modelParams = [];
for (let i = 0; i < 0 + 1 * encodedWeights.length; i++) {
  const a = encodedWeights.charCodeAt(i);
  modelParams.push(
    (((a & 0xf) - 8) * 2.2) / 16,
    ((((a >> 4) & 0xf) - 8) * 2.2) / 16,
  );
}

function linearReluLayer(
  data,
  modelParams,
  numOutputs,
  numInputs,
  x0,
  y0,
  span,
  stride,
  weightOffset,
  biasOffset,
) {
  const outputs = new Array(numOutputs);
  for (let i = 0; i < numOutputs; i++) {
    let acc = 0;
    for (let j = 0; j < numInputs; j++) {
      const inputIndex = y0 + (j % span) + stride * (x0 + Math.floor(j / span));
      const weightIndex = weightOffset + i * numInputs + j;
      acc += modelParams[weightIndex] * data[inputIndex];
    }
    const biasIndex = i + biasOffset + weightOffset;
    outputs[i] = Math.max(0, modelParams[biasIndex] + acc);
  }
  return outputs;
}

function layerNorm(t) {
  const mean = t.reduce((acc, val) => acc + val, 0) / t.length;
  const variance =
    t.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / t.length;
  return t.map((val) => (val - mean) / Math.sqrt(variance + 1e-3));
}

function classify(data) {
  const BASE_PATCH = 7 * 7;
  const PATCH_FEATURES = 34;
  const PATCH_FEATURES_DEEP = 25;
  const NUM_CLASSES = 7;

  // data, modelParams, numOutputs, numInputs, x0, y0, span, stride, weightOffset, biasOffset
  const x11 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      0,
      0,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );
  const x12 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      0,
      7,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );
  const x13 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      0,
      14,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );
  const x14 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      0,
      21,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );

  const x21 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      7,
      0,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );
  const x22 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      7,
      7,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );
  const x23 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      7,
      14,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );
  const x24 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      7,
      21,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );

  const x31 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      14,
      0,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );
  const x32 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      14,
      7,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );
  const x33 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      14,
      14,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );
  const x34 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      14,
      21,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );

  const x41 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      21,
      0,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );
  const x42 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      21,
      7,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );
  const x43 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      21,
      14,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );
  const x44 = layerNorm(
    linearReluLayer(
      data,
      modelParams,
      PATCH_FEATURES,
      BASE_PATCH,
      21,
      21,
      7,
      28,
      0,
      BASE_PATCH * PATCH_FEATURES,
    ),
  );

  const y11 = layerNorm(
    linearReluLayer(
      x11.concat(x12, x21, x22),
      modelParams,
      PATCH_FEATURES_DEEP,
      4 * PATCH_FEATURES,
      0,
      0,
      1000,
      0,
      BASE_PATCH * PATCH_FEATURES + PATCH_FEATURES,
      4 * PATCH_FEATURES * PATCH_FEATURES_DEEP,
    ),
  );
  const y12 = layerNorm(
    linearReluLayer(
      x13.concat(x14, x23, x24),
      modelParams,
      PATCH_FEATURES_DEEP,
      4 * PATCH_FEATURES,
      0,
      0,
      1000,
      0,
      BASE_PATCH * PATCH_FEATURES + PATCH_FEATURES,
      4 * PATCH_FEATURES * PATCH_FEATURES_DEEP,
    ),
  );
  const y21 = layerNorm(
    linearReluLayer(
      x31.concat(x32, x41, x42),
      modelParams,
      PATCH_FEATURES_DEEP,
      4 * PATCH_FEATURES,
      0,
      0,
      1000,
      0,
      BASE_PATCH * PATCH_FEATURES + PATCH_FEATURES,
      4 * PATCH_FEATURES * PATCH_FEATURES_DEEP,
    ),
  );
  const y22 = layerNorm(
    linearReluLayer(
      x33.concat(x34, x43, x44),
      modelParams,
      PATCH_FEATURES_DEEP,
      4 * PATCH_FEATURES,
      0,
      0,
      1000,
      0,
      BASE_PATCH * PATCH_FEATURES + PATCH_FEATURES,
      4 * PATCH_FEATURES * PATCH_FEATURES_DEEP,
    ),
  );

  const z = linearReluLayer(
    y11.concat(y12, y21, y22),
    modelParams,
    NUM_CLASSES,
    4 * PATCH_FEATURES_DEEP,
    0,
    0,
    1000,
    0,
    BASE_PATCH * PATCH_FEATURES +
      PATCH_FEATURES +
      4 * PATCH_FEATURES * PATCH_FEATURES_DEEP +
      PATCH_FEATURES_DEEP,
    4 * PATCH_FEATURES_DEEP * NUM_CLASSES,
  );

  return z;
}

export { classify };
