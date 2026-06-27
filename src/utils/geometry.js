// Pembatasan Join Subset berdasarkan Persamaan (2) di Jurnal
export const JOINTS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

/**
 * Menghitung sudut dalam θ berbasis Trigonometri Vektor (Persamaan 3, 4, 5 Jurnal)
 */
export const calculateAngle = (pointA, pointB, pointC) => {
  if (!pointA || !pointB || !pointC) return 0;

  // Persamaan (3): Vektor BA = (Xa - Xb, Ya - Yb)
  const vectorBA = {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y,
  };

  // Persamaan (4): Vektor BC = (Xc - Xb, Yc - Yb)
  const vectorBC = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y,
  };

  // Operasi Dot Product: BA . BC
  const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;

  // Menghitung Magnitudo ||BA|| dan ||BC||
  const magnitudeBA = Math.sqrt(vectorBA.x ** 2 + vectorBA.y ** 2);
  const magnitudeBC = Math.sqrt(vectorBC.x ** 2 + vectorBC.y ** 2);

  if (magnitudeBA === 0 || magnitudeBC === 0) return 0;

  // Persamaan (5): θ = arccos( (BA . BC) / (||BA|| ||BC||) )
  const cosineAngle = dotProduct / (magnitudeBA * magnitudeBC);
  const safeCosine = Math.max(-1, Math.min(1, cosineAngle)); // Menghindari batasan nilai floating eror

  const radians = Math.acos(safeCosine);
  const degrees = radians * (180 / Math.PI); // Konversi ke satuan derajat

  return Math.round(degrees);
};
