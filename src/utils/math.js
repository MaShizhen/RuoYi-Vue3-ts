import NP from 'number-precision';

/**
 * 加法
 * @param {*} a
 * @param {*} b
 */
export function plus(a, b) {
    return NP.plus(Number(a), Number(b));
}

/**
 * 减法
 * @param {*} a
 * @param {*} b
 */
export function minus(a, b) {
    return NP.minus(Number(a), Number(b));
}

/**
 * 除法
 * @param {*} a
 * @param {*} b
 */
export function divide(...nums) {
    return NP.divide(...nums.map(i => Number(i)));
}

/**
 * 乘法
 * @param {*} a
 * @param {*} b
 */
export function times(...nums) {
    return NP.times(...nums.map(i => Number(i)));
}

/**
 * 精确小数位
 * @param {*} a 	需要精确的小数
 * @param {*} num 	精确的位数
 */
export function round(a, num) {
    return NP.round(Number(a), Number(num));
}

