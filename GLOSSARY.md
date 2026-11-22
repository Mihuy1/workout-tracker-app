# Glossary

The words this project uses, what each one means here, and where it lives in the code.
When the UI, the code and the database call the same thing by different names, the entry lists all of them.

<!--
Template for a new entry:

### Term

One or two plain sentences: what it is in this app. Say what it is not, if people mix it up with something else.

- **In code:** type, constant or function names
- **In the database:** table or column names
- **See also:** related terms
-->

## Training terms

### Set

One attempt at an exercise: a weight lifted for a number of reps. An exercise in a workout or routine has one or more sets, numbered in order.

- **In code:** `SetRow` in `types/workout.ts`. Weight and reps are stored as strings while the user is typing.
- **In the database:** `workout_sets` (logged sets), `routine_sets` (planned sets in a routine)
- **See also:** Set type, Personal record
