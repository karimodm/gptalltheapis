class MathProcessor {
  /**
   * Calculates the factorial of a number.
   * @param {number} n - The integer to calculate the factorial of.
   * @returns {number} The factorial of the given number.
   */
  factorial(n) {
    if (n < 0) {
      throw new Error('Factorial is not defined for negative numbers.');
    }

    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }

    return result;
  }

  /**
   * Determines if a number is prime.
   * @param {number} n - The integer to check for primality.
   * @returns {boolean} Whether the number is prime.
   */
  isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;

    if (n % 2 === 0 || n % 3 === 0) return false;

    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }

    return true;
  }

  /**
   * Adds an array of numbers with an optional multiplier for the sum.
   * @param {number[]} numbers - The array of numbers to sum.
   * @param {number} [multiplier=1] - An optional multiplier to apply to the sum.
   * @returns {number} The sum of the numbers, optionally multiplied by the multiplier.
   */
  sum(numbers, multiplier = 1) {
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    return sum * multiplier;
  }

  /**
   * Generates a range of numbers between two boundaries.
   * @param {number} start - The start of the range.
   * @param {number} end - The end of the range.
   * @param {number} [step=1] - The optional step between each number in the range.
   * @returns {number[]} An array representing the range from start to end.
   */
  range(start, end, step = 1) {
    if (step <= 0) {
      throw new Error('Step must be greater than zero.');
    }

    const rangeArray = [];
    for (let i = start; i <= end; i += step) {
      rangeArray.push(i);
    }

    return rangeArray;
  }
}

module.exports = MathProcessor;
