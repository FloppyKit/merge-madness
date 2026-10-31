import * as C from '../config';

export type MathOp = '+' | '-' | '×' | '÷';
export interface MathQuestion { op: MathOp; a: number; b: number; text: string; answer: number; choices: number[]; correctIndex: number; }

const int = (r: () => number, min: number, max: number) => min + Math.floor(r() * (max - min + 1));
export const LETTERS = 'ABCDEFGH';

export function makeQuestion(rand: () => number = Math.random, nChoices = C.MATH_CHOICES): MathQuestion {
  const ops: MathOp[] = ['+', '-', '×', '÷'];
  const op = ops[Math.floor(rand() * 4)];
  let a: number, b: number, answer: number;
  if (op === '+') { a = int(rand, C.MATH_ADD.min, C.MATH_ADD.max); b = int(rand, C.MATH_ADD.min, C.MATH_ADD.max); answer = a + b; }
  else if (op === '-') { a = int(rand, C.MATH_SUB.min, C.MATH_SUB.max); b = int(rand, C.MATH_SUB.min, C.MATH_SUB.max); if (b > a) [a, b] = [b, a]; answer = a - b; }
  else if (op === '×') { a = int(rand, C.MATH_MUL.min, C.MATH_MUL.max); b = int(rand, C.MATH_MUL.min, C.MATH_MUL.max); answer = a * b; }
  else { b = int(rand, C.MATH_DIV.min, C.MATH_DIV.max); answer = int(rand, C.MATH_DIV.min, C.MATH_DIV.max); a = b * answer; }
  // Plausible wrong answers: near misses, off-by-ten, neighbouring times-table.
  const step = op === '×' ? a : op === '÷' ? 1 : 10;
  const pool = [answer + 1, answer - 1, answer + 2, answer - 2, answer + step, answer - step, answer + 10, answer - 10, answer + 3, answer - 3];
  const wrong: number[] = [];
  for (const w of pool.sort(() => rand() - 0.5)) if (w >= 0 && w !== answer && !wrong.includes(w) && wrong.length < nChoices - 1) wrong.push(w);
  for (let k = 4; wrong.length < nChoices - 1; k++) if (!wrong.includes(answer + k)) wrong.push(answer + k);
  const choices = [answer, ...wrong];
  for (let i = choices.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [choices[i], choices[j]] = [choices[j], choices[i]]; }
  return { op, a, b, text: `${a} ${op} ${b} = ?`, answer, choices, correctIndex: choices.indexOf(answer) };
}

// Returns coins to add (MATH_REWARD if right, 0 if wrong).
export const checkAnswer = (q: MathQuestion, choice: number) => (choice === q.answer ? C.MATH_REWARD : 0);
