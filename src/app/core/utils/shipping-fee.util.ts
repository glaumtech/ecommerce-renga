export const BASE_SHIPPING_FEE = 60;
export const OUT_OF_REGION_SHIPPING_FEE = 120;

const LOCAL_PREFIX_MIN = 60;
const LOCAL_PREFIX_MAX = 64;
const PIN_DIGITS = /^\d{6}$/;

const PUDUCHERRY_EXACT_PINS = new Set([605105, 605106, 605110, 605501]);
const PUDUCHERRY_RANGES: ReadonlyArray<readonly [number, number]> = [
  [605001, 605014],
  [609602, 609609],
];

export function calculateShippingFee(zipCode: string | null | undefined): number {
  const pin = (zipCode ?? '').replace(/\D/g, '');
  if (!PIN_DIGITS.test(pin)) {
    return BASE_SHIPPING_FEE;
  }

  const prefix = Number(pin.slice(0, 2));
  const inLocalCircle = prefix >= LOCAL_PREFIX_MIN && prefix <= LOCAL_PREFIX_MAX;
  let fee = inLocalCircle ? BASE_SHIPPING_FEE : OUT_OF_REGION_SHIPPING_FEE;

  if (isPuducherryPin(Number(pin))) {
    fee *= 2;
  }

  return fee;
}

function isPuducherryPin(pin: number): boolean {
  if (PUDUCHERRY_EXACT_PINS.has(pin)) {
    return true;
  }
  return PUDUCHERRY_RANGES.some(([from, to]) => pin >= from && pin <= to);
}
