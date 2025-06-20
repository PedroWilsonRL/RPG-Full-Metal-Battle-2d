const GAME_WIDTH = 880;
const GAME_HEIGHT = 700;
const CAMERA_ZOOM = 1.4; 

window.addEventListener('load', function () {
    const backgroundMusic = new Audio('assets/music/music_city.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.2;
    backgroundMusic.play().catch(() => {
        const resumeMusic = () => {
            backgroundMusic.play();
            window.removeEventListener('keydown', resumeMusic);
            window.removeEventListener('mousedown', resumeMusic);
        };
        window.addEventListener('keydown', resumeMusic);
        window.addEventListener('mousedown', resumeMusic);
    });

    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    const headGif = new Image();
    headGif.src = 'assets/characters/alphonse_elric head.gif';

    const speechBubble = new Image();
    speechBubble.src = 'assets/characters/pixel_bubble_speech.png';

    const dialogBox = new Image();
    dialogBox.src = 'assets/characters/dialog_box1.png';

    const menuImage = new Image();
    menuImage.src = 'assets/characters/menu.png'; 

    function isColliding(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    class InputHandler {
        constructor() {
            this.keys = {};
            this.justPressed = {};
            window.addEventListener('keydown', e => {
            
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'x', 'z'].includes(e.key)) {
                    e.preventDefault();
                }
                if (!this.keys[e.key]) this.justPressed[e.key] = true;
                this.keys[e.key] = true;
            });
            window.addEventListener('keyup', e => {
                this.keys[e.key] = false;
                this.justPressed[e.key] = false;
            });
        }
        clearPressed() {
            this.justPressed = {};
        }
    }

    const maps = {
        city: {
            mapImage: 'assets/map/city_full_map.png',
            upperImage: 'assets/map/city_full_map upper.png',
            mapWidth: 1024,
            mapHeight: 1024,
            teleportZone: { col: 13.9, row: 17.9, width: 1, height: 1 },
            teleportTarget: { mapKey: 'room', startCol: 9, startRow: 14 },
            hasNPC: true,
           
            blockedTiles: [
                [18, 11], [18, 10], [18, 9], [18, 8], [18, 7],
                [15, 11], [16, 11], [17, 11], [14, 11], [13, 11],
                [12, 11], [12, 10], [12, 9], [12, 8], [13, 8],
                [14, 8], [15, 8], [16, 8], [17, 8], [18, 8], [15, 4],
                [14, 12], [13, 12], [12, 12], [11, 12], [16, 12], [17, 12],
                [18, 12], [19, 12], [18, 11], [17, 11], [16, 11], [14, 11],
                [13, 11], [12, 11], [12, 10], [13, 10], [14, 10], [15, 10],
                [16, 10], [17, 10], [18, 10], [18, 9], [17, 9], [16, 9],
                [15, 9], [14, 9], [13, 9], [12, 9], [11, 9], [11, 8], 
                [11, 10], [11, 11], [15, 4], [16, 4], [17, 4],
                [18, 4], [19, 4], [20, 4], [21, 4], [21, 3], 
                [20, 3], [19, 3], [18, 3], [17, 3], [16, 3],
                [15, 3], [9, 5], [8, 5], [7, 5], [6, 5], [5, 5],
                [4, 5], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6],
                [9, 9], [9, 7], [8, 7], [7, 7], [6, 7], [5, 7],
                [4, 7], [18, 18], [17, 18], [16, 18], [15, 18], [13, 18],
                [13, 17], [14, 17], [15, 17], [16, 17], [17, 17],
                [18, 17], [18, 18], [19, 18], [24, 20], [22, 21],
                [23, 21], [24, 21], [25, 21], [26, 21], [27, 21],
                [28, 21], [29, 21], [29, 20], [29, 22], [28, 22],
                [27, 22], [26, 22], [25, 22], [24, 22], [23, 22],
                [22, 22], [19, 23], [18, 23], [17, 23], [16, 23],
                [15, 23], [14, 23], [13, 23], [13, 24], [14, 24],
                [15, 24], [16, 24], [17, 24], [18, 24], [19, 24],
                [10, 20], [9, 20], [8, 20], [7, 20], [7, 19],
                [8, 19], [9, 19], [10, 19], [10, 18], [9, 18],
                [9, 17], [8, 17], [7, 17], [7, 18], [7, 19], 
                [7, 20], [6, 20], [6, 19], [6, 18], [6, 17]
            ]
        },
        room: {
            mapImage: 'assets/map/room_full_map.png',
            upperImage: 'assets/map/room_full_map upper3.png',
            mapWidth: 640,
            mapHeight: 640,
            teleportZone: { col: 9, row: 18, width: 1, height: 1 },
            teleportTarget: { mapKey: 'city', startCol: 14, startRow: 19 },
            hasNPC: false,
            
            blockedTiles: [
                [11, 13], [12, 13], [13, 13], 
                [14, 13], [15, 13], [16, 13], 
                [17, 13], [18, 13], [18, 14],
                [18, 15], [18, 16], [18, 17],
                [18, 18], [17, 18], [16, 18],
                [15, 18], [14, 18], [13, 18],
                [12, 18], [11, 18], [10, 18],
                [7, 18], [6, 18], [5, 18],
                [4, 18], [3, 18], [2, 18],
                [1, 18], [1, 17], [1, 16],
                [1, 15], [1, 14], [1, 13],
                [1, 12], [1, 11], [1, 10],
                [1, 9], [1, 8], [1, 7],
                [1, 6], [1, 5], [1, 4],
                [1, 3], [1, 2], [2, 2],
                [3, 2], [3, 3], [4, 3],
                [4, 4], [4, 5], [5, 5],
                [6, 5], [5, 5], [5, 4],
                [6, 4], [7, 4], [8, 4],
                [9, 4], [10, 4], [11, 4],
                [12, 4], [13, 4], [14, 4],
                [15, 4], [16, 4], [17, 4],
                [18, 4], [18, 5], [18, 6],
                [18, 7], [18, 8], [18, 9],
                [18, 10], [18, 11], [18, 12],
                [18, 13], [18, 14], [18, 15],
                [18, 16], [18, 17], [18, 18],
                [2, 4], [3, 4], [8, 13],
                [7, 13], [6, 13], [5, 13],
                [4, 13], [3, 13], [2, 13],
                [11, 13], [12, 13], [13, 13],
                [14, 13], [15, 13], [16, 13],
                [17, 13], [17, 12], [16, 12],
                [15, 12], [13, 12], [12, 12],
                [11, 12], [8, 12], [7, 12],
                [6, 12], [5, 12], [4, 12],
                [3, 12], [2, 12], [1, 12],
                [13, 11], [12, 11], [11, 11],
                [8, 11], [7, 11], [6, 11],
                [5, 11], [4, 11], [3, 11],
                [2, 11], [1, 11], [3, 9],
                [2, 9], [2, 8], [2, 7],
                [2, 6], [3, 7], [9, 8],
                [10, 8], [11, 8], [15, 8],
                [16, 8], [17, 8], [15, 7],
                [16, 7], [17, 7], [17, 10],
                [15, 11], [14, 11], [17, 16],
                [16, 16], [13, 16], [12, 16],
                [11, 16], [10, 16], [2, 16],
                [10, 8], [11, 8], [9, 8]  
            ]
        }
    };

    let currentMap = 'city';

    class GameWorld {
        constructor(mapKey) {
            this.loadMap(mapKey);
        }

        loadMap(mapKey) {
            const mapData = maps[mapKey];
            this.mapImage = new Image();
            this.mapImage.src = mapData.mapImage;
            this.upperImage = new Image();
            this.upperImage.src = mapData.upperImage;
            this.mapWidth = mapData.mapWidth;
            this.mapHeight = mapData.mapHeight;
            this.teleportZone = mapData.teleportZone;
            this.teleportTarget = mapData.teleportTarget;
            this.hasNPC = mapData.hasNPC;
            this.blockedTilesData = mapData.blockedTiles; 
        }

        drawBackground(ctx, cameraX, cameraY) {
            ctx.drawImage(this.mapImage, -cameraX, -cameraY, this.mapWidth, this.mapHeight);
        }

        drawUpper(ctx, cameraX, cameraY) {
            ctx.drawImage(this.upperImage, -cameraX, -cameraY, this.mapWidth, this.mapHeight);
        }
    }

    class CollisionMap {
       
        constructor(collisionData) {
            this.blockedTiles = new Set();
            collisionData.forEach(([c, r]) => this.blockedTiles.add(`${c},${r}`));
        }

        isBlocked(x, y) {
            const col = Math.floor(x / 32), row = Math.floor(y / 32);
            return this.blockedTiles.has(`${col},${row}`);
        }
    }

    class Player {
        constructor(mapWidth, mapHeight, collisionMapInstance) { 
            this.frameWidth = 162;
            this.frameHeight = 233;
            this.width = 32;
            this.height = 46;
            const start = { col: 15, row: 12 };
            this.x = start.col * 32;
            this.y = start.row * 32;
            this.image = new Image();
            this.image.src = 'assets/characters/edward_elric.png';
            this.shadowImage = new Image();
            this.shadowImage.src = 'assets/characters/shadow.png';
            this.shadowWidth = 35;
            this.shadowHeight = 42;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 2;
            this.fps = 8;
            this.frameInterval = 1000 / this.fps;
            this.frameTimer = 0;
            this.speed = 3;
            this.velocityX = 0;
            this.velocityY = 0;
            this.mapWidth = mapWidth;
            this.mapHeight = mapHeight;
            this.collisionMap = collisionMapInstance; 
            this.name = "Edward Elric";
            this.maxHealth = 100;
            this.currentHealth = 75;
        }

        update(input, deltaTime, npc) {
            this.velocityX = this.velocityY = 0;
            if (input.keys['ArrowRight']) { this.velocityX = this.speed; this.frameY = 3; }
            else if (input.keys['ArrowLeft']) { this.velocityX = -this.speed; this.frameY = 2; }
            else if (input.keys['ArrowUp']) { this.velocityY = -this.speed; this.frameY = 1; }
            else if (input.keys['ArrowDown']) { this.velocityY = this.speed; this.frameY = 0; }
            if (this.velocityX !== 0 || this.velocityY !== 0) {
                if (this.frameTimer > this.frameInterval) {
                    this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
                    this.frameTimer = 0;
                } else this.frameTimer += deltaTime;

                const nextX = this.x + this.velocityX;
                const nextY = this.y + this.velocityY;
                const future = { x: nextX, y: nextY, width: this.width, height: this.height };
                const npcRect = npc ? { x: npc.x, y: npc.y, width: npc.width, height: npc.height } : null;
                
                if (!this.collisionMap.isBlocked(nextX, nextY) && (!npc || !isColliding(future, npcRect))) {
                    this.x = nextX; this.y = nextY;
                }
            } else this.frameX = 1;

            this.x = Math.max(0, Math.min(this.x, this.mapWidth - this.width));
            this.y = Math.max(0, Math.min(this.y, this.mapHeight - this.height));
        }

        draw(ctx, cameraX, cameraY) {
            ctx.drawImage(this.shadowImage, this.x - cameraX, this.y - cameraY, this.shadowWidth, this.shadowHeight);
            ctx.drawImage(this.image,
                this.frameX * this.frameWidth, this.frameY * this.frameHeight, this.frameWidth, this.frameHeight,
                this.x - cameraX, this.y - cameraY, this.width, this.height);
        }
    }

    class NPC {
        constructor(mapWidth, mapHeight, collisionMap, xs, ys, xe, ye, speed = 1) {
            this.frameWidth = 162;
            this.frameHeight = 233;
            this.width = 32;
            this.height = 46;
            this.x = xs; this.y = ys;
            this.xStart = xs; this.yStart = ys;
            this.xEnd = xe; this.yEnd = ye;
            this.image = new Image();
            this.image.src = 'assets/characters/alphonse_elric - Copia.png';
            this.shadowImage = new Image();
            this.shadowWidth = 35; this.shadowHeight = 42;
            this.frameX = 0; this.frameY = 0;
            this.maxFrame = 2; this.fps = 8;
            this.frameInterval = 1000 / this.fps; this.frameTimer = 0;
            this.speed = speed;
            this.mapWidth = mapWidth; this.mapHeight = mapHeight;
            this.collisionMap = collisionMap; 
            this.collidingWithPlayer = false;
        }

        update(deltaTime, player) {
            const dx = this.xEnd - this.x, dy = this.yEnd - this.y;
            const dist = Math.hypot(dx, dy);
            const pRect = { x: player.x, y: player.y, width: player.width, height: player.height };
            const nRect = { x: this.x, y: this.y, width: this.width, height: this.height };
            this.collidingWithPlayer = isColliding(pRect, nRect);
            if (!this.collidingWithPlayer && dist > 1) {
                const dirX = dx / dist, dirY = dy / dist;
                const nextX = this.x + dirX * this.speed;
                const nextY = this.y + dirY * this.speed;
                if (!this.collisionMap.isBlocked(nextX, nextY)) {
                    this.x = nextX;
                    this.y = nextY;
                } else {
                    [this.xStart, this.xEnd] = [this.xEnd, this.xStart];
                    [this.yStart, this.yEnd] = [this.yEnd, this.yStart];
                }

                this.frameY = Math.abs(dx) > Math.abs(dy)
                    ? (dirX > 0 ? 3 : 2)
                    : (dirY > 0 ? 0 : 1);

                if (this.frameTimer > this.frameInterval) {
                    this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
                    this.frameTimer = 0;
                } else this.frameTimer += deltaTime;
            } else if (dist <= 1) {
                [this.xStart, this.xEnd] = [this.xEnd, this.xStart];
                [this.yStart, this.yEnd] = [this.yEnd, this.yStart];
            }

            this.x = Math.max(0, Math.min(this.x, this.mapWidth - this.width));
            this.y = Math.max(0, Math.min(this.y, this.mapHeight - this.height));
        }

        draw(ctx, cameraX, cameraY) {
            ctx.drawImage(this.shadowImage, this.x - cameraX, this.y - cameraY, this.shadowWidth, this.shadowHeight);
            ctx.drawImage(this.image,
                this.frameX * this.frameWidth, this.frameY * this.frameHeight, this.frameWidth, this.frameHeight,
                this.x - cameraX, this.y - cameraY, this.width, this.height);
            if (this.collidingWithPlayer) {
                const bw = 40, bh = 30;
                const bx = this.x - cameraX + this.width / 2 - bw / 2;
                const by = this.y - cameraY - bh + 5;
                ctx.drawImage(speechBubble, bx, by, bw, bh);
            }
        }
    }

    function drawPlayerStatus(ctx, player) {
        const bx = 10, by = 10, bw = 200, bh = 70;
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = 'white'; ctx.strokeRect(bx, by, bw, bh);
        ctx.drawImage(headGif, bx + 5, by + 5, 48, 48);
        ctx.fillStyle = 'white'; ctx.font = '48px game over';
        ctx.fillText(player.name, bx + 60, by + 20);
        const lp = player.currentHealth / player.maxHealth;
        ctx.fillStyle = 'red';
        ctx.fillRect(bx + 60, by + 30, 120, 10);
        ctx.fillStyle = 'limegreen';
        ctx.fillRect(bx + 60, by + 30, 120 * lp, 10);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(bx + 60, by + 30, 120, 10);
    }

    class FlashEffect {
        constructor() {
            this.alpha = 0;
            this.fadeInDuration = 300;
            this.fadeOutDuration = 300;
            this.holdDuration = 100;
            this.currentTime = 0;
            this.active = false;
        }

        start() {
            this.active = true;
            this.currentTime = 0;
            this.alpha = 0;
        }

        update(deltaTime) {
            if (!this.active) return;

            this.currentTime += deltaTime;

            if (this.currentTime < this.fadeInDuration) {
                this.alpha = this.currentTime / this.fadeInDuration;
            } else if (this.currentTime < this.fadeInDuration + this.holdDuration) {
                this.alpha = 1;
            } else if (this.currentTime < this.fadeInDuration + this.holdDuration + this.fadeOutDuration) {
                const fadeOutTime = this.currentTime - (this.fadeInDuration + this.holdDuration);
                this.alpha = 1 - (fadeOutTime / this.fadeOutDuration);
            } else {
                this.active = false;
                this.alpha = 0;
            }
        }

        draw(ctx) {
            if (!this.active) return;
            ctx.save();
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            ctx.restore();
        }
    }

    const input = new InputHandler();
    const world = new GameWorld(currentMap);
    let collisionMap = new CollisionMap(world.blockedTilesData); 
    const player = new Player(world.mapWidth, world.mapHeight, collisionMap); 
    const flashEffect = new FlashEffect();

    let npc = null;
    if (world.hasNPC) {
        npc = new NPC(world.mapWidth, world.mapHeight, collisionMap, 10 * 32, 13 * 32, 13 * 32, 13 * 32);
    }

    let lastTime = 0, showDialog = false;
    const dialogLines = ["Hi brother!", "Have you considered going to GitHub.com/PedroWilsonRL?"];
    let currentLineIndex = 0, currentCharIndex = 0, currentDisplayedText = "";
    const typingSpeed = 50;
    let lastTypingTime = 0, isTyping = false;
    let isTeleporting = false;
    let showMenu = false; 
    let selectedMenuOption = 0; 
    const menuOptions = ["Progress", "Map", "Bag", "Exit"]; 

    function teleportTo(mapKey, startCol, startRow) {
        isTeleporting = true;
        flashEffect.start();

        setTimeout(() => {
            currentMap = mapKey;
            world.loadMap(mapKey); 
            collisionMap = new CollisionMap(world.blockedTilesData); 
            player.collisionMap = collisionMap;
            if (npc) { 
                npc.collisionMap = collisionMap;
            }

            player.mapWidth = world.mapWidth;
            player.mapHeight = world.mapHeight;
            player.x = startCol * 32;
            player.y = startRow * 32;

            if (world.hasNPC) {
                if (!npc) {
                    npc = new NPC(world.mapWidth, world.mapHeight, collisionMap, 10 * 32, 13 * 32, 13 * 32, 13 * 32);
                } else {
                    npc.mapWidth = world.mapWidth;
                    npc.mapHeight = world.mapHeight;
                    npc.collisionMap = collisionMap;
                }
            } else {
                npc = null;
                showDialog = false;
            }
            isTeleporting = false;
        }, flashEffect.fadeInDuration + flashEffect.holdDuration);
    }

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        if (input.justPressed['Enter']) {
            showMenu = !showMenu;
            if (showMenu) {
                selectedMenuOption = 0; 
            }
        }

        if (showMenu) {
            if (input.justPressed['ArrowUp']) {
                selectedMenuOption = (selectedMenuOption - 1 + menuOptions.length) % menuOptions.length;
            } else if (input.justPressed['ArrowDown']) {
                selectedMenuOption = (selectedMenuOption + 1) % menuOptions.length;
            }

            if (input.justPressed['x']) {
                const selectedOptionText = menuOptions[selectedMenuOption];
                console.log(`Opção selecionada: ${selectedOptionText}`); 

                switch (selectedOptionText) {
                    case "Progress":
                        console.log("Ação: Abrir tela de Progresso.");
                        break;
                    case "Map":
                        console.log("Ação: Abrir tela do Mapa.");
                        break;
                    case "Bag":
                        console.log("Ação: Abrir tela do Inventário.");
                        break;
                    case "Exit":
                        showMenu = false;
                        console.log("Ação: Fechar Menu.");
                        break;
                }
            }
        }


        if (!isTeleporting && !showMenu) { 
            player.update(input, deltaTime, npc);

            if (npc) {
                npc.update(deltaTime, player);
            }

            const playerCol = Math.floor(player.x / 32);
            const playerRow = Math.floor(player.y / 32);
            const zone = world.teleportZone;
            if (
                playerCol >= zone.col &&
                playerCol < zone.col + zone.width &&
                playerRow >= zone.row &&
                playerRow < zone.row + zone.height &&
                world.teleportTarget
            ) {
                teleportTo(
                    world.teleportTarget.mapKey,
                    world.teleportTarget.startCol,
                    world.teleportTarget.startRow
                );
            }
        }

        const zoomedGameWidth = GAME_WIDTH / CAMERA_ZOOM;
        const zoomedGameHeight = GAME_HEIGHT / CAMERA_ZOOM;

        const camX = Math.max(0, Math.min(player.x + player.width / 2 - zoomedGameWidth / 2, world.mapWidth - zoomedGameWidth));
        const camY = Math.max(0, Math.min(player.y + player.height / 2 - zoomedGameHeight / 2, world.mapHeight - zoomedGameHeight));

        ctx.save(); 
        ctx.scale(CAMERA_ZOOM, CAMERA_ZOOM); 

        world.drawBackground(ctx, camX, camY);
        if (npc) {
            npc.draw(ctx, camX, camY);
        }
        player.draw(ctx, camX, camY);
        world.drawUpper(ctx, camX, camY);

        ctx.restore(); 

        drawPlayerStatus(ctx, player);

if (npc && npc.collidingWithPlayer && input.justPressed['z']) {
    if (!showDialog) {
        showDialog = true;
        currentLineIndex = 0;
        currentCharIndex = 0;
        currentDisplayedText = '';
        isTyping = true;
        lastTypingTime = performance.now();
    } else if (isTyping) {
        currentCharIndex = dialogLines[currentLineIndex].length;
        currentDisplayedText = dialogLines[currentLineIndex];
        isTyping = false;
    } else {
        if (currentLineIndex < dialogLines.length - 1) {
            currentLineIndex++;
            currentCharIndex = 0;
            currentDisplayedText = '';
            isTyping = true;
            lastTypingTime = performance.now();
        } else {
            showDialog = false;
            currentLineIndex = 0;
            currentCharIndex = 0;
            currentDisplayedText = '';
        }
    }
}



        if (showDialog && !showMenu) { 
    const w = 782, h = 170;
    const x = (GAME_WIDTH - w) / 2;
    const y = GAME_HEIGHT - h - 20;
    ctx.drawImage(dialogBox, x, y, w, h);
    ctx.fillStyle = 'black';
    ctx.font = '63px game over';
    const fullText = dialogLines[currentLineIndex];

    if (isTyping && timeStamp - lastTypingTime > typingSpeed) {
        currentCharIndex++;
        currentDisplayedText = fullText.substring(0, currentCharIndex);
        lastTypingTime = timeStamp;

        if (currentCharIndex >= fullText.length) {
            isTyping = false;
        }
    }

    ctx.fillText(currentDisplayedText, x + 50, y + 85);
}


        if (showMenu) {
            const menuWidth = menuImage.width;
            const menuHeight = menuImage.height;
            const margin = 20; 
            const finalMenuX = GAME_WIDTH - menuWidth - margin;
            const finalMenuY = (GAME_HEIGHT - menuHeight) / 2; 

            ctx.drawImage(menuImage, finalMenuX, finalMenuY);

            ctx.fillStyle = 'black'; 
            ctx.font = '52px Game Over'; 
            ctx.textAlign = 'center'; 
            ctx.textBaseline = 'middle'; 

            const lineHeight = 60; 

            const menuCenterX = finalMenuX + menuWidth / 2;
            const menuCenterY = finalMenuY + menuHeight / 2;

            const totalMenuOptionsHeight = menuOptions.length * lineHeight;

            const initialTextY = menuCenterY - (totalMenuOptionsHeight / 2) + (lineHeight / 2); 

            menuOptions.forEach((option, index) => {
                const textY = initialTextY + (index * lineHeight);
                
                if (index === selectedMenuOption) {
                    ctx.fillStyle = 'black'; 
                    ctx.fillText(`> ${option} <`, menuCenterX, textY); 
                    ctx.fillStyle = 'black'; 
                } else {
                    ctx.fillText(option, menuCenterX, textY); 
                }
            });
            ctx.textAlign = 'start'; 
            ctx.textBaseline = 'alphabetic'; 
        }


        flashEffect.update(deltaTime);
        flashEffect.draw(ctx);

        input.clearPressed();
        requestAnimationFrame(animate);
    }

    animate(0);
});
