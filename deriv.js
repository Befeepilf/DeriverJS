class Function {
  constructor(operator, operation, inputs) {
    this.operator = operator;
    this.operation = operation;

    this.inputs = this.reduce(inputs);

    if(this.inputs.length === 1) {
      this.value = this.inputs[0];
    }
  }

  reduce(inputs) {
    let newInputs = [];
    inputs.forEach(input => {
      if(typeof input === 'number' || typeof input.value === 'number') {
        input = typeof input === 'number' ? input : input.value;
        if(newInputs.length) {
          if(typeof newInputs[0] === 'number') {
            newInputs[0] = this.operation(newInputs[0], input);
          }
          else {
            newInputs.unshift(input);
          }
        }
        else {
          newInputs.push(input);
        }
      }
      else if(input.operator === this.operator) {
        newInputs = this.reduce(input.inputs.concat(newInputs));
      }
      else {
        newInputs.push(input);
      }
    });

    return newInputs;
  }

  toString() {
    return this.inputs.reduce((a, b) => {
      const isAFunction = typeof a === 'object' && typeof a.value !== 'number';
      const isBFunction = typeof b === 'object' && typeof b.value !== 'number';
      return this.inputs.length > 1 ? `${isAFunction ? '(' : ''}${a.toString()}${isAFunction ? ')' : ''} ${this.operator} ${isBFunction ? '(' : ''}${b.toString()}${isBFunction ? ')' : ''}` : `${this.operator}(${inputs[0]})`;
    });
  }
}

class Add extends Function {
  constructor(inputs) {
    super('+', (a, b) => a + b, inputs);
  }

  get reduced() {
    const {inputs} = this;
    const newInputs = [];

    let reduced = false;
    inputs.forEach((input, index) => {
      if(input !== null && (input.operator === '*' || typeof input === 'string')) {
        inputs.forEach((input2, index2) => {
          if(inputs[index] !== null && input2 !== null && index2 > index) {
            if(input === input2) {
              newInputs.push(mult(2, input));

              inputs[index] = null;
              inputs[index2] = null;
            }
            else if(input.operator === '*' && input2.operator === '*') {
              const [sameFactors, rest1, rest2] = Mult.findSameFactors(input.inputs.slice(), input2.inputs.slice());

              if(sameFactors.length) {
                newInputs.push(mult(new Add([rest1.length > 1 ? mult(...rest1) : rest1.length ? rest1[0] : 1, rest2.length > 1 ? mult(...rest2) : rest2.length ? rest2[0] : 1]), ...sameFactors));

                inputs[index] = null;
                inputs[index2] = null;
              }
            }
          }
        });
      }

      if(inputs[index] !== null) {
        newInputs.push(input);
      }
      else {
        reduced = true;
      }
    });

    return newInputs.reduce((a, b) => reduced ? new Add([a, b]).reduced : new Add([a, b]));
  }
}

class Mult extends Function {
  constructor(inputs) {
    super('*', (a, b) => a * b, inputs);
  }

  static findSameFactors(factors1, factors2) {
    let sameFactors = [];
    let rest1 = [];
    let rest2 = [];

    factors1.forEach((factor1, index1) => {
      if(factor1 !== null) {
        factor1 = typeof factor1.value === 'number' ? factor1.value : factor1;

        factors2.forEach((factor2, index2) => {
          if(factors1[index1] !== null && factor2 !== null) {
            factor2 = typeof factor2.value === 'number' ? factor2.value : factor2;

            if(factor1.operator === '*' || factor2.operator === '*') {
              const [sameFactors2, rest3, rest4] = Mult.findSameFactors(factor1.inputs || [factor1], factor2.inputs || [factor2]);
              sameFactors = sameFactors.concat(sameFactors2);
              rest1 = rest1.concat(rest3);
              rest2 = rest2.concat(rest4);
            }
            else if(factor1 === factor2) {
              sameFactors.push(factor1);
              factors1[index1] = null;
              factors2[index2] = null;
            }
          }
        });
      }
    });

    return [sameFactors, rest1.concat(factors1.filter(factor1 => factor1)), rest2.concat(factors2.filter(factor2 => factor2))];
  }
}

function add(...inputs) {
  return new Add(inputs).reduced;
}

function mult(...inputs) {
  return new Mult(inputs);
}


// function add(f1, f2) {
//   f1 = typeof f1 === 'number' ? {value: f1} : f1;
//   f2 = typeof f2 === 'number' ? {value: f2} : f2;
//
//   // if f1 and f2 have one identical factor combine the terms
//   if(f1.operator === '*' && f2.operator === '*') {
//     if(f1.f1 === f2.f1) {
//       return mult(add(f1.f2, f2.f2), f1.f1);
//     }
//     else if(f1.f1 === f2.f2) {
//       return mult(add(f1.f2, f2.f1), f1.f1);
//     }
//     else if(f1.f2 === f2.f1) {
//       return mult(add(f1.f1, f2.f2), f1.f2);
//     }
//     else if(f1.f2 === f2.f2) {
//       return mult(add(f1.f1, f2.f1), f1.f2);
//     }
//   }
//// console.log(f.inputs)
// console.log(f.inputs[1].inputs)
// console.log(f.inputs[1].inputs[1])
//   let value;
//   if(typeof f1.value === 'number' && typeof f2.value === 'number') {
//     value = f1.value + f2.value;
//   }
//
//   return {
//     operator: '+',
//     value,
//     f1,
//     f2,
//     toString: () => typeof value === 'number' ? value.toString() : `${typeof f1 === 'object' ? f1.toString() : f1} + ${typeof f2 === 'object' ? f2.toString() : f2}`,
//     deriv: () => {
//       if(typeof value !== 'number') {
//         const f1Deriv = typeof f1 === 'object' ? f1.deriv() : typeof f1 === 'string' && f1.includes('x') ? 1 : 0;
//         const f2Deriv = typeof f2 === 'object' ? f2.deriv() : typeof f2 === 'string' && f2.includes('x') ? 1 : 0;
//         return add(f1Deriv, f2Deriv);
//       }
//
//       return {
//         value: 0,
//         toString: () => '0',
//         deriv: () => 0
//       };
//     }
//   }
// }

// function mult(f1, f2) {
//   f1 = typeof f1 === 'number' ? {value: f1} : f1;
//   f2 = typeof f2 === 'number' ? {value: f2} : f2;
//
//   const isZero = f1.value === 0 || f2.value === 0;
//   const isF1One = f1.value === 1;
//   const isF2One = f2.value === 1;
//   const hasOne = isF1One || isF2One;
//
//   let value;
//   if((typeof f1.value === 'number' && typeof f2.value === 'number') || isZero) {
//     value = isZero ? 0 : f1.value * f2.value;
//   }
//
//   return {
//     operator: '*',
//     value,
//     f1,
//     f2,
//     toString: () => {
//       if(typeof value !== 'number') {
//         const f1String = isF1One ? '' : typeof f1 === 'object' ? (f1.value ? '' : '(') + f1.toString() + (f1.value ? '' : ')') : f1.toString();
//         const f2String = isF2One ? '' : typeof f2 === 'object' ? (f2.value ? '' : '(') + f2.toString() + (f2.value ? '' : ')') : f2.toString();
//         return f1String + (hasOne ? '' : ' * ') + f2String;
//       }
//       return value.toString();
//     },
//     deriv: () => {
//       if(typeof value !== 'number') {
//         const f1Deriv = typeof f1 === 'object' ? f1.deriv() : typeof f1 === 'string' && f1.includes('x') ? 1 : 0;
//         const f2Deriv = typeof f2 === 'object' ? f2.deriv() : typeof f2 === 'string' && f2.includes('x') ? 1 : 0;
//         return add(mult(f1, f2Deriv), mult(f2, f1Deriv));
//       }
//
//       return {
//         value: 0,
//         toString: () => '0',
//         deriv: () => 0
//       };
//     }
//   }
// }

// function pow(f1, f2) {
//   let value;
//   if((typeof f1.value === 'number' || typeof f1 === 'number') && (typeof f2.value === 'number' || typeof f2 === 'number')) {
//     value = Math.pow((typeof f1.value === 'number' ? f1.value : f1), (typeof f2.value === 'number' ? f2.value : f2));
//   }
//
//   return {
//     operator: '^',
//     value,
//     f1,
//     f2,
//     toString: () => value ? value.toString() : `${f1.toString()}^${f2.toString()}`,
//     deriv: () => mult(mult(f2, pow(f1, add(f2, -1))), f2.deriv())
//   };
// }
//
// function log(f1) {
//   let value;
//   return {
//     value,
//     f1,
//     toString: () => value ? value.toString() : `log(${f1.toString()})`,
//     deriv: () => {}
//   };
// }


const f = add(mult(2, 'x'), mult(3, add('x', 7, 'x', mult('x', 'x', 'y'))));
console.log(f.toString())
