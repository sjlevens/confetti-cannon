# 🎉 confetti-cannons 🎉

## Elevate your web celebrations!

Looking to bring some extra sparkle and joy to your web application? Want to surprise your users with a virtual celebration they'll never forget? `confetti-cannons` is here to make your web festivities unforgettable! With just one line of code, shower your web application with confetti 🎊

## Installation

```bash
npm install confetti-cannons
```

## Usage

It's simple! Import and fire away:

```javascript
import confetti from "confetti-cannons";

// Whenever you want to celebrate
confetti();
```

This will blast confetti particles from the bottom of your screen. Who knew joy could be so few kb? 😄

### Event Listener

```javascript
import confetti from "confetti-cannons";

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("celebrateButton");
  button.addEventListener("click", () => {
    confetti();
  });
});
```

### React button handler

```javascript
import React from "react";
import confetti from "confetti-cannons";

const CelebrationButton = () => {
  const handleButtonClick = () => {
    confetti();
  };

  return <button onClick={handleButtonClick}>Click me for Confetti!</button>;
};

export default CelebrationButton;
```

### React useEffect Example

```javascript
import React, { useEffect } from "react";
import confetti from "confetti-cannons";

const CelebrateOnLoad = () => {
  useEffect(() => {
    confetti();
  }, []); // Empty dependency array ensures it only fires once, on initial render

  return (
    <div>
      <h1>Welcome to the Party!</h1>
    </div>
  );
};

export default CelebrateOnLoad;
```

## Options

You can customise the intensity and other configurations:

```javascript
// Blast with custom intensity and z-index
confetti(50, { zIndex: 1000 });

// This will place your confetti behind everything (careful if you use it in a drawer!)
confetti(50, { zIndex: -1 });

// Blast from specific cannon spawns (default is [-1, 1])
confetti(20, { cannonSpawns: [-0.5, 0.5] });
```

## How it Works

Under the hood, `confetti-cannons` uses WebGL to render performant confetti particles on your screen. Different shapes and colours add to the variety!

## What's Next?

We're looking to add more customisation options for shapes, colours, and animations. Stay tuned!

## Bugs & Contributions

Find a bug? Want to add a new feature? Your contributions are welcome! Open an issue or submit a PR.

## License

MIT

---

Celebrate the small wins, the big moments, and everything in between! 🥳
