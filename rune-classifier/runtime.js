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
const linearReluLayer = (data, modelParams, numOutputs, numInputs, x0, y0, span, stride, weightOffset, biasOffset) => {
    const outputs = new Array(numOutputs);
    for (let i = 0; i < numOutputs; i++) {
        let acc = 0;
        for (let j = 0; j < numInputs; j++) {
            const inputIndex = y0 + j % span + stride * (x0 + Math.floor(j / span));
            const weightIndex = weightOffset + i * numInputs + j;
            acc += modelParams[weightIndex] * data[inputIndex];
        }
        const biasIndex = i + biasOffset + weightOffset;
        outputs[i] = Math.max(0, modelParams[biasIndex] + acc);
    }
    return outputs
}
    
const evalModel = (modelParams, data) => {
    const BASE_PATCH = 7 * 7;
    const PATCH_FEATURES = 14;
    const PATCH_FEATURES_DEEP = 16;
    const NUM_CLASSES = 13;

    // data, modelParams, numOutputs, numInputs, x0, y0, span, stride, weightOffset, biasOffset
    x11 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 0, 0, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x12 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 0, 7, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x13 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 0, 14, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x14 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 0, 21, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);

    x21 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 7, 0, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x22 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 7, 7, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x23 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 7, 14, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x24 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 7, 21, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);

    x31 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 14, 0, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x32 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 14, 7, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x33 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 14, 14, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x34 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 14, 21, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);

    x41 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 21, 0, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x42 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 21, 7, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x43 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 21, 14, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);
    x44 = linearReluLayer(data, modelParams, PATCH_FEATURES, BASE_PATCH, 21, 21, 7, 28, 0, BASE_PATCH * PATCH_FEATURES);

    y11 = linearReluLayer(x11.concat(x12, x21, x22), modelParams, PATCH_FEATURES_DEEP, 4 * PATCH_FEATURES,
        0, 0, 1000, 0, BASE_PATCH * PATCH_FEATURES + PATCH_FEATURES, 4 * PATCH_FEATURES * PATCH_FEATURES_DEEP);
    y12 = linearReluLayer(x13.concat(x14, x23, x24), modelParams, PATCH_FEATURES_DEEP, 4 * PATCH_FEATURES,
        0, 0, 1000, 0, BASE_PATCH * PATCH_FEATURES + PATCH_FEATURES, 4 * PATCH_FEATURES * PATCH_FEATURES_DEEP);
    y21 = linearReluLayer(x31.concat(x32, x41, x42), modelParams, PATCH_FEATURES_DEEP, 4 * PATCH_FEATURES,
        0, 0, 1000, 0, BASE_PATCH * PATCH_FEATURES + PATCH_FEATURES, 4 * PATCH_FEATURES * PATCH_FEATURES_DEEP);
    y22 = linearReluLayer(x33.concat(x34, x43, x44), modelParams, PATCH_FEATURES_DEEP, 4 * PATCH_FEATURES,
        0, 0, 1000, 0, BASE_PATCH * PATCH_FEATURES + PATCH_FEATURES, 4 * PATCH_FEATURES * PATCH_FEATURES_DEEP);

    z = linearReluLayer(y11.concat(y12, y21, y22), modelParams, NUM_CLASSES, 4 * PATCH_FEATURES_DEEP,
        0, 0, 1000, 0, BASE_PATCH * PATCH_FEATURES + PATCH_FEATURES + 4 * PATCH_FEATURES * PATCH_FEATURES_DEEP + PATCH_FEATURES_DEEP, 4 * PATCH_FEATURES_DEEP * NUM_CLASSES);

    console.log(z);
}

const encodedWeights = atob('eYaHmIiJiLmKiajMm4nK7Yumy6xpq7p5hnap/nl4yI93htuHd8p9d5eriJepeIiIiXiImoeJmbmJmMp8mavch6nKfqjbrGa4zaqquap3h5mJiIiIh5iIqZmYiJiYZ5aKd2irmqqemJnaiZi6jXinmGd2mVd4mFdWhXliM7erZ4a7ipm4q5mau6mImWibmWjUqolmeIh3iIiIl5iIh3mHiYiIiIeHiXmId4h3t3hmh5xWdshqRFacVma0mpqIu6ycyd2ryt2+msrtm4ndrpjI3YlnyZt2hplYdnl5ZpeXyquIupyKiKqrmLm7bHfK3HV3u1tVyKyYipl5mIiIiYl4tphoVqt4aLWbZ1bdeleUaHeomId3eYhodod4eIiZmpiYqquduKvrrIiI15qpms2Jusmrqqu7q5mpu5mImnlWZmWp/HeFp3x2dsmHhoiJeXhniJhWlolWVqh4rYeIjvh4lompamqZeIhXqYm4d1eFdNlIjGiYlqtZiGvGuZiaiZiJuFWCaYg3aaZpeot3updqmJqKaKaHh6mny5iZismFd5lYdWm2aId5l3iJl4VnWHmFmJSmdpiIdXiluYmrqImZuYeGiWhoaZenmnuJlpaXl5qKWLmGiHeWuJlWepiXeItIh2aniZp5mIiIisqLyLimpouYeMd4doiJiKeoiGhqp3iYaneJaHh3iIeXmIp4qIurWMeYmHeEiJlqWqiWiYqJhaeWl3t4iKiFiIyMpNeplmypippXqIeXZ5h4h3p3WHaHSVibdYdpl3WHaXlZmnqWqKmnapp5qXmamHp5iHfJhpd5iIi4aIhouHuJiJiNeGqZiHlpm3d6iWiIyYeYmWh1m3hcTJqWiXmIp4inKnZ0yEiaaKRYemiWVrZ4hne4eJmoZ3aXiFSKtqqaunmpiqmImZl4ioh5aGlkqIaWSIh6eImmpneZp6p4ilqqm4mqiY16iyp3hZeJiUh5eImZd4l4l4l6WJd3iXhoeJiKeWiHh4d4hpmluIqpeJd3yMiMmpjJmKp3dXiXZ4mXpYd6d3WHtYiGiIh5epp7l8epeoy5rJ2JiHjKlqqIn6mJiZqJiZnIiKqZmIiIp5iHmZl6irmJmZmXmJiZyld2Z6ZoZmqId2aZh5NqZ5qpiJmEmamZeZWWeKaJeFh4aYjIqbeMp4eFuZy2eMjKaaqHiYh4lZpXmJmXiId5iHemh6mUmoulmZaHmbebx5qZaIU1eXqFeImZaYg5llaJeYtWZZaZhWqYpGh4Z4ZaiJmJh4iHWZWqaJiJl4eWiYWCmauYSlWVqDmLiZValpSIg4eYqpe5mZZphIiJqKt5hoiVh4mWqVqleXaFmqiauIeYZImZmLZ7dqdnhIipiYmZi0amqZp3loeJi3mnl5hop2iIlzZ5eIhHmplpeVmJdoi5h5RYloiVSJmYWZV0mUl0mXmYiZimlWRomEmZiJtpl2ineXh2mZuHmYpmSZeKiFiYdpqImVd7loN6iZmZVrmXaZuXiWlnloipmHpmd5lWeGa2WYmTmmyYeJi3map4yXmrtJd5hpmFqFmHhJdYqWhlqGd6qZqGdpqKKWZniIhIh2p4lkZaSHumeXtYhFuIaJmWaaiHmUemiFiZaZmHlWmYc5Z5iZe5mQg=');
const fpWeights = [];
for (let i = 0; i < 0 + 1*encodedWeights.length; i++) {
    const a = encodedWeights.charCodeAt(i);
    fpWeights.push(((a & 0xf) - 8) * 2.2 / 16, (((a >> 4) & 0xf) - 8) * 2.2 / 16);
}

const data = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.007843137718737125, 0.5686274766921997, 0.21176470816135406, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.03529411926865578, 0.8352941274642944, 0.8117647171020508, 0.07058823853731155, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.007843137718737125, 0.0941176488995552, 0.003921568859368563, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.14509804546833038, 0.9333333373069763, 0.7882353067398071, 0.09803921729326248, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0117647061124444, 0.5490196347236633, 0.9764705896377563, 0.8588235378265381, 0.4941176474094391, 0.003921568859368563, 0.0, 0.0, 0.0, 0.0, 0.0, 0.47058823704719543, 1.0, 0.7764706015586853, 0.0313725508749485, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.49803921580314636, 0.9607843160629272, 0.3921568691730499, 0.8823529481887817, 0.6784313917160034, 0.003921568859368563, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0313725508749485, 0.8313725590705872, 1.0, 0.6392157077789307, 0.01568627543747425, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.4274509847164154, 0.9686274528503418, 0.3333333432674408, 0.250980406999588, 0.9647058844566345, 0.20392157137393951, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.32549020648002625, 1.0, 0.9921568632125854, 0.501960813999176, 0.003921568859368563, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.16078431904315948, 0.9450980424880981, 0.41960784792900085, 0.007843137718737125, 0.7176470756530762, 0.6941176652908325, 0.003921568859368563, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.03529411926865578, 0.843137264251709, 0.8392156958580017, 0.9607843160629272, 0.46666666865348816, 0.003921568859368563, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0117647061124444, 0.7254902124404907, 0.7568627595901489, 0.007843137718737125, 0.364705890417099, 0.9764705896377563, 0.2078431397676468, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.4313725531101227, 0.9098039269447327, 0.4627451002597809, 0.9647058844566345, 0.4274509847164154, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.003921568859368563, 0.4941176474094391, 0.9411764740943909, 0.18431372940540314, 0.364705890417099, 0.95686274766922, 0.4627451002597809, 0.003921568859368563, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0313725508749485, 0.8313725590705872, 0.658823549747467, 0.41960784792900085, 0.9529411792755127, 0.1764705926179886, 0.0, 0.0, 0.0, 0.0, 0.0, 0.3843137323856354, 0.9725490212440491, 0.33725491166114807, 0.34117648005485535, 0.9686274528503418, 0.47843137383461, 0.003921568859368563, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.23137255012989044, 0.9607843160629272, 0.3450980484485626, 0.7254902124404907, 0.7450980544090271, 0.01568627543747425, 0.0, 0.0, 0.003921568859368563, 0.40784314274787903, 0.9607843160629272, 0.4431372582912445, 0.2823529541492462, 0.9607843160629272, 0.46666666865348816, 0.003921568859368563, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.545098066329956, 0.8901960849761963, 0.2549019753932953, 0.95686274766922, 0.4117647111415863, 0.0, 0.0, 0.4470588266849518, 0.9725490212440491, 0.4274509847164154, 0.01568627543747425, 0.800000011920929, 0.6352941393852234, 0.003921568859368563, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.03921568766236305, 0.8392156958580017, 0.6039215922355652, 0.4117647111415863, 0.9686274528503418, 0.364705890417099, 0.4431372582912445, 0.9647058844566345, 0.364705890417099, 0.0, 0.34117648005485535, 0.9490196108818054, 0.1411764770746231, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.3137255012989044, 0.95686274766922, 0.18039216101169586, 0.48235294222831726, 0.9647058844566345, 0.9686274528503418, 0.40392157435417175, 0.0, 0.04313725605607033, 0.8235294222831726, 0.5803921818733215, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.007843137718737125, 0.7490196228027344, 0.6784313917160034, 0.0117647061124444, 0.4117647111415863, 0.3607843220233917, 0.0, 0.0, 0.5490196347236633, 0.9019607901573181, 0.09803921729326248, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.23529411852359772, 0.9764705896377563, 0.23137255012989044, 0.0, 0.0, 0.0, 0.2705882489681244, 0.9607843160629272, 0.32156863808631897, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.007843137718737125, 0.6980392336845398, 0.6549019813537598, 0.0, 0.0, 0.07450980693101883, 0.8745098114013672, 0.6000000238418579, 0.003921568859368563, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.41960784792900085, 0.8627451062202454, 0.01568627543747425, 0.1568627506494522, 0.800000011920929, 0.8235294222831726, 0.05882352963089943, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.21960784494876862, 0.9607843160629272, 0.41960784792900085, 0.9215686321258545, 0.7450980544090271, 0.10588235408067703, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.04313725605607033, 0.95686274766922, 0.9843137264251709, 0.5215686559677124, 0.0235294122248888, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.772549033164978, 0.5647059082984924, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.08235294371843338, 0.03921568766236305, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];

evalModel(fpWeights, data);