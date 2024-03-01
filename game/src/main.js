import * as bus from './bus';
import EnemySpawner from './enemy-spawner';
import { add } from './engine';
import { POWERUP_ACQUIRED } from './events';
import GameArena from './game-arena';
import PowerUp from './powerup';
import RuneStone from './rune-stone';
import { spotOccupied } from './sensor';
import SpellCaster from './spell-caster';
import Wizard from './wizard';
import Audio from './audio';
import * as Save from './game-save.js';
import SpellHint from './spell-hint.js';

function initialize() {
    add(GameArena());
    add(Wizard());
    add(RuneStone());
    add(SpellCaster());
    add(EnemySpawner());
    add(SpellHint(0, '#EC8'))
    add(SpellHint(1, '#8AA'))

    function placePowerUp() {
        const powerType = Math.floor(Math.random() * 3);
        const shapeType = Math.floor(Math.random() * 5);
        for (let i = 0; i < 300; i++) {
            const sx = Math.floor(Math.random() * 4 + 1);
            const sy = Math.floor(Math.random() * 4 + 1);
            if (!spotOccupied(sx, sy)) {
                add(PowerUp(sx, sy, powerType, shapeType));
                return;
            }
        }
        console.log('Failed to place!');
    }
    
    placePowerUp();
    placePowerUp();
    placePowerUp();

    bus.on(POWERUP_ACQUIRED, placePowerUp);

    Audio().init();

    Save.initialize();
}
initialize();
