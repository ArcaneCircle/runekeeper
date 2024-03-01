import { on } from "./bus";
import { AXIS_WAIT, SIGIL_DRAWN } from "./events";
import { getObjectsByTag } from "./engine";
import { retainTransform } from "./canvas.js";
import { ORDER_REMAP } from "./rune-stone.js";

export default function SpellHint(axis, style) {
    let display = false
    let cx = 0
    let cy = 0
    on(AXIS_WAIT, (sigil) => {
        display = true
        const stone = getObjectsByTag('rune-stone')[0]
        const pos = ORDER_REMAP[sigil]
        const cn = [pos, pos]
        const cs = [stone.getX(), stone.getY()]
        cn[axis] = cs[axis]
        ;[cx, cy] = cn
    })
    on(SIGIL_DRAWN, () => display = false)
    return {
        tags: ['spell_hint'],
        render(ctx) {
            if (!display) return
            retainTransform(() => {
                const r = 80
                ctx.fillStyle = style
                ctx.translate((cx + 0.5) * r, (cy + 0.5) * r);
                ctx.fillRect(-40, -40, r, r)
            })
        },
    }
}
