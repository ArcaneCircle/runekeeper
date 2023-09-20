# 🧙💎 RUNEKEEPER 💎🧙

- Game core conceit: The drawing mechanic should driving everything -- it's the fun part.
- Bonus points: make it for mobile (good for drawing with your thumb maybe?)

**NOTE:** This is a port to WebXDC with some small improvements, like sharing highscores,
the original game can be found [here](https://github.com/arikwex/runekeeper)

## Contributing

### Installing Dependencies

After cloning this repo, install dependecies:

```
pnpm i
```

### Checking the code format

```
pnpm check
```

### Testing the app in the browser

To test your work in your browser (with hot reloading!) while developing:

```
pnpm dev-mini
# Alternatively to test in a more advanced WebXDC emulator:
pnpm dev
```

### Building

To package the WebXDC file:

```
pnpm build
```

The resulting optimized `.xdc` file is saved in `dist-xdc/` folder.

### Releasing

To automatically build and create a new GitHub release with the `.xdc` file:

```
git tag v1.0.1
git push origin v1.0.1
```
