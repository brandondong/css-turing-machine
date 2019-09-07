# Turing Machine implemented in CSS

Demo (TODO)

## How does it work?

### Maintaining program state

At any point during a Turing machine's execution, it must track the list of tape symbols, the head position, and the current state it's in. If we want to emulate one, we need to store this information somewhere in the DOM. HTML inputs, specifically checkbox and radio buttons, are a nice way of storing this data as their toggled states can be accessed easily in CSS through the [:checked](https://developer.mozilla.org/en-US/docs/Web/CSS/:checked) pseudo-class selector.

The list of binary tape symbols naturally translates into a list of checkboxes. The head position and the current Turing machine state are both values from a set of possibilites and therefore can be simply represented as a single selection within a [radio button group](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio#Defining_a_radio_group).

### Stepping through the program

Executing a program requires the ability to write to memory or in our case, to toggle inputs. This cannot be done automatically through CSS; a user must perform a mouse click for each individual toggle. In order to ensure that the user does not perform any computation, the program should be executed in a way such that all mouse clicks are done on a stationary spot.

This thought process naturally points to stacking all the inputs on top of each other. We choose to stack HTML labels with the [for](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label#Attributes) attribute instead. Since clicking a label will toggle its associated input, this approach allows for greater flexibility in the positioning of elements throughout the DOM and labels can be more easily restyled to look like buttons.

The plan of attack is to have a label for each input and to stack all the labels (which we've restyled to look like buttons) on top of each other such that there appears to be only one button that the user must continually press. We then must intelligently apply `display: none;` to the apppropriate labels such that we control which label the user is actually toggling, thereby writing to the desired parts of memory.

### Controlling the visibility of labels

CSS allows the conditional application of styles through [selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors). The ones that we are heavily leveraging are the earlier mentioned [:checked](https://developer.mozilla.org/en-US/docs/Web/CSS/:checked) pseudo-class selector, the [:not()](https://developer.mozilla.org/en-US/docs/Web/CSS/:not) pseudo-class, the [adjacent sibling combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/Adjacent_sibling_combinator), and the the [general sibling combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/General_sibling_combinator).

As a simple example, say we have two checkboxes followed by a label and we want to hide the label if and only if both checkboxes are checked. This can be accomplished with:
```css
input:checked + input:checked + label {
  display: none;
}
```
If we think of the two checkbox toggle states as booleans, the adjacent sibling combinator allows us to perform a logical AND. For a more complicated example, say we need the label to be hidden if and only if exactly one of the checkboxes is checked. This can be done with:
```css
input:checked + input:not(:checked) + label {
  display: none;
}

input:not(:checked) + input:checked + label {
  display: none;
}
```
From this example, we can see that using multiple CSS rules allows us to perform a logical OR.

Finally, consider an example where we have five checkboxes followed by five radio buttons in a radio group before the label. If the i<sup>th</sup> radio button is the one that is selected and the i<sup>th</sup> checkbox also happens to be checked, then the label must be hidden. Otherwise, it should be shown. We could implement this with our previous methods using five CSS rules but with the general sibling combinator, we can shorten this to just one:
```css
input:checked + input + input + input + input + input:checked ~ label {
  display: none;
}
```
If the checkboxes are thought of as a boolean array and the selected radio button as a corresponding index, then we have just implemented an array lookup. This will be useful as we want the number of CSS rules we generate to not scale with the size of the tape as we are trying to emulate a theoretical Turing machine that can handle infinite memory.

### Computing a single iteration

To simplify, let us first consider what would have to be done to compute a single iteration of a Turing machine. That is, given a list of tape symbols, the head position, and the current Turing machine state, we compute the subsequent list of tape symbols, head position, and Turing machine state. Let us assume the DOM is organized as follows:
```html
<!-- All inputs are invisible so the user cannot toggle them manually. -->

<!-- Current state. -->
<input type="radio" name="s0" id="s0_0"><input type="radio" name="s0" id="s0_1">...

<!-- Current tape. -->
<input type="checkbox" id="t0_0"><input type="checkbox" id="t0_1">...

<!-- Current head position. -->
<input type="radio" name="h0" id="h0_0"><input type="radio" name="h0" id="h0_1">...

<!-- Next state. -->
<input type="radio" name="s1" id="s1_0"><input type="radio" name="s1" id="s1_1">...

<!-- Next tape. -->
<input type="checkbox" id="t1_0"><input type="checkbox" id="t1_1">...

<!-- Next head position. -->
<input type="radio" name="h1" id="h1_0"><input type="radio" name="h1" id="h1_1">...

<!-- Labels controlling the entire second half of inputs, stacked on top of each other using absolute positioning. -->
<label for="s1_0"></label><label for="s1_1"></label>...
```
Notice that we have to store the destination state separately. We cannot update our data in place as we may overwrite old inputs that are still needed part way through into the computation.

All there is left to do now is to create the CSS rules that will hide the correct labels based on the current inputs.

### Computing the updated tape

Code for computing a single tape cell in a traditional programmming language might look something like:
```python
def next(tapeCellIdx):
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
def shouldHideToggle(tapeCellIdx):
  if currentHeadPos != tapeCellIdx:
    # No way we could change its value this iteration.
    return currentTape[tapeCellIdx] == nextTape[tapeCellIdx]
  else:
    readValue = currentTape[currentHeadPos]
    writeValue = stateTable[currentState][readValue].write
    return writeValue == nextTape[tapeCellIdx]
```
This will require some massaging before we can leverage the selectors as described earlier. Firstly, the boolean equality checks can be broken into cases:
```python
def shouldHideToggle(tapeCellIdx):
  if currentHeadPos != tapeCellIdx:
    # No way we could change its value this iteration.
    return (currentTape[tapeCellIdx] and nextTape[tapeCellIdx]) or (not currentTape[tapeCellIdx] and not nextTape[tapeCellIdx])
  else:
    readValue = currentTape[currentHeadPos]
    if readValue:
      writeValue = stateTable[currentState][1].write
    else:
      writeValue = stateTable[currentState][0].write
    return (writeValue and nextTape[tapeCellIdx]) or (not writeValue and not nextTape[tapeCellIdx])
```
The number of states is always finite so it can also be broken into cases:
```python
def shouldHideToggle(tapeCellIdx):
  if currentHeadPos != tapeCellIdx:
    # No way we could change its value this iteration.
    return (currentTape[tapeCellIdx] and nextTape[tapeCellIdx]) or (not currentTape[tapeCellIdx] and not nextTape[tapeCellIdx])
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
    return (writeValue and nextTape[tapeCellIdx]) or (not writeValue and not nextTape[tapeCellIdx])
```
Finally, after some boolean transformations, we get:
```python
def shouldHideToggle(tapeCellIdx):
  return (currentHeadPos != tapeCellIdx and currentTape[tapeCellIdx] and nextTape[tapeCellIdx]) or
    (currentHeadPos != tapeCellIdx and not currentTape[tapeCellIdx] and not nextTape[tapeCellIdx]) or
    (currentHeadPos == tapeCellIdx and currentState == 0 and currentTape[currentHeadPos] and stateTable[0][1].write and nextTape[tapeCellIdx]) or
    (currentHeadPos == tapeCellIdx and currentState == 0 and currentTape[currentHeadPos] and not stateTable[0][1].write and not nextTape[tapeCellIdx]) or
    (currentHeadPos == tapeCellIdx and currentState == 0 and not currentTape[currentHeadPos] and stateTable[0][0].write and nextTape[tapeCellIdx]) or
    (currentHeadPos == tapeCellIdx and currentState == 0 and not currentTape[currentHeadPos] and not stateTable[0][0].write and not nextTape[tapeCellIdx]) # ...
```