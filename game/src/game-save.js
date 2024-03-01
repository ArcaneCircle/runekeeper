import { emit, on } from "./bus";
import { TURN_END, GAME_OVER, SCORED, ENEMY_DAMAGE, SHOW_MESSAGE } from "./events.js";
import { getObjectsByTag } from "./engine.js";
import { HP_INIT } from "./wizard.js";

const game_name = "runekeeper";
const storage = localStorage;

export function initialize() {
    const game = getObjectsByTag('game')[0]
    const wizard = getObjectsByTag('wizard')[0]
    const saveKey = `${game_name}.save`
    let save = storage[saveKey]

    if (save) {
        save = JSON.parse(save)
        for (let i=0; i<save.score; i++) emit(SCORED)
        emit(ENEMY_DAMAGE, HP_INIT - save.hp)
        emit(SHOW_MESSAGE, `RESUME WITH HP ${save.hp} AND SCORE ${save.score}`)
    }

    on(TURN_END, () => {
        const score = game.getScore()
        const hp = wizard.getHp()
        if (hp > 0) storage[saveKey] = JSON.stringify({hp, score})
    })
    on(GAME_OVER, () => {
        delete storage[saveKey]
    })
}
