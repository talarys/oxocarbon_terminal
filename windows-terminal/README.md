# Oxocarbon for Windows Terminal

This port provides **both** things Windows Terminal calls a "theme":

| Concept | JSON key | What it controls |
| --- | --- | --- |
| **Color scheme** | `"schemes"` | terminal background, text, cursor, selection, the 16 ANSI colors |
| **Window theme** | `"themes"` | title/tab row, active/inactive tabs, window frame |

Four entries are installed: `Oxocarbon Dark` and `Oxocarbon Light` as a color
scheme *and* as a window theme. Scheme and theme are independent, so you can
mix them (for example, dark scheme + light window chrome) or pair them.

Palette source and ANSI rationale: [`../palettes/`](../palettes/).

## Install

### Script (recommended)

From this folder:

```powershell
.\install.ps1
```

or double-click `install.cmd`.

The script copies `oxocarbon.json` into

```
%LOCALAPPDATA%\Microsoft\Windows Terminal\Fragments\Oxocarbon\oxocarbon.json
```

after validating the JSON. That folder is shared by Windows Terminal stable,
Preview, and Canary. Restart Windows Terminal afterwards.

If PowerShell blocks the script, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1
```

Uninstall:

```powershell
.\install.ps1 -Uninstall
```

### Manual fragment install

1. Create `%LOCALAPPDATA%\Microsoft\Windows Terminal\Fragments\Oxocarbon\`.
2. Copy `oxocarbon.json` into it.
3. Restart Windows Terminal.

Fragments never edit your `settings.json`, so this is safe to overwrite on
every update.

### Manual paste into `settings.json`

Open `settings.json` (`Ctrl+,` → *Open JSON file*) and copy the two `"schemes"`
entries into the existing `"schemes"` array and the two `"themes"` entries into
`"themes"` (create it if missing). See
[`examples/settings-snippet.json`](examples/settings-snippet.json) for the
activation lines.

## Activate

Pick a color scheme for your profiles (Settings UI, or `settings.json`):

```json
"profiles": {
    "defaults": {
        "colorScheme": "Oxocarbon Dark"
    }
}
```

Pick the window theme at the root of `settings.json`. To follow the OS
light/dark setting, use a theme pair:

```json
"theme": {
    "dark": "Oxocarbon Dark",
    "light": "Oxocarbon Light"
}
```

Or force one: `"theme": "Oxocarbon Dark"`.

> Windows Terminal only switches the **window theme** with the OS theme.
> Color schemes are per profile and do not switch automatically. If you use the
> pair above, choose one scheme (or set schemes per profile) yourself.

## What the theme does

- The active tab uses `terminalBackground`, so it blends into the pane.
- Tab row and tab backgrounds are Carbon grays. The only accent is the window
  frame: `#78a9ff` (dark) / `#0f62fe` (light). Frame colors require Windows 11
  and a Windows Terminal Preview build; they are ignored elsewhere.
- `useMica` is off so colors stay exact. To use Mica instead, set
  `"useMica": true` and `"tabRow": { "background": "#00000000" }`.
- `"iconStyle": "monochrome"` keeps tab icons in the theme foreground. Change it
  to `"default"` to keep colored app icons.
- `"showCloseButton": "activeOnly"` hides the close button on inactive tabs.

## Scheme details

- Background, foreground, cursor, and selection come from the Neovim palette
  (`Normal`, `Cursor`, `Visual`).
- ANSI colors follow the official Nyoom terminal ports, not nvim's
  `terminal_color_*` mapping. The nvim mapping renders ANSI red as blue, which
  is faithful but confusing in a shell. The exact mapping is documented in
  [`../palettes/palettes.txt`](../palettes/palettes.txt).
- The dark scheme is the high-contrast option. The light scheme is faithful to
  upstream's pastel light palette and some ANSI accents are low-contrast on
  white; see the caveat in the [main README](../README.md#light-scheme-caveat).

## Files

```
oxocarbon.json                 fragment: 2 color schemes + 2 window themes
install.ps1 / install.cmd      installer / uninstaller
examples/settings-snippet.json activation example
```
