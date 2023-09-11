import { emit, off, on } from "./bus";
import { retainTransform } from "./canvas";
import { DARK_GRAY, GRAY, LIGHT_GRAY, MID_GRAY, WHITE } from "./color";
import DamageParticle from "./damage-particle";
import { add, resort } from "./engine";
import { ABILITY_USE, ENEMY_DAMAGE, RUNESTONE_MOVE, TURN_END } from "./events";
import PulseSFX from "./pulse-sfx";

function Enemy(cx, cy) {
    let anim = Math.random() * 7;
    let targetX = cx;
    let targetY = cy;
    let originX = cx;
    let originY = cy;
    const MOVE_DURATION = 0.35;
    let self = {};

    const IDLE = 0;
    const MOVING = 1;
    const ATTACK = 2;
    let state = IDLE;

    let timeInState = 0;
    let dead = false;
    let hp = 2;
    let maxHp = hp;
    let motion = 0;
    let motionMax = 2;
    let onFire = 0;

    // VFX on spawn
    add(PulseSFX(cx, cy, 55, [0, 0, 0]));

    function render(ctx) {
        retainTransform(() => {
            ctx.translate((cx + 0.5) * 80, (cy + 0.5) * 80);
            
            // shadow
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.beginPath();
            ctx.ellipse(0, 0, 26, 19, 0, 0, 2 * Math.PI);
            ctx.fill();

            // hop while move
            if (state == MOVING) {
                const p = timeInState / MOVE_DURATION;
                ctx.translate(0, -120 * p * (1-p));
            }
            
            // torso
            ctx.lineWidth = 10;
            ctx.fillStyle = GRAY;
            ctx.strokeStyle = GRAY;
            const squish = Math.cos(anim * 10);
            const squish2 = Math.cos(anim * 10 + 1);
            ctx.fillRect(-10+squish, 0, 20-2*squish, -34-2*squish);
            ctx.strokeRect(-10+squish, 0, 20-2*squish, -34-2*squish);
            
            // head
            retainTransform(() => {
                ctx.translate(0, -39 - squish * 3);
                ctx.fillStyle = DARK_GRAY;
                ctx.strokeStyle = DARK_GRAY;
                ctx.fillRect(-6, 0, 12, -16);
                ctx.strokeRect(-6, 0, 12, -16);
                ctx.strokeStyle = '#c11';
                ctx.beginPath();
                ctx.moveTo(0, -62+41);
                ctx.lineTo(1, -70+41);
                ctx.lineTo(6, -74+41);
                ctx.lineTo(10, -70+41);
                ctx.stroke();
                ctx.strokeStyle = LIGHT_GRAY;
                ctx.beginPath();
                ctx.moveTo(-3, -49+41);
                ctx.lineTo(-3.01, -49+41);
                ctx.stroke();
            });

            // sword
            retainTransform(() => {
                ctx.translate(-20, -18 + squish2 * 1);
                ctx.rotate(Math.cos(anim * 10 - 0.2) * 0.04);
                if (state == ATTACK) {
                    ctx.translate(-Math.exp(-Math.pow((timeInState-0.25) * 1.5, 2) * 25) * 20, 0);
                    ctx.rotate(-Math.exp(-Math.pow((timeInState-0.3) * 1.5, 2) * 30) * 1.2);
                }
                ctx.strokeStyle = '#eee';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-6, -45+13);
                ctx.stroke();
                ctx.strokeStyle = '#841';
                ctx.beginPath();
                ctx.moveTo(-5, 0);
                ctx.lineTo(5, -3);
                ctx.moveTo(0, 0);
                ctx.lineTo(2, 4);
                ctx.stroke();
            });

            // hp / motion bars
            for (let i = 0; i < maxHp; i++) {
                retainTransform(() => {
                    ctx.translate(-22 * (maxHp - 1) / 2.0 + 22 * i, 0);
                    ctx.beginPath();
                    ctx.strokeStyle = '#222';
                    ctx.lineWidth = 10;
                    ctx.moveTo(-5, 10);
                    ctx.lineTo(0, 15);
                    ctx.lineTo(5, 10);
                    ctx.stroke();
                    if (i < hp) {
                        ctx.strokeStyle = '#f22';
                        ctx.lineWidth = 6;
                        ctx.stroke();
                    }
                });
            }
            for (let i = 0; i < motionMax; i++) {
                retainTransform(() => {
                    ctx.translate(-22 * (motionMax - 1) / 2.0 + 22 * i, 0);
                    ctx.beginPath();
                    ctx.strokeStyle = '#222';
                    ctx.lineWidth = 10;
                    ctx.moveTo(-4, 27);
                    ctx.lineTo(4, 27);
                    ctx.stroke();
                    if (i < motion || (i <= motion && Math.cos(anim * 15) > 0)) {
                        ctx.strokeStyle = '#3af';
                        ctx.lineWidth = 6;
                        ctx.stroke();
                    }
                });
            }

            // on fire
            if (onFire > 0) {
                for (let i = 0; i < 9; i++) {
                    const p = (i * 30 + anim * 100) % 50 / 50.0;
                    const q = 0.15 + p * 0.85;
                    const w = (1-p*p*p*p*p);
                    ctx.fillStyle = `rgba(${255 * w}, ${(50+p*200) * w}, ${30 * w}, ${(1-p)})`;
                    ctx.beginPath();
                    ctx.ellipse(
                        ((i * 83) % 130 - 65) * 0.34,
                        -p * 56 + ((i * 11) % 23 - 5) * 1.3,
                        26 * (1-p) * q, 26 * (1-p) / q * p, 0, 0, Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        })
    }

    function update(dT) {
        anim += dT;
        timeInState += dT;

        if (state == MOVING) {
            const p = timeInState / MOVE_DURATION;
            cx = originX * (1-p) + targetX * p;
            cy = originY * (1-p) + targetY * p;
            if (timeInState > MOVE_DURATION) {
                cx = targetX;
                cy = targetY;
                timeInState = 0;
                state = IDLE;
                self.order = 30 + cy * 0.02;
                resort();
            }
        }

        if (state == ATTACK && timeInState > 0.5) {
            state = IDLE;
            timeInState = 0;
        }

        if (dead) {
            off(RUNESTONE_MOVE, onRunestoneMove);
            off(TURN_END, onTurnEnd);
            off(ABILITY_USE, onAbilityUse);
            return true;
        }
    }

    function issueMove(nx, ny) {
        originX = cx;
        originY = cy;
        targetX = nx;
        targetY = ny;
        state = MOVING;
        timeInState = 0;
    }

    function onRunestoneMove() {
        motion += 1;
    }

    function onTurnEnd() {
        // Walk if you can
        if (cx > 0) {
            if (motion >= motionMax) {
                motion = 0;
                issueMove(cx - 1, cy);
            }
        }
        // Otherwise attack!
        else {
            state = ATTACK;
            timeInState = 0;
            emit(ENEMY_DAMAGE, 1);
            add(DamageParticle(-1.1, cy + 0.5, 1, [255, 0, 0]));
        }

        if (onFire > 0) {
            onFire -= 1;
            takeDamage(1);
        }
    }

    function takeDamage(dmg) {
        hp -= dmg;
        add(PulseSFX(cx, cy, 95, [0, 0, 0]));
        add(DamageParticle(cx, cy, dmg, [255, 0, 0]));
        if (hp <= 0) {
            dead = true;
        }
    }

    function onAbilityUse([tx, ty, powerType]) {
        if (tx == cx && ty == cy) {
            if (powerType == 0) {
                onFire = 3;
            }
            if (powerType == 1) {
                motion = -1;
                takeDamage(1);
            }
            if (powerType == 2) {
                takeDamage(2);
            }
        }
    }

    on(RUNESTONE_MOVE, onRunestoneMove);
    on(TURN_END, onTurnEnd);
    on(ABILITY_USE, onAbilityUse);

    self = {
        update,
        render,
        tags: ['enemy', 'obstacle'],
        order: 30,
        getX: () => cx,
        getY: () => cy,
    }

    self.order = 30 + cy * 0.02;
    resort();
    
    return self;
}

export default Enemy;