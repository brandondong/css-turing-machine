# Turing machines implemented in CSS

## Demo

https://brandondong.github.io/css-turing-machine/

### Running locally

Install dependencies:
```
npm install
```

Run app:
```
npm run dev
```

### Inspiration

* https://stackoverflow.com/questions/2497146/
* http://eli.fox-epste.in/rule110-full.html

## How does it work?

### Maintaining program state

At any point during a Turing machine's execution, it must track the list of tape symbols, the head position, and the current state it's in. In order to emulate one, we need to store this information somewhere in the DOM. HTML inputs, specifically checkbox and radio buttons, fit this usecase nicely:
1. They can encode information through being checked or unchecked.
1. This checked/unchecked state is accessible in CSS through the [:checked](https://developer.mozilla.org/en-US/docs/Web/CSS/:checked) pseudo-class selector.

### Updating program state

Executing a program requires the ability to write to memory or in our case, to toggle inputs. This cannot be done automatically through CSS; a user must perform a mouse click for each individual toggle. In order to ensure that the user does not perform any computation, the program should be executed in a way such that all mouse clicks are done on a stationary spot.

Besides clicking directly on an input, toggling can also be achieved by clicking on its associated [label](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label):
```html
<input id="option-1" type="checkbox">
<label for="option-1">Option 1</label> <!-- Clicking on this label will toggle the checkbox. -->
```

We will create a label for each input and stack them all directly over another with absolute positioning such that only one is ever visible at a time.

The plan of attack is as follows:
1. Given the current checked and unchecked inputs, we should compute the next steps required such as writing to the tape, moving the head, and transitioning to the next state. Each of these steps is equivalent to toggling specific inputs.
2. For inputs that need to be toggled, their associated labels should be made visible. Otherwise, they should be hidden.
3. Then, when the user clicks on the stack of labels, a correct action will be performed.
4. This click will update the toggled state of one of the inputs. With our updated set of checked and unchecked inputs, the entire process will repeat.

### Controlling the visibility of labels

CSS allows the conditional application of styles through [selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors). To implement our Turing machine logic, we will need to leverage two: the [next-sibling combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/Next-sibling_combinator) (`+`), and the [subsequent-sibling combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/Subsequent-sibling_combinator) (`~`).

Say we want to make a label visible only if the input _immediately_ before it is checked:
```html
<input type="checkbox">
<label>Example</label>
```

This is possible using the aforementioned [next-sibling combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/Next-sibling_combinator) (`+`):
```css
input:checked + label {
  visibility: visible;
}
```

The next-sibling combinator composes with itself. Suppose we now have two checkboxes followed by a label and we want to show the label only if both inputs are checked:
```html
<input type="checkbox">
<input type="checkbox">
<label>Example</label>
```

This can be accomplished with:
```css
input:checked + input:checked + label {
  visibility: visible;
}
```

If we think of the two input checked states as booleans, the specified selector behaves like a logical AND. To perform a logical OR instead (show the label only if either input is checked), two separate selectors can be used:
```css
input:checked + input + label {
  visibility: visible;
}

input + input:checked + label {
  visibility: visible;
}
```

In our actual Turing machine implementation, the number of tape cells can be freely chosen by the user and thus can be made arbitrarily large (we are trying to emulate a theoretical Turing machine with an infinitely long tape). It's very important that the number of selectors does not scale with the tape size chosen. The generated CSS should remain _100% identical_ regardless of the number of tape cells.

This can be done by strategically positioning inputs and labels in the DOM:
```html
<!-- Task: Show the label to toggle a tape cell if the cell value is 1 OR the tape head is at that cell. -->

<input id="tape-cell-1" type="checkbox"> <!-- Checked if the first tape cell has value 1, unchecked otherwise. -->
<input id="head-position-1" type="radio" name="head-position"> <!-- Checked if the tape head is at the first cell, unchecked otherwise. -->
<label for="tape-cell-1">Toggle tape cell 1</label>

<input id="tape-cell-2" type="checkbox">
<input id="head-position-2" type="radio" name="head-position">
<label for="tape-cell-2">Toggle tape cell 2</label>

<input id="tape-cell-3" type="checkbox">
<input id="head-position-3" type="radio" name="head-position">
<label for="tape-cell-3">Toggle tape cell 3</label>

<!-- And so on down the tape... -->
```

By laying out the elements in this way, our logical OR selectors fulfill the task above without any further modification:
```css
input:checked + input + label {
  visibility: visible;
}

input + input:checked + label {
  visibility: visible;
}
```

In addition to the arbitrarily large set of tape cells, we have to track which of the finite set of states the Turing machine is in.
```html
<!-- Example: Turing machine with two possible states. -->
<input id="state-1" type="radio" name="state">
<input id="state-2" type="radio" name="state">

<!-- Task: Show the label to toggle a tape cell if the cell value is 1 OR the tape head is at that cell. -->
<!-- Additionally, only do this if we're in state 1. -->

<input id="tape-cell-1" type="checkbox">
<input id="head-position-1" type="radio" name="head-position">
<label for="tape-cell-1">Toggle tape cell 1</label>

<input id="tape-cell-2" type="checkbox">
<input id="head-position-2" type="radio" name="head-position">
<label for="tape-cell-2">Toggle tape cell 2</label>

<input id="tape-cell-3" type="checkbox">
<input id="head-position-3" type="radio" name="head-position">
<label for="tape-cell-3">Toggle tape cell 3</label>

<!-- And so on down the tape... -->
```

The next-sibling combinator is insufficient for the task above because each label is a different number of elements away from `#state-1`. This is why we need the [subsequent-sibling combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/Subsequent-sibling_combinator) (`~`).

The following CSS will accomplish the task:
```css
input#state-1:checked ~ input:checked + input + label {
  visibility: visible;
}

input#state-1:checked ~ input + input:checked + label {
  visibility: visible;
}
```

With these tools, we now have everything needed to implement a Turing machine to CSS compiler.

### Computing a single iteration

To simplify, let us first consider what would have to be done to compute a single step of a Turing machine. That is, given a list of tape symbols, the head position, and the current Turing machine state, we compute the aforementioned properties after an iteration is passed. Imagine the DOM is organized as follows:
```html
<!-- Example: Turing machine with two possible states. -->
<!-- Current state: -->
<input id="state-1" type="radio" name="state">
<input id="state-2" type="radio" name="state">
<!-- Destination state: -->
<input id="state-1-next" type="radio" name="state-next">
<input id="state-2-next" type="radio" name="state-next">

<!-- Current first tape cell: -->
<input id="head-position-1" type="radio" name="head-position">
<input id="tape-cell-1" type="checkbox">
<!-- Destination first tape cell: -->
<input id="head-position-1-next" type="radio" name="head-position-next">
<input id="tape-cell-1-next" type="checkbox">
<!-- Labels to update the destination tape cell: -->
<label></label>
<label for="tape-cell-1-next">Toggle tape cell 1 next</label>

<!-- Current second tape cell: -->
<input id="head-position-2" type="radio" name="head-position">
<input id="tape-cell-2" type="checkbox">
<!-- Destination second tape cell: -->
<input id="head-position-2-next" type="radio" name="head-position-next">
<input id="tape-cell-2-next" type="checkbox">
<!-- Labels to update the destination tape cell: -->
<label for="head-position-1-next">Toggle head position 1 next</label> <!-- head-position-X-next labels are always offset one tape cell down to be able to read the checked state of head-position-X+1/tape-cell-X+1. -->
<label for="tape-cell-2-next">Toggle tape cell 2 next</label>

<!-- And so on down the tape... -->

<!-- Labels to update the destination state: -->
<label for="state-1-next">Toggle state 1 next</label>
<label for="state-2-next">Toggle state 2 next</label>
```

Notice that we have to store the destination state separately. We cannot update our data in place as we may overwrite old inputs that are still needed partway through into the label visibility computation.

### Computing the updated tape

In a traditional programmming language, code for computing a single tape cell might look something like:
```rust
fn next_tape_cell_value(
    tape_cell_idx: usize,
    current_tape: &[bool],
    current_head_pos: usize,
    current_state: usize,
) -> bool {
    if tape_cell_idx != current_head_pos {
        // No way we could change its value this iteration.
        current_tape[tape_cell_idx]
    } else {
        let read_value = current_tape[current_head_pos];
        let write_value = STATE_TABLE.get_write_value(current_state, read_value);
        write_value
    }
}
```

Our goal is to intelligently control the visibility of labels so that the correct inputs can be toggled. The code may be better expressed as:
```rust
fn show_tape_cell_toggle(
    tape_cell_idx: usize,
    current_tape: &[bool],
    dest_tape: &[bool],
    current_head_pos: usize,
    current_state: usize,
) -> bool {
    if tape_cell_idx != current_head_pos {
        // No way we could change its value this iteration.
        current_tape[tape_cell_idx] != dest_tape[tape_cell_idx]
    } else {
        let read_value = current_tape[current_head_pos];
        let write_value = STATE_TABLE.get_write_value(current_state, read_value);
        write_value != dest_tape[tape_cell_idx]
    }
}
```

Performing some mechanical code transformations:
```rust
fn show_tape_cell_toggle(
    tape_cell_idx: usize,
    current_tape: &[bool],
    dest_tape: &[bool],
    current_head_pos: usize,
    current_state: usize,
) -> bool {
    let read_value = current_tape[current_head_pos];
    let write_value = STATE_TABLE.get_write_value(current_state, read_value);

    (tape_cell_idx != current_head_pos && current_tape[tape_cell_idx] && !dest_tape[tape_cell_idx]) ||
    (tape_cell_idx != current_head_pos && !current_tape[tape_cell_idx] && dest_tape[tape_cell_idx]) ||
    (tape_cell_idx == current_head_pos && write_value && !dest_tape[tape_cell_idx]) ||
    (tape_cell_idx == current_head_pos && !write_value && dest_tape[tape_cell_idx])
}
```

The contents of `STATE_TABLE` are statically known during the compilation of the user's specified Turing machine down to CSS. The number of states is also finite and so can be manually enumerated:
```rust
fn show_tape_cell_toggle(
    tape_cell_idx: usize,
    current_tape: &[bool],
    dest_tape: &[bool],
    current_head_pos: usize,
    current_state: usize,
) -> bool {
    (tape_cell_idx != current_head_pos && current_tape[tape_cell_idx] && !dest_tape[tape_cell_idx]) ||
    (tape_cell_idx != current_head_pos && !current_tape[tape_cell_idx] && dest_tape[tape_cell_idx]) ||
    // STATE_TABLE.get_write_value(const, const) is a known constant value during the compilation process.
    (tape_cell_idx == current_head_pos && current_state == 1 && current_tape[current_head_pos] && STATE_TABLE.get_write_value(1, true) && !dest_tape[tape_cell_idx]) ||
    (tape_cell_idx == current_head_pos && current_state == 1 && current_tape[current_head_pos] && !STATE_TABLE.get_write_value(1, true) && dest_tape[tape_cell_idx]) ||
    (tape_cell_idx == current_head_pos && current_state == 1 && !current_tape[current_head_pos] && STATE_TABLE.get_write_value(1, false) && !dest_tape[tape_cell_idx]) ||
    (tape_cell_idx == current_head_pos && current_state == 1 && !current_tape[current_head_pos] && !STATE_TABLE.get_write_value(1, false) && dest_tape[tape_cell_idx])
    // And so on for each possible value of current_state (finite number of states)...
}
```

Written this way, each individual line of the function can be translated into a single CSS selector. The selectors in tandem form the logical OR. With the DOM layout above, the first line can be converted to:
```css
input:not(:checked) + input:checked + input + input:not(:checked) + label + label {
  visibility: visible;
}
```

### Computing the updated head position

This will largely go through the same derivation process as computing the updated tape cells. One notable difference is that these labels are for radio buttons and so the label should only be shown if the expected value is checked but the destination value is currently unchecked.
```rust
fn show_head_pos_radio_label(
    head_pos_idx: usize,
    current_tape: &[bool],
    current_head_pos: usize,
    dest_head_pos: &[bool],
    current_state: usize,
) -> bool {
    let read_value = current_tape[current_head_pos];
    let tape_move_dir = STATE_TABLE.get_tape_mov_dir(current_state, read_value);
    let updated_head_pos = match tape_move_dir {
        TapeMoveDir::Left => current_head_pos - 1,
        TapeMoveDir::Right => current_head_pos + 1,
    };

    let expect_selected = head_pos_idx == updated_head_pos;
    expect_selected && !dest_head_pos[head_pos_idx]
}
```

Going through the same mechanical steps:
```rust
fn show_head_pos_radio_label(
    head_pos_idx: usize,
    current_tape: &[bool],
    current_head_pos: usize,
    dest_head_pos: &[bool],
    current_state: usize,
) -> bool {
    // STATE_TABLE.get_tape_mov_dir(const, const) is a known constant value during the compilation process.
    (current_state == 1 && current_tape[current_head_pos] && STATE_TABLE.get_tape_mov_dir(1, true) == TapeMoveDir::Left && head_pos_idx == current_head_pos - 1  && !dest_head_pos[head_pos_idx]) ||
    (current_state == 1 && current_tape[current_head_pos] && STATE_TABLE.get_tape_mov_dir(1, true) == TapeMoveDir::Right && head_pos_idx == current_head_pos + 1 && !dest_head_pos[head_pos_idx]) ||
    (current_state == 1 && !current_tape[current_head_pos] && STATE_TABLE.get_tape_mov_dir(1, false) == TapeMoveDir::Left && head_pos_idx == current_head_pos - 1 && !dest_head_pos[head_pos_idx]) ||
    (current_state == 1 && !current_tape[current_head_pos] && STATE_TABLE.get_tape_mov_dir(1, false) == TapeMoveDir::Right && head_pos_idx == current_head_pos + 1 && !dest_head_pos[head_pos_idx])
    // And so on for each possible value of current_state (finite number of states)...
}
```

The first line, assuming `STATE_TABLE.get_tape_mov_dir(1, true)` returns `TapeMoveDir::Left`, can be translated to:
```css
input#state-1:checked ~ input:not(:checked) + input + label + label + input:checked + input:checked + input + input + label {
  visibility: visible;
}
```

### Computing the next state

Same drill:
```rust
fn show_state_radio_label(
    state_idx: usize,
    current_tape: &[bool],
    current_head_pos: usize,
    current_state: usize,
    dest_state: &[bool]
) -> bool {
    let read_value = current_tape[current_head_pos];
    let next_state = STATE_TABLE.get_next_state(current_state, read_value);

    let expect_selected = state_idx == next_state;
    expect_selected && !dest_state[state_idx]
}
```

```rust
fn show_state_radio_label(
    state_idx: usize,
    current_tape: &[bool],
    current_head_pos: usize,
    current_state: usize,
    dest_state: &[bool]
) -> bool {
    // STATE_TABLE.get_next_state(const, const) is a known constant value during the compilation process.
    (current_state == 1 && current_tape[current_head_pos] && state_idx == STATE_TABLE.get_next_state(1, true) && !dest_state[state_idx]) ||
    (current_state == 1 && !current_tape[current_head_pos] && state_idx == STATE_TABLE.get_next_state(1, false) && !dest_state[state_idx])
    // And so on for each possible value of current_state (finite number of states)...
}
```

Assuming `state_idx == 2` and `STATE_TABLE.get_next_state(1, true) == 2`, the first line can be translated to:
```css
input#state-1:checked ~ input#state-2-next:not(:checked) ~ input[name="head-position"]:checked + input:checked ~ label[for="state-2-next"] {
  visibility: visible;
}
```

### Extending to many iterations

There can be a possibly infinite number of Turing machine iterations so we cannot just create more destination inputs to scale up. The key is that we only ever need to keep track of the current inputs and the destination inputs being written to. Once an iteration is done, the pointers to the source and destination buffers can be swapped (i.e. `#tape-cell-1-next` is treated as the current value of the first tape cell while `#tape-cell-1` is the destination input). The CSS rules we just derived would have to be copied and altered slightly (due to differing relative positions of inputs and labels) for this second scenario.

To record which scenario we are in and act accordingly, one more boolean checkbox input will be added. Its associated label would be placed under all other labels. In this way, only after all the necessary updates are performed for an iteration would the user click then switch to the next round.

This bottommost iteration toggle label should be always visible unless the Turing machine enters the halting state. Once the user finishes updating the inputs for the current iteration and the resulting state happens to be the halting state, there will be no more visible labels preventing any further user interaction.

## Practical applications
