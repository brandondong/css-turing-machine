# Turing Machine implemented in CSS

## [Demonstration](https://brandondong.github.io/css-turing-machine/)

Inspired from https://stackoverflow.com/questions/2497146/is-css-turing-complete/ and http://eli.fox-epste.in/rule110-full.html.

## How does it work?

### Maintaining program state

At any point during a Turing machine's execution, it must track the list of tape symbols, the head position, and the current state it's in. If we want to emulate one, we need to store this information somewhere in the DOM. HTML inputs, specifically checkbox and radio buttons, are a nice way of storing this data as their toggled states can be accessed easily in CSS through the [:checked](https://developer.mozilla.org/en-US/docs/Web/CSS/:checked) pseudo-class selector.

The list of binary tape symbols naturally translates into a list of checkboxes. The head position and the current Turing machine state are both values from a set of possibilites and therefore can each be represented as a single selection within a [radio button group](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio#Defining_a_radio_group).

### Stepping through the program

Executing a program requires the ability to write to memory or in our case, to toggle inputs. This cannot be done automatically through CSS; a user must perform a mouse click for each individual toggle. In order to ensure that the user does not perform any computation, the program should be executed in a way such that all mouse clicks are done on a stationary spot.

Besides clicking directly on an input, toggling can also be achieved by clicking on its associated [label](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label). We will create a label for each input and stack them all directly over another with absolute positioning such that only one is ever visible at a time.

The plan of attack will be as follows:
1. Given the current checked and unchecked inputs, we should compute the next steps required such as writing to the tape, moving the head, and transitioning to the next state. Each of these steps are equivalent to just toggling specific inputs.
2. For inputs that need to be toggled, their associated labels should be made visible. Otherwise, they should be hidden.
3. Then, when the user clicks on the stack of labels, a correct action will be performed.
4. This click will update the toggled state of one of the inputs. With our updated set of checked and unchecked inputs, the entire process will repeat.

### Controlling the visibility of labels

CSS allows the conditional application of styles through [selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors). To implement our Turing machine logic, we will heavily leverage the earlier mentioned [:checked](https://developer.mozilla.org/en-US/docs/Web/CSS/:checked) pseudo-class selector, the [:not()](https://developer.mozilla.org/en-US/docs/Web/CSS/:not) pseudo-class, the [adjacent sibling combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/Adjacent_sibling_combinator), and the [general sibling combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/General_sibling_combinator).

From here on out, we will assume labels are hidden by default with `label { display: none; }` as this will make later derivations much easier.

As a simple example, say we have two checkboxes followed by a label and we want to show the label if and only if both checkboxes are checked.
```html
<input type="checkbox">
<input type="checkbox">
<label>Example</label>
```
This can be accomplished with:
```css
:checked + :checked + * {
  display: inline;
}
```
If we think of the two checkbox toggle states as booleans, the adjacent sibling combinator allows us to perform a logical AND. For a more complicated example, say we need the label to be shown if and only if exactly one of the checkboxes is checked. This can be done with:
```css
:checked + :not(:checked) + * {
  display: inline;
}

:not(:checked) + :checked + * {
  display: inline;
}
```
From this example, we can see that using multiple CSS rules (or alternatively, the comma combinator) allows us to perform a logical OR.

Finally, consider an example where we have a checkbox followed by three radio buttons in a radio group followed by a set of three labels.
```html
<input type="checkbox">
<input type="radio" name="a">
<input type="radio" name="a">
<input type="radio" name="a">
<label>1</label>
<label>2</label>
<label>3</label>
```
If the first checkbox is not checked, no label should be shown. Otherwise, if the i<sup>th</sup> radio button is the one that is selected, then only the i<sup>th</sup> label should be shown. We could implement this with our previous methods using three CSS rules but with the general sibling combinator, we can shorten this to just one:
```css
:checked ~ :checked + * + * + * {
  display: inline;
}
```
As we will see more later on, the general sibling combinator allows us to perform operations on arrays without having to specify rules for each index. This will be useful as we want the number of CSS rules we generate to not scale with the size of the tape as we are trying to emulate a theoretical Turing machine that can handle infinite memory.

### Computing a single iteration

To simplify, let us first consider what would have to be done to compute a single iteration of a Turing machine. That is, given a list of tape symbols, the head position, and the current Turing machine state, we compute the subsequent aforementioned properties. Let us assume the DOM is organized as follows:
```html
<!-- All inputs are invisible so the user cannot toggle them manually. -->

<!-- Current state. -->
<input type="radio" name="s0" id="s0_0"><input type="radio" name="s0" id="s0_1">

<!-- Next state. -->
<input type="radio" name="s1" id="s1_0"><input type="radio" name="s1" id="s1_1">

<!-- Current head position. -->
<input type="radio" name="h0" id="h0_0"><input type="radio" name="h0" id="h0_1">

<!-- Current tape. -->
<input type="checkbox" id="t0_0"><input type="checkbox" id="t0_1">

<!-- Next head position. -->
<input type="radio" name="h1" id="h1_0"><input type="radio" name="h1" id="h1_1">

<!-- Next tape. -->
<input type="checkbox" id="t1_0"><input type="checkbox" id="t1_1">

<!-- Labels for each input, stacked on top of each other using absolute positioning. -->
<label for="s0_0"></label><label for="s0_1"></label><label for="h0_0"></label><label for="h0_1"></label><label for="t0_0"></label><label for="t0_1"></label>
<label for="s1_0"></label><label for="s1_1"></label><label for="h1_0"></label><label for="h1_1"></label><label for="t1_0"></label><label for="t1_1"></label>
```
Notice that we have to store the destination state separately. We cannot update our data in place as we may overwrite old inputs that are still needed part way through into the computation.

All there is left to do now is to create the CSS rules that will show the correct labels based on the current inputs.

### Computing the updated tape

Code for computing a single tape cell in a traditional programmming language might look something like:
```python
def nextValue(tapeCellIdx):
  if currentHeadPos != tapeCellIdx:
    # No way we could change its value this iteration.
    return currentTape[tapeCellIdx]
  else:
    readValue = currentTape[currentHeadPos]
    writeValue = stateTable[currentState][readValue].write
    return writeValue
```
Our goal is to intelligently control the visibility of labels so that the correct inputs can be toggled. The code may be better rearranged as:
```python
def shouldShowToggle(tapeCellIdx):
  if currentHeadPos != tapeCellIdx:
    # No way we could change its value this iteration.
    return currentTape[tapeCellIdx] != destTape[tapeCellIdx]
  else:
    readValue = currentTape[currentHeadPos]
    writeValue = stateTable[currentState][readValue].write
    return writeValue != destTape[tapeCellIdx]
```
This will require some massaging before we can leverage the selectors as described earlier. Firstly, the boolean equality checks can be broken into cases:
```python
def shouldShowToggle(tapeCellIdx):
  if currentHeadPos != tapeCellIdx:
    # No way we could change its value this iteration.
    return (currentTape[tapeCellIdx] and not destTape[tapeCellIdx]) or (not currentTape[tapeCellIdx] and destTape[tapeCellIdx])
  else:
    readValue = currentTape[currentHeadPos]
    if readValue:
      writeValue = stateTable[currentState][1].write
    else:
      writeValue = stateTable[currentState][0].write
    return (writeValue and not destTape[tapeCellIdx]) or (not writeValue and destTape[tapeCellIdx])
```
The number of states is always finite so it can also be broken into cases:
```python
def shouldShowToggle(tapeCellIdx):
  if currentHeadPos != tapeCellIdx:
    # No way we could change its value this iteration.
    return (currentTape[tapeCellIdx] and not destTape[tapeCellIdx]) or (not currentTape[tapeCellIdx] and destTape[tapeCellIdx])
  else:
    readValue = currentTape[currentHeadPos]
    if currentState == 0:
      if readValue:
        # Statically known value!
        writeValue = stateTable[0][1].write
      else:
        writeValue = stateTable[0][0].write
    elif currentState == 1:
      if readValue:
        writeValue = stateTable[1][1].write
      else:
        writeValue = stateTable[1][0].write
    # ...
    return (writeValue and not destTape[tapeCellIdx]) or (not writeValue and destTape[tapeCellIdx])
```
Finally, after some boolean transformations, we get:
```python
def shouldShowToggle(tapeCellIdx):
  return (currentHeadPos != tapeCellIdx and currentTape[tapeCellIdx] and not destTape[tapeCellIdx]) or
    (currentHeadPos != tapeCellIdx and not currentTape[tapeCellIdx] and destTape[tapeCellIdx]) or
    (currentHeadPos == tapeCellIdx and currentState == 0 and currentTape[currentHeadPos] and stateTable[0][1].write and not destTape[tapeCellIdx]) or
    (currentHeadPos == tapeCellIdx and currentState == 0 and currentTape[currentHeadPos] and not stateTable[0][1].write and destTape[tapeCellIdx]) or
    (currentHeadPos == tapeCellIdx and currentState == 0 and not currentTape[currentHeadPos] and stateTable[0][0].write and not destTape[tapeCellIdx]) or
    (currentHeadPos == tapeCellIdx and currentState == 0 and not currentTape[currentHeadPos] and not stateTable[0][0].write and destTape[tapeCellIdx]) # ...
```
This fits the format described earlier with multiple clauses made up of logical AND's joined by logical OR's. Each line can therefore be represented by a single CSS rule. If tapeCellIdx equals zero, the first line could be translated to:
```css
#h0_0:not(:checked) ~ #t0_0:checked ~ #t1_0:not(:checked) ~ [for=t1_0] {
  display: inline;
}
```
This will work but will require a separate rule for each tape cell which we don't want. Notice that regardless of what the value of tapeCellIdx is, the distance between the elements we're identifying by id's are always the same as well as the distance to the matching label. Therefore, we can use just one rule for all tape cells:
```css
[name=h0]:not(:checked) + * + :checked + * + * + * + :not(:checked) + * + * + * + * + * + * + * + * + * + * + * + * {
  display: inline;
}
```
The third line in our function can be handled similarly. First, when tapeCellIdx is equal to zero and assuming the known value of stateTable[0][1].write is equal to one:
```css
#s0_0:checked ~ #h0_0:checked ~ #t0_0:checked ~ #t1_0:not(:checked) ~ [for=t1_0] {
  display: inline;
}
```
When generalized, we can again just create one rule for all tape cells:
```css
#s0_0:checked ~ [name=h0]:checked + * + :checked + * + * + * + :not(:checked) + * + * + * + * + * + * + * + * + * + * + * + * {
  display: inline;
}
```

### Computing the updated head position

This will largely go through the same derivation process as computing the updated tape cells. One notable difference is that these labels are for radio buttons so the label should only be shown if the expected value is checked but the destination value is currently unchecked.
```python
def shouldShowRadioLabel(headPositionIdx):
  readValue = currentTape[currentHeadPos]
  move = stateTable[currentState][readValue].move
  if move == 'L':
    # Tape moves left, head position moves right.
    updatedHeadPos = currentHeadPos + 1
  else:
    updatedHeadPos = currentHeadPos - 1
  # Target value for this index.
  value = updatedHeadPos == headPositionIdx
  return value and not destHeadPos[headPositionIdx]
```
Going through the same mechanical steps:
```python
def shouldShowRadioLabel(headPositionIdx):
  readValue = currentTape[currentHeadPos]
  if readValue:
    move = stateTable[currentState][1].move
  else:
    move = stateTable[currentState][0].move
  if move == 'L':
    # Tape moves left, head position moves right.
    updatedHeadPos = currentHeadPos + 1
  else:
    updatedHeadPos = currentHeadPos - 1
  return updatedHeadPos == headPositionIdx and not destHeadPos[headPositionIdx]
```
```python
def shouldShowRadioLabel(headPositionIdx):
  readValue = currentTape[currentHeadPos]
  if currentState == 0:
    if readValue:
      move = stateTable[0][1].move
    else:
      move = stateTable[0][0].move
  elif currentState == 1:
    if readValue:
      move = stateTable[1][1].move
    else:
      move = stateTable[1][0].move
  # ...
  if move == 'L':
    # Tape moves left, head position moves right.
    updatedHeadPos = currentHeadPos + 1
  else:
    updatedHeadPos = currentHeadPos - 1
  return updatedHeadPos == headPositionIdx and not destHeadPos[headPositionIdx]
```
```python
def shouldShowRadioLabel(headPositionIdx):
  return (currentState == 0 and currentTape[currentHeadPos] and stateTable[0][1].move == 'L' and currentHeadPos + 1 == headPositionIdx and not destHeadPos[headPositionIdx]) or
    (currentState == 0 and currentTape[currentHeadPos] and stateTable[0][1].move == 'R' and currentHeadPos - 1 == headPositionIdx and not destHeadPos[headPositionIdx])  or
    (currentState == 0 and not currentTape[currentHeadPos] and stateTable[0][0].move == 'L' and currentHeadPos + 1 == headPositionIdx and not destHeadPos[headPositionIdx]) or
    (currentState == 0 and not currentTape[currentHeadPos] and stateTable[0][0].move == 'R' and currentHeadPos - 1 == headPositionIdx and not destHeadPos[headPositionIdx]) # ...
```
The first line, assuming headPositionIdx is equal to one and stateTable[0][1].move == 'L', can be expressed in CSS as:
```css
#s0_0:checked ~ #h0_0:checked ~ #t0_0:checked ~ #h1_1:not(:checked) ~ [for=h1_1] {
  display: inline;
}
```
Generalized to:
```css
#s0_0:checked ~ [name=h0]:checked + [name=h0] + :checked + * + * + :not(:checked) + * + * + * + * + * + * + * + * + * + * + * + * {
  display: inline;
}
```
The second `[name=h0]` acts as a sort of bounds checking to avoid unplanned memory writes when trying to move off the edge of the tape.

### Computing the next state

This is very similar to computing the updated head position:
```python
def shouldShowRadioLabel(stateIdx):
  readValue = currentTape[currentHeadPos]
  nextState = stateTable[currentState][readValue].next
  # Target value for this index.
  value = nextState == stateIdx
  return value and not destStates[stateIdx]
```
```python
def shouldShowRadioLabel(stateIdx):
  readValue = currentTape[currentHeadPos]
  if readValue:
    nextState = stateTable[currentState][1].next
  else:
    nextState = stateTable[currentState][0].next
  return nextState == stateIdx and not destStates[stateIdx]
```
```python
def shouldShowRadioLabel(stateIdx):
  readValue = currentTape[currentHeadPos]
  if currentState == 0:
    if readValue:
      nextState = stateTable[0][1].next
    else:
      nextState = stateTable[0][0].next
  elif currentState == 1:
    if readValue:
      nextState = stateTable[1][1].next
    else:
      nextState = stateTable[1][0].next
  # ...
  return nextState == stateIdx and not destStates[stateIdx]
```
```python
def shouldShowRadioLabel(stateIdx):
  return (currentState == 0 and currentTape[currentHeadPos] and stateTable[0][1].next == stateIdx and not destStates[stateIdx]) or
    (currentState == 0 and not currentTape[currentHeadPos] and stateTable[0][0].next == stateIdx and not destStates[stateIdx]) # ...
```
Assuming stateIdx and stateTable[0][1].next are equal to one, the first line can be expressed as:
```css
#s0_0:checked ~ #s1_1:not(:checked) ~ [name=h0]:checked + * + :checked ~ [for=s1_1] {
  display: inline;
}
```

### Generalizing to many iterations

There can be a possibly infinite number of Turing machine iterations so we cannot just create more destination inputs to scale up. The key is that we only ever need to keep track of the current inputs and the inputs currently being written to. Once an iteration is done, we can just swap the two so that the inputs we've just written to are now the current inputs we are computing from.

Information about which set of inputs is which will have to be stored in another boolean checkbox input along with an associated label. The tricky thing here is that computing the visibility of the label in this case would be tremendously complex as it can only be toggled after an iteration is fully complete or if we know that all other labels are invisible. Instead, we can just make the label always visible but place it under all the other labels so that it is guaranteed to be toggled last.
```html
<!-- Indicates which set of inputs we are deriving from. -->
<input type="checkbox" id="f">

<input type="radio" name="s0" id="s0_0"><input type="radio" name="s0" id="s0_1">

<input type="radio" name="s1" id="s1_0"><input type="radio" name="s1" id="s1_1">

<input type="radio" name="h0" id="h0_0"><input type="radio" name="h0" id="h0_1">

<input type="checkbox" id="t0_0"><input type="checkbox" id="t0_1">

<input type="radio" name="h1" id="h1_0"><input type="radio" name="h1" id="h1_1">

<input type="checkbox" id="t1_0"><input type="checkbox" id="t1_1">

<!-- Labels for each input, stacked on top of each other using absolute positioning. -->
<label for="f"></label>
<label for="s0_0"></label><label for="s0_1"></label><label for="h0_0"></label><label for="h0_1"></label><label for="t0_0"></label><label for="t0_1"></label>
<label for="s1_0"></label><label for="s1_1"></label><label for="h1_0"></label><label for="h1_1"></label><label for="t1_0"></label><label for="t1_1"></label>
```
All of our previous CSS rules will need to be adapted for both cases. For example, the previous rule for helping compute the next state becomes:
```css
#f:not(:checked) ~ #s0_0:checked ~ #s1_1:not(:checked) ~ [name=h0]:checked + * + :checked ~ [for=s1_1] {
  display: inline;
}

#f:checked ~ #s0_1:not(:checked) ~ #s1_0:checked ~ [name=h1]:checked + * + :checked ~ [for=s0_1] {
  display: inline;
}
```

### Halting

The halting state does not need to be treated any differently than the other states in the case of input and label representation. To stop the cycle of iterations, we can show the bottommost iteration toggle label only if the current state is not the halting state.

Assuming `#s0_1` and `#s1_1` represent the halting state, this looks like:
```css
#s0_1:not(:checked) ~ #s1_1:not(:checked) ~ [for=f] {
  display:inline;
}
```
Then, once the user finishes updating the inputs for the current iteration and the resulting state happens to be the halting state, there will be no way to continue and the inputs will reflect the final results.