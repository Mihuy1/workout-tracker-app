const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  getCompletedExercises,
  InvalidCompletedSetError,
  isRepsInput,
  isValidCompletedSet,
  isWeightInput,
  parseSetValues,
} = require("../utils/workoutSetValidation.ts");

test("weight entry accepts either decimal separator and unfinished input", () => {
  for (const value of ["", "0", "82.5", "82,5", ".", ",", "82.", ".5"]) {
    assert.equal(isWeightInput(value), true, value);
  }
  for (const value of [" ", "82kg", "-5", "1,000.5", "1.2.3", "1e3"]) {
    assert.equal(isWeightInput(value), false, value);
  }
});

test("rep entry rejects fractional reps instead of turning 2.5 into 25", () => {
  for (const value of ["", "0", "12"]) {
    assert.equal(isRepsInput(value), true, value);
  }
  for (const value of ["2.5", "2,5", "-1", " ", "12 reps"]) {
    assert.equal(isRepsInput(value), false, value);
  }
});

test("completion accepts decimal weights, zero weight, and positive whole reps", () => {
  for (const weight of ["82.5", "82,5", " 82,5 "]) {
    assert.deepEqual(parseSetValues(weight, "10"), { weight: 82.5, reps: 10 });
  }
  assert.deepEqual(parseSetValues("0", "1"), { weight: 0, reps: 1 });
  assert.deepEqual(parseSetValues(",5", "08"), { weight: 0.5, reps: 8 });
});

test("completion rejects missing, malformed, nonfinite, and invalid rep values", () => {
  for (const weight of ["", " ", ".", ",", "text", "12kg", "-1", "1,2.3", "Infinity", "1e2", "0x10", "9".repeat(400)]) {
    assert.equal(parseSetValues(weight, "10"), null, weight);
  }
  for (const reps of ["", " ", "0", "-1", "1.5", "1,5", "10 reps", "Infinity", "1e2", "9007199254740993"]) {
    assert.equal(parseSetValues("10", reps), null, reps);
  }
});

const makeSet = (weight, reps, complete = true) => ({
  id: 1, weight, reps, complete, achievements: [],
});
const makeExercise = (sets) => ({
  exerciseId: "squat", name: "Squat", mechanic: null, restTime: 120, sets,
});

test("saving normalizes comma decimals and omits only incomplete sets", () => {
  const exercise = makeExercise([makeSet("82,5", "08"), makeSet("", "", false)]);
  const saved = getCompletedExercises([exercise, makeExercise([])]);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].sets.length, 1);
  assert.equal(saved[0].sets[0].weight, "82.5");
  assert.equal(Number(saved[0].sets[0].weight), 82.5);
  assert.equal(saved[0].sets[0].reps, "8");
  assert.equal(isValidCompletedSet(saved[0].sets[0]), true);
  assert.equal(exercise.sets[0].weight, "82,5");
  assert.equal(isValidCompletedSet(makeSet("10", "10", false)), false);
});

test("an invalid completed set blocks saving even alongside a valid set", () => {
  for (const invalid of [makeSet(" ", "10"), makeSet("text", "10"), makeSet("10", "2.5")]) {
    assert.throws(
      () => getCompletedExercises([makeExercise([makeSet("10", "10"), invalid])]),
      (error) => error instanceof InvalidCompletedSetError && /set 2 of Squat/.test(error.message),
    );
  }
});

test("small decimal weights remain valid through repeated save validation", () => {
  const saved = getCompletedExercises([makeExercise([makeSet("0,0000001", "10")])]);
  assert.equal(isValidCompletedSet(saved[0].sets[0]), true);
  assert.deepEqual(getCompletedExercises(saved), saved);
});
